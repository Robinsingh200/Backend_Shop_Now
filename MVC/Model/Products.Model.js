import mongoose from "mongoose";

const ProductsData = new mongoose.Schema({
      UserId: {
            type: mongoose.Schema.ObjectId,
            ref: "User"
      },

      productsName: {
            type: String,
            required: true
      },

      productDescription: {
            type: String,
            required: true
      },

      productsImg: [
            {
                  url: {
                        type: String,
                        required: true
                  },
                  imageId: {
                        type: String,
                        required: true
                  }
            }
      ],

      productsPrice: {
            type: Number,
            required: true
      },

      Category: {
            type: String,
      },
      BrandName: {
            type: String,
      },
      rating: {
            type: String,
            default: 0
      },

      // for product 's

      gender: {
            type: String,
            lowercase: true
      },

      color: {
            type: String,
            lowercase: true
      },

      size: {
            type: String
      },
      category: {
            type: String,
            lowercase: true,
            index: true
      },

}, { timestamps: true })


export const ProductsDetails = mongoose.model("Products", ProductsData)