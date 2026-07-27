const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    generic_name: {
        type: String,
    },
    batch_no: {
        type: String,
    },
    expiry_date: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 0,
    },
    price: {
        type: Number,
        required: true,
    },
    manufacturer: {
        type: String,
    },
});

// Transform _id to id when sending to frontend
medicineSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

const Medicine = mongoose.model('Medicine', medicineSchema);
module.exports = Medicine;
