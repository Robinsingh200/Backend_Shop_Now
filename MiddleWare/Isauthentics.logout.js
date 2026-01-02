import AuthenticLogin from "../MVC/Model/Authentic.Model.js";
import jwt from "jsonwebtoken";
import "dotenv/config";

export const isAuthcated = async (req, res, next) => {
  try {
    let token;

    // 1️⃣ COOKIE se token lo (main way)
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.secret_key);

    const user = await AuthenticLogin.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user; // ✅ VERY IMPORTANT
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};
