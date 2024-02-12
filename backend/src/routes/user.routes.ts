import { Router } from "express";
import {
    deleteUser,
    getAllUsers,
    getUser,
    registerUser,
} from "../controllers/user.controllers.js";
import { adminOnly } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/new").post(registerUser);

// Route - /api/v1/user/all
router.route("/all").get(adminOnly, getAllUsers);

// Route - /api/v1/user/dynamicID
router.route("/:id").get(adminOnly, getUser).delete(adminOnly, deleteUser);

export default router;
