import mongoose from "mongoose";
import products from './data.js'; // Ensure the correct path to data.js
import Product from "../models/product.js"; // Ensure the correct path to product.js

const seedProducts = async () => {
    try {
        // Connect to MongoDB (options removed as they are no longer needed)
        await mongoose.connect("mongodb://localhost:27017/web-it-shop");

        // Delete all existing products
        await Product.deleteMany();
        console.log('Products have been deleted');

        // Insert new products
        await Product.insertMany(products);
        console.log('Products have been added');

        // Exit the process
        process.exit();

    } catch (error) {
        console.log(error.message);
        process.exit(1); // Exit with failure
    }
};

seedProducts();
