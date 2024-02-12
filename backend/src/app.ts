import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import { errorMiddleware } from "./middlewares/error.middlewares.js";

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());

// importing routes
import userRoute from "./routes/user.routes.js";
import productRoute from "./routes/products.routes.js";

// using routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);

app.use("/uploads", express.static("./public/temp"));

app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`SERVER IS RUNNING ON http://localhost:${PORT}`);
});
