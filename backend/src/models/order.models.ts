import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        shippingInfo: {
            address: {
                type: String,
                required: [true, "Address is required"],
            },
            city: {
                type: String,
                required: [true, "City is required"],
            },
            state: {
                type: String,
                required: [true, "State is required"],
            },
            country: {
                type: String,
                required: [true, "Country is required"],
            },
            pinCode: {
                type: Number,
                required: [true, "Pin Code is required"],
            },
        },

        user: {
            type: String,
            ref: "User",
            required: true,
        },

        subTotal: {
            type: Number,
            required: true,
        },

        tax: {
            type: Number,
            required: true,
        },

        shippingCharges: {
            type: Number,
            required: true,
            default: 0,
        },

        discount: {
            type: Number,
            required: true,
            default: 0,
        },

        total: {
            type: Number,
            required: true,
        },

        status: {
            type: String,
            enum: ["Processing", "Shipped", "Delivered"],
            default: "Processing",
        },

        orderItems: [
            {
                name: String,
                photo: String,
                price: Number,
                quantity: Number,
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                },
            },
        ],
    },
    { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
