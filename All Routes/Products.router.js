import { createProduct , deleteProduct, getAllProducts, updateProduct } from "../MVC/Controller/Products.controller.js";
import express from 'express'
import { IsAdmin, isAuthcated } from "../MiddleWare/Isauthentics.logout.js";
import { MultipleUpload } from "../MiddleWare/Multer.js";

const products_router = express.Router()

products_router.post('/admin/addProducts', isAuthcated ,MultipleUpload, IsAdmin, createProduct )

products_router.delete('/admin/delete/:productId', isAuthcated , IsAdmin, deleteProduct )

products_router.patch('/admin/update/:productId', isAuthcated , IsAdmin, MultipleUpload, updateProduct )

products_router.get('/products', getAllProducts )

export default products_router
