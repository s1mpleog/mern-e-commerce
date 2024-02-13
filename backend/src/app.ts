import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import NodeCache from "node-cache";
import morgan from "morgan";
import { errorMiddleware } from "./middlewares/error.middlewares.js";

dotenv.config();
connectDB();

export const myCache = new NodeCache();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(morgan("dev"));

// importing routes
import userRoute from "./routes/user.routes.js";
import productRoute from "./routes/product.routes.js";
import orderRoute from "./routes/order.routes.js";

// using routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);

app.use("/uploads", express.static("uploads"));

app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`SERVER IS RUNNING ON http://localhost:${PORT}`);
});
