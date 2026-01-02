import express from 'express'
import { AllProducts, AllProductsWithpading, getLatestUserOrder, PaymentProccesing, paymentVerification} from '../MVC/Controller/razorpay.js'
import { isAuthcated } from '../MiddleWare/Isauthentics.logout.js'

export const paymentrouter = express.Router()

paymentrouter.post('/shop-products/card-shop/payment' ,isAuthcated, PaymentProccesing)
paymentrouter.post('/shop-products/card-shop/paymentVerification' , paymentVerification)
paymentrouter.get("/shop-products/card-shop/latest", isAuthcated, getLatestUserOrder);
paymentrouter.get("/shop-products/card-shop/alldata", isAuthcated, AllProducts);
paymentrouter.get("/shop-products/card-shop/Allorder", isAuthcated, AllProductsWithpading);