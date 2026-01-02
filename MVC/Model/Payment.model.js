import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  UserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Products" },
      name: String,
      price: Number,
      quantity: Number,
      image: String, 
    },
  ],
  totalAmount: Number,
  paymentStatus: { type: String, enum: ["created", "paid", "failed"], default: "created" },
  razorpayOrderId: String,
  razorpayPaymentId: String,
}, { timestamps: true });

export const Order = mongoose.model("Order", orderSchema);
