const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
    medicine_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    }
});

const billSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    total_amount: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    net_amount: {
        type: Number,
        required: true
    },
    customer_name: {
        type: String,
        default: 'Walk-in Customer'
    },
    items: [billItemSchema]
});

// Transform _id to id when sending to frontend
billSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        
        if (ret.items) {
            ret.items = ret.items.map(item => {
                item.id = item._id;
                delete item._id;
                return item;
            });
        }
    }
});

const Bill = mongoose.model('Bill', billSchema);
module.exports = Bill;
