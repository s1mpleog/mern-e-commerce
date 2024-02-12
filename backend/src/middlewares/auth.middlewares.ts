import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ErrorHandler } from "../utils/errorHandler.js";

const adminOnly = asyncHandler(async (req, res, next) => {
    const { id } = req.query;

    if (!id) {
        return next(new ErrorHandler("Saale Login Kr phle", 401));
    }

    const user = await User.findById(id);

    if (!user) {
        return next(new ErrorHandler("Saale Fake ID Deta hai", 401));
    }

    if (user.role !== "admin") {
        return next(new ErrorHandler("Saale Aukat Nhi Hai Teri", 401));
    }

    next();
});

export { adminOnly };
