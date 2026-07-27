const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medical_store';
        cached.promise = mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000
        }).then((mongoose) => {
            console.log(`MongoDB Connected: ${mongoose.connection.host}`);
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (e) {
        cached.promise = null;
        console.error(`Error: ${e.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
