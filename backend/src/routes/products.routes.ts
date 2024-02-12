import { Router } from "express";
import {
    getAllCategories,
    getAminProducts,
    getLatestProducts,
    newProduct,
} from "../controllers/product.controllers.js";
import { singleUpload } from "../middlewares/multer.middlewares.js";
import { adminOnly } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/new").post(adminOnly, singleUpload, newProduct);

router.route("/latest").get(getLatestProducts);

router.route("/categories").get(getAllCategories);

router.route("/admin-products").get(getAminProducts);

export default router;
