const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/payment_model');
const Appointment = require('../models/appointment_model');


const getRazorpayInstance = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('Razorpay credentials are missing');
    }

    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

const createRazorpayOrder = async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
        }

        const { amount, appointmentId } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount',
            });
        }

        const razorpay = getRazorpayInstance();
        const amountInPaise = Math.round(amount * 100);

        const order = await razorpay.orders.create({
            amount: amountInPaise,
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1,
        });

        const payment = await Payment.create({
            patientId: req.user._id,
            razorpayOrderId: order.id,
            amount,
            status: 'created',
            paymentMethod: 'card',
            appointmentId: appointmentId,
        });

        res.status(201).json({
            success: true,
            orderId: order.id,
            paymentId: payment._id,
            amount,
        });
    } catch (error) {
        console.error('Create Razorpay order error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            stack: error.stack,
        });
    }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay verification data",
      });
    }

    // 🔐 Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // ✅ Find payment
    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    // ✅ Update payment fields
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = "captured";

    // ✅ If appointment already exists → confirm it
    if (payment.appointmentId) {
      await Appointment.findByIdAndUpdate(
        payment.appointmentId,
        { status: "confirmed" }
      );
    }

    await payment.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      paymentId: payment._id,
      appointmentId: payment.appointmentId || null,
    });

  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getPaymentHistory = async (req, res) => {
    try {
        const payments = await Payment.find({ patientId: req.user._id })
            .populate('appointmentId')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            payments,
        });
    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment history',
        });
    }
};

const getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findOne({
            _id: req.params.paymentId,
            userId: req.user._id,
        }).populate('bookingId');

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
        }

        res.status(200).json({
            success: true,
            payment,
        });
    } catch (error) {
        console.error('Get payment by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment',
        });
    }
};

const refundPayment = async (req, res) => {
    try {
        const { paymentId, amount, reason } = req.body;
        const razorpay = getRazorpayInstance();

        const payment = await Payment.findOne({
            _id: paymentId,
            userId: req.user._id,
        });

        if (!payment || !payment.razorpayPaymentId) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found or not captured',
            });
        }

        if (payment.status === 'refunded') {
            return res.status(400).json({
                success: false,
                message: 'Payment already refunded',
            });
        }

        const refund = await razorpay.payments.refund(
            payment.razorpayPaymentId,
            {
                amount: Math.round(amount * 100),
                notes: { reason },
            }
        );

        payment.status = 'refunded';
        payment.refundId = refund.id;
        payment.refundAmount = amount;
        payment.refundReason = reason;
        await payment.save();

        res.status(200).json({
            success: true,
            message: 'Refund successful',
        });
    } catch (error) {
        console.error('Refund error:', error);
        res.status(500).json({
            success: false,
            message: 'Refund failed',
        });
    }
};

module.exports = {
    createRazorpayOrder,
    verifyRazorpayPayment,
    getPaymentHistory,
    getPaymentById,
    refundPayment,
};
