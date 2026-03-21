import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./database/db.js";
import Razorpay from "razorpay";
import cors from "cors";

dotenv.config();

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
})

const app = express();

// Make middleware fully accessible to Vercel domains dynamically
app.use(express.json());
app.use(cors({
  origin: true, // Dynamically allows any Vercel/localhost frontend requesting it
  credentials: true
}));
const PORT = process.env.PORT || 5000;
connectDB();
app.get("/",(req,res)=>{
    res.send("Server is running");
});

app.use("/uploads",express.static("uploads"));
//importing routes
import userRoutes from "./routes/user.js";
import courseRoutes from "./routes/course.js";
import adminRoutes from "./routes/admin.js";
import testimonialRoutes from "./routes/testimonial.js";
//using routes
app.use("/api",userRoutes);
app.use("/api",courseRoutes);
app.use("/api",adminRoutes);
app.use("/api",testimonialRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
