const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    saree: { type: mongoose.Schema.Types.ObjectId, ref: 'Saree', required: true },
    qty: { type: Number, required: true, min: 1, default: 1 },
    priceAtPurchase: { type: Number, required: true, min: 0 },
    title: { type: String, default: '' } // snapshot (description)
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    items: { type: [orderItemSchema], required: true },

    total: { type: Number, required: true, min: 0 },

    paymentMethod: { type: String, enum: ['CASH', 'CARD'], required: true },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID'], default: 'PENDING' },
    cardLast4: { type: String, default: '' },

    // stages requested: pending, verifying, accepted, done
    status: { type: String, enum: ['PENDING', 'VERIFYING', 'ACCEPTED', 'DONE', 'REJECTED'], default: 'PENDING' },

    // snapshot delivery details from user profile at order time
    deliveryLocation: { type: String, default: '' },
    deliveryEtaDays: { type: Number, default: 3 },

    note: { type: String, default: '' } // admin note / reason
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
