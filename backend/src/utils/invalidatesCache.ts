import { myCache } from "../app.js";
import { Order } from "../models/order.models.js";
import { Product } from "../models/product.models.js";
import { invalidateCacheProps } from "../types/types.js";

const invalidateCache = async ({
    product,
    order,
    admin,
    userId,
}: invalidateCacheProps) => {
    if (product) {
        const productKeys: string[] = [
            "latest-product",
            "categories",
            "all-products",
        ];
        const products = await Product.find({}).select("_id");

        products.forEach((i) => {
            productKeys.push(`product-${i._id}`);
        });

        myCache.del(productKeys);
    }

    if (order) {
        const orderKeys: string[] = ["all-orders", `my-orders-${userId}`];
        const orders = await Order.find({}).select("_id");

        orders.forEach((i) => {
            orderKeys.push(`order-${i._id}`);
        });

        myCache.del(orderKeys);
    }

    if (admin) {
    }
};

export { invalidateCache };
