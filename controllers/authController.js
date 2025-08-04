import bcrypt from "bcryptjs";
import User from "../models/User.js";


export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const newUser = new User({ name, email, password });
        await newUser.save();
        
        // Generate JWT token for the newly registered user
        const token = newUser.generateAuthToken();
        
        res.status(201).json({ 
            message: "User registered successfully",
            token,
            user: { id: newUser._id, name: newUser.name, email: newUser.email }
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = user.generateAuthToken();
        res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: "Server error" });
    }   
};