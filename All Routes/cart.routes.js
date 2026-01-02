import express from 'express'
import { AddToCart, cartUpdate, getCart, removeItem } from '../MVC/Controller/CartProduct.js';
import { isAuthcated } from '../MiddleWare/Isauthentics.logout.js';

const cartRouter = express.Router();


cartRouter.get('/cartItem',isAuthcated, getCart)

cartRouter.post('/cartAdd',isAuthcated, AddToCart)

cartRouter.patch('/cartupdate',isAuthcated, cartUpdate)

cartRouter.delete('/cartRemove',isAuthcated, removeItem)


export default cartRouter