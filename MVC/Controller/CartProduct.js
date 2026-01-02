import ItemCart from "../Model/Cart.model.js";
import { ProductsDetails } from "../Model/Products.Model.js";


// ================= GET CART =================

export const getCart = async (req, res) => {
  try {
    const UserId = req.user?._id;
    if (!UserId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const cart = await ItemCart
      .findOne({ UserId })
      .populate("item.productId");

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: { item: [], totalPrice: 0 }
      });
    }

    res.status(200).json({
      success: true,
      cart
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ================= ADD TO CART =================

export const AddToCart = async (req, res) => {
  try {
    const UserId = req.user?._id;
    const { productId } = req.body;

    if (!UserId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "ProductId is required"
      });
    }

    const product = await ProductsDetails.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    let cart = await ItemCart.findOne({ UserId });

    // 🆕 Create cart if not exists
    if (!cart) {
      cart = await ItemCart.create({
        UserId,
        item: [
          {
            productId,
            quantity: 1,
            price: product.productsPrice
          }
        ],
        totalPrice: product.productsPrice
      });

      return res.status(201).json({
        success: true,
        message: "Product added to cart",
        cart
      });
    }

    // 🔁 Update existing cart
    const itemIndex = cart.item.findIndex(
      i => i.productId.toString() === productId
    );

    if (itemIndex > -1) {
      cart.item[itemIndex].quantity += 1;
    } else {
      cart.item.push({
        productId,
        quantity: 1,
        price: product.productsPrice
      });
    }

    cart.totalPrice = cart.item.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    await cart.save();

    const populatedCart = await ItemCart
      .findOne({ UserId })
      .populate("item.productId");

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart: populatedCart
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ================= REMOVE ITEM =================

export const removeItem = async (req, res) => {
  try {
    const UserId = req.user?._id;
    const { productId } = req.body;

    if (!UserId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const cart = await ItemCart.findOne({ UserId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    cart.item = cart.item.filter(
      i => i.productId.toString() !== productId
    );

    cart.totalPrice = cart.item.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    await cart.save();

    const populatedCart = await ItemCart
      .findOne({ UserId })
      .populate("item.productId");

    res.status(200).json({
      success: true,
      message: "Item removed successfully",
      cart: populatedCart
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ================= UPDATE CART ITEM QUANTITY =================

export const cartUpdate = async (req, res) => {
  try {
    const UserId = req.user?._id;
    const { productId, type } = req.body;

    if (!UserId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const cart = await ItemCart.findOne({ UserId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    const item = cart.item.find(
      i => i.productId.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart"
      });
    }

    if (type === "in") item.quantity += 1;
    if (type === "de" && item.quantity > 1) item.quantity -= 1;

    cart.totalPrice = cart.item.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    await cart.save();

    const populatedCart = await ItemCart
      .findOne({ UserId })
      .populate("item.productId");

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart: populatedCart
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
