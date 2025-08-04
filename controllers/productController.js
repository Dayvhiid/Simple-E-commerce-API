import Product from "../models/Product.js";

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Error fetching products" });
    }
};
export const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Error fetching product" });
    }
};

export const createProduct = async (req, res) => {
    const { name, price, description,quantity } = req.body;  
    const userId = req.user._id; // Get user ID from authenticated user
    try {
        const newProduct = new Product({
            name,
            price,
            description,
            userId,
            quantity
        });
        await newProduct.save();
        res.status(201).json({ message: "Product created successfully", product: newProduct });
    }
    catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Server error" });
    }   
};

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, price, description, quantity } = req.body;    
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        // Only allow update if the user is the owner of the product
        if (product.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to update this product" });
        }
        product.name = name || product.name;
        product.price = price || product.price;
        product.description = description || product.description;
        product.quantity = quantity || product.quantity;
        await product.save();
        res.status(200).json({ message: "Product updated successfully", product });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        // Only allow deletion if the user is the owner of the product
        if (product.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this product" });
        }
        await product.remove();
        res.status(200).json({ message: "Product deleted successfully" });
    }   catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getUserProducts = async (req, res) => {
    const userId = req.user._id;
    try {
        const products = await Product.find({ userId });
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching user products:", error);
        res.status(500).json({ message: "Server error" });
    } 
};