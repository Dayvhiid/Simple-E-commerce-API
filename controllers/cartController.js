import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id })
            .populate('items.productId', 'name price description quantity');
        
        if (!cart) {
            return res.status(200).json({ items: [], totalAmount: 0 });
        }

      
        const totalAmount = cart.items.reduce((total, item) => {
            return total + (item.productId.price * item.quantity);
        }, 0);

        res.status(200).json({ 
            items: cart.items, 
            totalAmount: totalAmount.toFixed(2) 
        });
    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const addToCart = async (req, res) => {
    const { productId, quantity = 1 } = req.body;
    
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        if (product.quantity < quantity) {
            return res.status(400).json({ message: "Insufficient stock" });
        }

        let cart = await Cart.findOne({ userId: req.user._id });
        
        if (!cart) {
            // Create new cart
            cart = new Cart({
                userId: req.user._id,
                items: [{ productId, quantity }]
            });
        } else {
          
            const existingItemIndex = cart.items.findIndex(
                item => item.productId.toString() === productId
            );
            
            if (existingItemIndex > -1) {
             
                const newQuantity = cart.items[existingItemIndex].quantity + quantity;
                if (product.quantity < newQuantity) {
                    return res.status(400).json({ message: "Insufficient stock" });
                }
                cart.items[existingItemIndex].quantity = newQuantity;
            } else {
           
                cart.items.push({ productId, quantity });
            }
        }
        
        await cart.save();
        res.status(200).json({ message: "Item added to cart successfully" });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateCartItem = async (req, res) => {
    const { productId, quantity } = req.body;
    
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        if (product.quantity < quantity) {
            return res.status(400).json({ message: "Insufficient stock" });
        }

        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        
        const itemIndex = cart.items.findIndex(
            item => item.productId.toString() === productId
        );
        
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item not found in cart" });
        }
        
        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        
        res.status(200).json({ message: "Cart item updated successfully" });
    } catch (error) {
        console.error("Error updating cart item:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const removeFromCart = async (req, res) => {
    const { productId } = req.params;
    
    try {
        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        
        cart.items = cart.items.filter(
            item => item.productId.toString() !== productId
        );
        
        await cart.save();
        res.status(200).json({ message: "Item removed from cart successfully" });
    } catch (error) {
        console.error("Error removing from cart:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const clearCart = async (req, res) => {
    try {
        await Cart.findOneAndUpdate(
            { userId: req.user._id },
            { items: [] }
        );
        
        res.status(200).json({ message: "Cart cleared successfully" });
    } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({ message: "Server error" });
    }
};