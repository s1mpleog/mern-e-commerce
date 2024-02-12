import { NextFunction, Request, Response } from "express";
import { NewUserRequestBody } from "../types/types.js";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ErrorHandler } from "../utils/errorHandler.js";

const registerUser = asyncHandler(
    async (
        req: Request<{}, {}, NewUserRequestBody>,
        res: Response,
        next: NextFunction
    ) => {
        const { name, email, photo, gender, _id, dob } = req.body;

        let user = await User.findById(_id);

        if (user) {
            return res.status(200).json({
                success: true,
                message: `Welcome ${user.name}`,
            });
        }

        if (!_id || !name || !email || !photo || !gender || !dob) {
            return next(new ErrorHandler("Please add aff fields", 400));
        }

        const newUser = await User.create({
            _id,
            name,
            email,
            photo,
            gender,
            dob: new Date(dob),
        });
        return res.status(201).json({
            success: true,
            message: `Welcome, ${newUser.name}`,
        });
    }
);

const getAllUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find({}).select("-password");

    return res.status(200).json({
        success: true,
        users,
    });
});

const getUser = asyncHandler(async (req, res, next) => {
    const id = req.params.id;

    const user = await User.findById(id);

    if (!user) {
        return next(new ErrorHandler("Invalid ID", 400));
    }

    return res.status(200).json({
        success: true,
        user,
    });
});

const deleteUser = asyncHandler(async (req, res, next) => {
    const id = req.params.id;

    const user = await User.findById(id);

    if (!user) {
        return next(new ErrorHandler("Invalid ID", 400));
    }

    await user.deleteOne();

    return res.status(200).json({
        success: true,
        message: "User deleted successfully",
    });
});

export { registerUser, getAllUsers, getUser, deleteUser };
