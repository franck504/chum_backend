const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;

    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        isConnected = !!conn.connections[0].readyState;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        // Ne pas appeler process.exit(1) sur Vercel !
        throw error;
    }
};

module.exports = connectDB;
