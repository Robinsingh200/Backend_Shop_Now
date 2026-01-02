import 'dotenv/config'; 
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import router from "./All Routes/Authentic.Router.js";
import { forgetrouter } from './All Routes/Authentic.Router.js';
import products_router from './All Routes/Products.router.js';
import cartRouter from './All Routes/cart.routes.js';
import { paymentrouter } from './All Routes/Payment.js';
import cookieParser from "cookie-parser";


const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "https://frontend-shop-now-z7bu.vercel.app", 
    credentials: true,
  })
);

// Read env variables
const PORT = process.env.PORT || 1050;
const MONGO_URL = process.env.MONGO_URL;


let isConnected = false

async function connectionMongo() {
   try {
    await mongoose.connect(MONGO_URL , {
         useNewUrlParser:true,
         useUnifiedTopology:true
    });
    isConnected = true
    
   } catch (error) {
      console.error("error connecting mongoDb");
      
   }
}

// Database connection
app.use(( req , res , next )=>{
     if(!isConnected){
       connectionMongo();
     }
     next()
})


// Routes
app.use("/api", router);
app.use("/api", products_router);
app.use("/api", forgetrouter);
app.use("/api", cartRouter);
app.use('/api', paymentrouter)


app.get("/", (req, res) => {
  res.send("Backend running successfully 🚀");
});



export default app;