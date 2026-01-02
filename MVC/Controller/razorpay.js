import Razorpay from "razorpay";
import crypto from "crypto";
import 'dotenv/config';
import { Order } from "../Model/Payment.model.js";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay Order
export const PaymentProccesing = async (req, res) => {
    try {
        const { amount, cartItems } = req.body;
        const UserId = req.user._id; // from auth middleware

        if (!cartItems || !cartItems.length) return res.status(400).json({ success: false, message: "Cart is empty" });

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // Save order in MongoDB
        const orderProducts = cartItems.map(item => ({
            productId: item.productId._id,
            name: item.productId.productsName,
            price: item.price,
            quantity: item.quantity,
            image: item.productId.productsImg?.[0]?.url || "", // store first image
        }));

        const order = await Order.create({
            UserId,
            products: orderProducts,
            totalAmount: amount,
            razorpayOrderId: razorpayOrder.id,
            paymentStatus: "created",
        });

        res.status(200).json({ success: true, order });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Payment initiation failed" });
    }
};

// Payment verification
export const paymentVerification = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature)
            return res.status(400).json({ success: false, message: "Invalid signature" });

        const order = await Order.findOneAndUpdate(
            { razorpayOrderId: razorpay_order_id },
            { razorpayPaymentId: razorpay_payment_id, paymentStatus: "paid" },
            { new: true }
        );

        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        res.status(200).json({ success: true, order });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
};


// Get latest user order
export const getLatestUserOrder = async (req, res) => {
    try {
        const UserId = req.user._id;

        const order = await Order.findOne({ UserId, paymentStatus: "paid" })
            .sort({ createdAt: -1 });

        if (!order) return res.status(404).json({ success: false, message: "No orders found" });

        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
};


// Get all orders

export const AllProducts = async (req, res) => {
    try {
        const UserId = req.user._id;

        const orders = await Order.find({paymentStatus: "paid"}).populate("UserId" , "firstName email");

        if (!orders || orders.length === 0)
            return res.status(404).json({ success: false, message: "No orders found" });

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
};


export const AllProductsWithpading = async (req, res) => {
    try {
        const UserId = req.user._id;

        const orders = await Order.find({paymentStatus: [ "paid" , "created", "panding"]}).populate("UserId" , "firstName email");

        if (!orders || orders.length === 0)
            return res.status(404).json({ success: false, message: "No orders found" });

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
};
