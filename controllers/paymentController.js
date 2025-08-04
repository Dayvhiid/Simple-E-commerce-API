import axios from 'axios';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { v4 as uuidv4 } from 'uuid';

export const initiatePayment = async (req, res) => {
    try {
        const { shippingAddress, phone } = req.body;
        const userId = req.user._id;
        
        // Get user's cart
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // Validate stock availability
        for (let item of cart.items) {
            const product = await Product.findById(item.productId._id);
            if (product.quantity < item.quantity) {
                return res.status(400).json({ 
                    message: `Insufficient stock for ${product.name}` 
                });
            }
        }

        // Calculate total amount
        const totalAmount = cart.items.reduce((total, item) => {
            return total + (item.productId.price * item.quantity);
        }, 0);

        // Generate unique payment reference
        const paymentReference = `PAY_${Date.now()}_${uuidv4().substring(0, 8)}`;

        // Create order
        const order = new Order({
            userId,
            items: cart.items.map(item => ({
                productId: item.productId._id,
                quantity: item.quantity,
                price: item.productId.price
            })),
            totalAmount,
            paymentReference,
            customerEmail: req.user.email,
            customerPhone: phone,
            shippingAddress
        });

        await order.save();

        // Prepare Flutterwave payment payload
        const payload = {
            tx_ref: paymentReference,
            amount: totalAmount,
            currency: "NGN",
            redirect_url: `${process.env.FRONTEND_URL}/payment/callback`,
            payment_options: "card,banktransfer,ussd",
            customer: {
                email: req.user.email,
                phonenumber: phone,
                name: req.user.name
            },
            customizations: {
                title: "E-commerce Payment",
                description: "Payment for order items"
            }
        };

        // Make direct API call to Flutterwave
        const response = await axios.post(
            'https://api.flutterwave.com/v3/payments',
            payload,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.status === 'success') {
            res.status(200).json({
                message: "Payment initialized successfully",
                paymentUrl: response.data.data.link,
                reference: paymentReference
            });
        } else {
            await Order.findByIdAndDelete(order._id);
            res.status(400).json({ 
                message: "Payment initialization failed",
                error: response.data.message 
            });
        }

    } catch (error) {
        console.error("Error initiating payment:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { reference } = req.params;

        const order = await Order.findOne({ paymentReference: reference });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Verify payment using tx_ref (our reference) instead of transaction ID
        const response = await axios.get(
            `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${reference}`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.status === 'success' && response.data.data.status === 'successful') {
            order.paymentStatus = 'completed';
            order.flutterwaveRef = response.data.data.flw_ref;
            order.paidAt = new Date();
            await order.save();

            // Update product quantities
            for (let item of order.items) {
                await Product.findByIdAndUpdate(
                    item.productId,
                    { $inc: { quantity: -item.quantity } }
                );
            }

            // Clear user's cart
            await Cart.findOneAndUpdate(
                { userId: order.userId },
                { items: [] }
            );

            res.status(200).json({
                message: "Payment verified successfully",
                order
            });
        } else {
            order.paymentStatus = 'failed';
            await order.save();
            res.status(400).json({ message: "Payment verification failed" });
        }

    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getOrderHistory = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id })
            .populate('items.productId', 'name price')
            .sort({ createdAt: -1 });

        res.status(200).json({ orders });
    } catch (error) {
        console.error("Error fetching order history:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findOne({ 
            _id: orderId, 
            userId: req.user._id 
        }).populate('items.productId', 'name price description');

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ order });
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ message: "Server error" });
    }
};


export const handleWebhook = async (req, res) => {
    try {
        const secretHash = process.env.FLW_SECRET_HASH;
        const signature = req.headers["verif-hash"];
        
        if (!signature || (signature !== secretHash)) {
           
            return res.status(401).end();
        }
        
        const payload = req.body;
        
       
        console.log("Webhook received:", payload);
        
        if (payload.event === "charge.completed") {
            // Find the order by tx_ref
            const order = await Order.findOne({ 
                paymentReference: payload.data.tx_ref 
            });
            
            if (!order) {
                console.log("Order not found for tx_ref:", payload.data.tx_ref);
                return res.status(404).end();
            }
            
            // Verify the payment amount
            if (payload.data.amount === order.totalAmount && 
                payload.data.status === "successful") {
                
                // Update order status
                order.paymentStatus = 'completed';
                order.flutterwaveRef = payload.data.flw_ref;
                order.paidAt = new Date();
                await order.save();
                
    
                for (let item of order.items) {
                    await Product.findByIdAndUpdate(
                        item.productId,
                        { $inc: { quantity: -item.quantity } }
                    );
                }
                
                // Clear user's cart
                await Cart.findOneAndUpdate(
                    { userId: order.userId },
                    { items: [] }
                );
                
                console.log("Payment completed for order:", order._id);
            }
        }
        
        res.status(200).end();
    } catch (error) {
        console.error("Webhook error:", error);
        res.status(500).end();
    }
};