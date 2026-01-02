import 'dotenv/config';
import AuthenticLogin from "../Model/Authentic.Model.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import VerificationEmail from "../../VerifyEmail/Verify.emils.js";
import sessionToken from '../Model/Session.model.js';
import sendOtp from '../../Otp_send/SendTheOpt.js';
import cloudinary from '../../utils/Cloudnery.js';


async function register(req, res) {
  try {
    const { firstName, lastName, gmail, password } = req.body;
    if (!firstName || !lastName || !gmail || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      })
    }

    const oldUser = await AuthenticLogin.findOne({
      gmail
    })
    if (oldUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      })
    }
    const hasspassword = await bcrypt.hash(password, 10);



    const newUser = await AuthenticLogin.create({
      firstName,
      lastName,
      gmail,
      password: hasspassword,
    });


    const Token = jwt.sign({
      _id: newUser.id,
      gmail: gmail,
    }, process.env.secret_key, { expiresIn: '1d' })

    VerificationEmail(Token, gmail)
    newUser.token = Token;

    return res.send({
      success: true,
      message: "User created successfully",
      newUser: newUser
    });

  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


export async function verifiedSUer(req, res) {
  try {
    const AuthHeader = req.headers.authorization;
    if (!AuthHeader || !AuthHeader.startsWith('Bearer ')) {
      return res.status(400).json({
        success: false,
        message: "Authriztion token is missing or invalid"
      })
    }

    const token = AuthHeader.split(' ')[1]
    let decode

    try {
      decode = jwt.verify(
        token,
        process.env.secret_key
      )

    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(400).json({
          success: false,
          message: "Token expried"
        })
      }
      return res.status(400).json({
        success: false,
        message: "Token Genrate failed"
      })
    }

    const UserLog = await AuthenticLogin.findById(decode._id)

    if (!UserLog) {
      return res.status(400).json({
        success: false,
        message: "User not found"
      })
    }
    UserLog.token = null
    UserLog.isVerified = true
    await UserLog.save();

    return res.status(200).json({
      success: true,
      message: "Email verified succesfully"
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


export async function LoggIn(req, res) {
  try {
    const { gmail, password } = req.body;

    const user = await AuthenticLogin.findOne({ gmail });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Wrong password" });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your account",
      });
    }

    const accessToken = jwt.sign(
      { id: user._id },
      process.env.secret_key,
      { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.secret_key,
      { expiresIn: "20d" }
    );

    await sessionToken.deleteMany({ UserId: user._id });
    await sessionToken.create({ UserId: user._id });

    return res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 20 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        message: `Welcome ${user.firstName}`,
        user,
      });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}


export async function LogOut(req, res) {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const UserId = req.user._id;

    await sessionToken.deleteMany({ UserId });

    return res
      .clearCookie("accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      })
      .clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      })
      .status(200)
      .json({
        success: true,
        message: "Logged out successfully",
      });

  } catch (error) {
    console.error("LOGOUT ERROR =>", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
}



export async function changeThePassword(req, res) {
  try {
    const { newPassword, confirfomPassword } = req.body;

    const { gmail } = req.params

    const user = await AuthenticLogin.findOne({ gmail })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `user not found`
      })
    }

    if (!newPassword || !confirfomPassword) {
      return res.status(400).json({
        success: false,
        message: `All fields are required`
      })
    }

    if (newPassword !== confirfomPassword) {
      return res.status(400).json({
        success: false,
        message: `password doesn't match`
      })
    }

    const hasspassword = await bcrypt.hash(newPassword, 10);

    user.password = hasspassword
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Password has been changed `
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }

}


export async function AllUser(req, res) {
  try {
    const User = await AuthenticLogin.find();
    return res.status(200).json({
      success: true,
      User
    })
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: error.message
    })
  }

}


export async function UserUpdate(req, res) {
  try {

    const UserIdToUpdtae = req.params.id
    const LoggedId = req.user._id.toString()
    const { firstName, lastName, gmail, address, city, Phoneno, zipCode } = req.body;

    if (LoggedId !== UserIdToUpdtae) {
      return res.status(403).json({
        success: false,
        message: 'You dont have right'
      })
    }

    const user = await AuthenticLogin.findById(UserIdToUpdtae)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found '
      })
    }

    let ProfilePicture = user.profilePicture
    let ProfilePictureId = user.profileId


    if (req.file) {
      if (ProfilePictureId) {
        await cloudinary.uploader.destroy(ProfilePictureId)
      }

      const uploaderResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "profile" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      ProfilePicture = uploaderResult.secure_url
      ProfilePictureId = uploaderResult.public_id

    }

    user.firstName = firstName || user.firstName
    user.lastName = lastName || user.lastName
    user.gmail = gmail || user.gmail
    user.zipCode = zipCode || user.zipCode
    user.Phoneno = Phoneno || user.Phoneno
    user.address = address || user.address
    user.city = city || user.city

    user.profilePicture = ProfilePicture;
    user.profileId = ProfilePictureId;

    const uploderUser = await user.save()

    return res.status(200).json({
      success: true,
      message: 'Updated Profile',
      user: uploderUser
    })

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }

}

import crypto from "crypto";

export async function Forgetpassword(req, res) {
  try {
    const { gmail } = req.body;

    if (!gmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await AuthenticLogin.findOne({ gmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP

    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    user.otp = hashedOtp;
    user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 min

    await user.save();

    // Send OTP after saving
    await sendOtp(otp, gmail);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP"
    });
  }
}



export default register;