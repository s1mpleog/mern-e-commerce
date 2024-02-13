import { Router } from "express";
import {
    deleteProduct,
    getAllCategories,
    getAdminProducts,
    getLatestProducts,
    getSingleProduct,
    newProduct,
    updateProduct,
    getSearchProducts,
} from "../controllers/product.controllers.js";
import { singleUpload } from "../middlewares/multer.middlewares.js";
import { adminOnly } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/new").post(adminOnly, singleUpload, newProduct);

router.route("/search").get(getSearchProducts);

router.route("/latest").get(getLatestProducts);

router.route("/categories").get(getAllCategories);

router.route("/admin-products").get(adminOnly, getAdminProducts);

router
    .route("/:id")
    .get(getSingleProduct)
    .put(adminOnly, singleUpload, updateProduct)
    .delete(adminOnly, deleteProduct);

export default router;
