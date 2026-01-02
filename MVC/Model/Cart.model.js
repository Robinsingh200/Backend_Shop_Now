import mongoose from 'mongoose'

const CartData =  new mongoose.Schema({
        UserId: { 
               type: mongoose.Schema.ObjectId,
               ref: "User",
               required: true,
               unique:true
        },

        item: [{

            productId: {
              type: mongoose.Schema.ObjectId,
              ref: "Products",
               required: true,
            },

            quantity: {
              type: Number,
               required: true,
               default: 1
            },

            price: {
              type: Number,
               required: true,
            },

        }],

        totalPrice: {
               type: Number,
               default: 0
        }


},{timestamps:true})



const ItemCart = mongoose.model("Item" , CartData);

export default ItemCart