import { NextFunction, Request, Response } from "express";
import { ControllerType } from "../types/types.js";

const asyncHandler =
    (fn: ControllerType) =>
    (req: Request, res: Response, next: NextFunction) => {
        return Promise.resolve(fn(req, res, next)).catch(next);
    };

export { asyncHandler };
