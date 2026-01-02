import { ProductsDetails } from "../Model/Products.Model.js";
import cloudinary from "../../utils/Cloudnery.js";

// Create Product

export const createProduct = async (req, res) => {
    try {
        const { productsName, productDescription, productsPrice, Category, BrandName, rating } = req.body;
        const userId = req.user._id;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: "At least one image is required" });
        }

        // Upload images to Cloudinary
        const uploadedImages = [];
        for (const file of req.files) {
            const result = await cloudinary.uploader.upload_stream({ folder: "products" }, (error, result) => {
                if (error) throw new Error(error.message);
                return result;
            });
        }

        for (const file of req.files) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({ folder: "products" }, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
                stream.end(file.buffer);
            });

            uploadedImages.push({ url: result.secure_url, imageId: result.public_id });
        }

        const product = await ProductsDetails.create({
            userId,
            productsName,
            productDescription,
            productsImg: uploadedImages,
            productsPrice,
            Category,
            BrandName,
            rating
        });

        res.status(201).json({ success: true, product });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// Get All Products

export const getAllProducts = async (req, res) => {
    try {
        const products = await ProductsDetails.find()
        if (!products) {
            return res.status(404).json({
                success: false,
                message: "No Products available",
                products: []
            })
        }
        return res.status(200).json({
            success: true,
            message: "Product Added",
            products
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



// Get Single Product
export const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await ProductsDetails.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // 🔥 Delete images from Cloudinary safely
        if (product.productsImg && product.productsImg.length > 0) {
            for (const img of product.productsImg) {
                if (img.imageId) {
                    await cloudinary.uploader.destroy(img.imageId);
                }
            }
        }

        await product.deleteOne();

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });

    } catch (error) {
        console.error("Delete Product Error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Update Product
export const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params
        const product = await ProductsDetails.findById(productId);
        console.log("id", productId)
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        const { productsName, productDescription, productsPrice, Category, BrandName, rating } = req.body;

        // Update fields
        product.productsName = productsName || product.productsName;
        product.productDescription = productDescription || product.productDescription;
        product.productsPrice = productsPrice || product.productsPrice;
        product.Category = Category || product.Category;
        product.BrandName = BrandName || product.BrandName;
        product.rating = rating || product.rating;

        // Update Images if new files are uploaded
        if (req.files && req.files.length > 0) {
            // Delete old images from Cloudinary
            for (const img of product.productsImg) {
                await cloudinary.uploader.destroy(img.imageId);
            }

            // Upload new images
            const uploadedImages = [];

            for (const file of req.files) {
                const uploaderResult = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: "products",
                            resource_type: "image",
                        },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    );

                    stream.end(req.file.buffer);
                });

                uploadedImages.push({ url: result.secure_url, imageId: result.public_id });
            }

            product.productsImg = uploadedImages;
        }

        const updatedProduct = await product.save();
        res.status(200).json({ success: true, product: updatedProduct });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};





