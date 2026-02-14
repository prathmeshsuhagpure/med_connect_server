const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  },
  razorpayOrderId: {
    type: String,
    default: null,
    unique: true, 
  },
  razorpayPaymentId: {
    type: String,
    default: null
  },
  razorpaySignature: {
    type: String,
    default: null
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['created', 'authorized', 'captured', 'refunded', 'failed'],
    default: 'created'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet'],
    default: 'upi'
  },
  refundId: {
    type: String,
    default: null
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

paymentSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment