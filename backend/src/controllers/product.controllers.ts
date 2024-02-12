import { Request } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { NewProductRequestBody } from "../types/types.js";
import { Product } from "../models/product.models.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import { rm } from "fs";

const newProduct = asyncHandler(
    async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
        const { name, price, stock, category } = req.body;

        const photo = req.file;

        if (!photo) {
            return next(new ErrorHandler("Please add Photo", 400));
        }

        if (!name || !price || !stock || !category) {
            rm(photo.path, () => {
                console.log("deleted");
            });

            return next(new ErrorHandler("Please enter All Fields", 400));
        }

        await Product.create({
            name,
            price,
            stock,
            category: category.toLowerCase(),
            photo: photo.filename,
        });

        return res.status(201).json({
            success: true,
            message: "Product Created Successfully",
        });
    }
);

const getLatestProducts = asyncHandler(async (req, res, next) => {
    const products = await Product.find({}).sort({ createdAt: -1 }).limit(5);

    return res.status(200).json({
        success: true,
        products,
    });
});

const getAllCategories = asyncHandler(async (req, res, next) => {
    const categories = await Product.distinct("category");

    return res.status(200).json({
        success: true,
        categories,
    });
});

const getAminProducts = asyncHandler(async (req, res, next) => {
    const products = await Product.find({});

    return res.status(200).json({
        success: true,
        products,
    });
});

export { newProduct, getLatestProducts, getAllCategories, getAminProducts };
