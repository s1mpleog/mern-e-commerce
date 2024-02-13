import { Request } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    BaseQuery,
    NewProductRequestBody,
    SearchRequestQuery,
} from "../types/types.js";
import { Product } from "../models/product.models.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import { myCache } from "../app.js";
import { rm } from "fs";
import { invalidateCache } from "../utils/invalidatesCache.js";

const getLatestProducts = asyncHandler(async (req, res, next) => {
    let products;

    if (myCache.has("latest-product")) {
        products = JSON.parse(myCache.get("latest-product") as string);
    } else {
        products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
        myCache.set("latest-product", JSON.stringify(products));
    }

    return res.status(200).json({
        success: true,
        products,
    });
});

const getAllCategories = asyncHandler(async (req, res, next) => {
    let categories;

    if (myCache.has("categories")) {
        categories = JSON.parse(myCache.get("categories") as string);
    } else {
        categories = await Product.distinct("category");
        myCache.set("categories", JSON.stringify(categories));
    }

    return res.status(200).json({
        success: true,
        categories,
    });
});

const getAdminProducts = asyncHandler(async (req, res, next) => {
    let products;

    if (myCache.has("all-products")) {
        products = JSON.parse(myCache.get("all-products") as string);
    } else {
        products = await Product.find({});
        myCache.set("all-products", JSON.stringify(products));
    }

    return res.status(200).json({
        success: true,
        products,
    });
});

const getSingleProduct = asyncHandler(async (req, res, next) => {
    let product;

    const id = req.params.id;

    if (!id) {
        return next(new ErrorHandler("Please provide Id", 400));
    }

    if (myCache.has(`product-${id}`)) {
        product = JSON.parse(myCache.get(`product-${id}`) as string);
    } else {
        product = await Product.findById(id);
        if (!product) {
            return next(
                new ErrorHandler("Please provide valid product ID", 404)
            );
        }
        myCache.set(`product-${id}`, JSON.stringify(product));
    }

    return res.status(200).json({
        success: true,
        product,
    });
});

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
            photo: photo.path,
        });

        await invalidateCache({ product: true });

        return res.status(201).json({
            success: true,
            message: "Product Created Successfully",
        });
    }
);

const updateProduct = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name, price, stock, category } = req.body;

    const photo = req.file;
    const product = await Product.findById(id);

    if (!product) {
        return next(new ErrorHandler("Invalid Product Id", 404));
    }

    if (photo) {
        rm(product.photo, () => {
            console.log("Old photo deleted");
        });
        product.photo = photo.path;
    }

    if (name) product.name = name;
    if (price) product.price = price;
    if (stock) product.stock = stock;
    if (category) product.category = category;

    await product.save();

    await invalidateCache({ product: true });

    return res.status(200).json({
        success: true,
        message: "Product Updated Successfully",
    });
});

const deleteProduct = asyncHandler(async (req, res, next) => {
    const id = req.params.id;

    if (!id) {
        return next(new ErrorHandler("Please provide Id", 400));
    }

    const product = await Product.findById(id);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    rm(product.photo, () => {
        console.log("Product photo deleted");
    });

    await product.deleteOne();

    await invalidateCache({ product: true });

    return res.status(200).json({
        success: true,
        message: "Product Deleted Successfully",
    });
});

const getSearchProducts = asyncHandler(
    async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
        const { sort, search, category, price } = req.query;

        const page = Number(req.query.page) || 1;

        const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
        const skip = (page - 1) * limit;

        const baseQuery: BaseQuery = {};

        if (search) {
            baseQuery.name = {
                $regex: search,
                $options: "i",
            };
        }

        if (price) {
            baseQuery.price = {
                $lte: Number(price),
            };
        }

        if (category) {
            baseQuery.category = category;
        }

        const productsPromise = Product.find(baseQuery)
            .sort(sort && { price: sort === "asc" ? 1 : -1 })
            .limit(limit)
            .skip(skip);

        const [products, filteredOnlyProduct] = await Promise.all([
            productsPromise,
            Product.find(baseQuery),
        ]);

        const totalPage = Math.ceil(filteredOnlyProduct.length / limit);

        return res.status(200).json({
            success: true,
            products,
            totalPage,
        });
    }
);

export {
    newProduct,
    getLatestProducts,
    getAllCategories,
    getAdminProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    getSearchProducts,
};
