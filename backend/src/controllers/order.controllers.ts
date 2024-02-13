import { Request } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { NewOrderRequestBody } from "../types/types.js";
import { Order } from "../models/order.models.js";
import { reduceStock } from "../utils/reduceStock.js";
import { invalidateCache } from "../utils/invalidatesCache.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import { myCache } from "../app.js";

const myOrders = asyncHandler(async (req, res, next) => {
    const { id: user } = req.query;

    const key = `my-orders-${user}`;

    let orders;

    if (myCache.has(key)) {
        orders = JSON.parse(myCache.get(key) as string);
    } else {
        orders = await Order.find({ user });
        myCache.set(key, JSON.stringify(orders));
    }

    return res.status(200).json({
        success: true,
        orders,
    });
});

const allOrders = asyncHandler(async (req, res, next) => {
    let orders;

    const key = "all-orders";

    if (myCache.has(key)) {
        orders = JSON.parse(myCache.get(key) as string);
    } else {
        orders = await Order.find().populate("user", "name");
        myCache.set(key, JSON.stringify(orders));
    }

    return res.status(200).json({
        success: true,
        orders,
    });
});

const getSingleOrder = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const key = `order-${id}`;

    let order;
    if (myCache.has(key)) {
        order = JSON.parse(myCache.get(key) as string);
    } else {
        order = await Order.findById(id).populate("user", "name");

        if (!order) {
            return next(new ErrorHandler("Order Not Found", 404));
        }

        myCache.set(key, JSON.stringify(order));
    }

    return res.status(200).json({
        success: true,
        order,
    });
});

const newOrder = asyncHandler(
    async (req: Request<{}, {}, NewOrderRequestBody>, res, next) => {
        const {
            shippingInfo,
            orderItems,
            user,
            subTotal,
            tax,
            shippingCharges,
            discount,
            total,
        } = req.body;

        if (
            !shippingInfo ||
            !orderItems ||
            !user ||
            !subTotal ||
            !tax ||
            !total
        ) {
            return next(new ErrorHandler("Please Enter All Fields", 400));
        }

        await Order.create({
            shippingInfo,
            orderItems,
            user,
            subTotal,
            tax,
            shippingCharges,
            discount,
            total,
        });

        await reduceStock(orderItems);

        await invalidateCache({
            product: true,
            order: true,
            admin: true,
            userId: user,
        });

        return res.status(201).json({
            success: true,
            message: "Order Placed Successfully",
        });
    }
);

const processOrder = asyncHandler(async (req, res, next) => {
    const id = req.params.id;

    const order = await Order.findById(id);

    if (!order) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    switch (order.status) {
        case "Processing":
            order.status = "Shipped";
            break;
        case "Shipped":
            order.status = "Delivered";
            break;

        default:
            order.status = "Delivered";
            break;
    }

    await order.save();

    await invalidateCache({
        product: false,
        order: true,
        admin: true,
        userId: order.user,
    });

    return res.status(200).json({
        success: true,
        message: "Order Processed Successfully",
    });
});

const deleteOrder = asyncHandler(async (req, res, next) => {
    const id = req.params.id;

    const order = await Order.findById(id);

    if (!order) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    await order.deleteOne();

    await invalidateCache({
        product: false,
        order: true,
        admin: true,
        userId: order.user,
    });

    return res.status(200).json({
        success: true,
        message: "Order Deleted Successfully",
    });
});

export {
    newOrder,
    myOrders,
    allOrders,
    getSingleOrder,
    processOrder,
    deleteOrder,
};
