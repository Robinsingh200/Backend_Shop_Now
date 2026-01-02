import express from 'express'
import register, { changeThePassword, verifiedSUer, LoggIn, LogOut, Forgetpassword,AllUser, UserUpdate } from '../MVC/Controller/Authentic.controller.js';
import { isAuthcated ,IsAdmin} from '../MiddleWare/Isauthentics.logout.js';
import { singleUpload } from '../MiddleWare/Multer.js';


const router = express.Router();

const forgetrouter = express.Router();

router.post("/register", register)

router.post("/verify-email", verifiedSUer)

router.post("/log", LoggIn)

router.post("/logout", isAuthcated, LogOut)

forgetrouter.post("/forget", isAuthcated, Forgetpassword)

// forgetrouter.post("/Verifyotp/:gmail", VerifyOtp)

forgetrouter.post("/new-password/:gmail", changeThePassword)

router.get("/alluser",isAuthcated,IsAdmin, AllUser)

router.put("/update/:id",isAuthcated, singleUpload ,UserUpdate )


export default router;

export {
    forgetrouter
}