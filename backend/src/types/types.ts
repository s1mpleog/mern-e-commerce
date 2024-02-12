import { NextFunction, Request, Response } from "express";

export interface NewUserRequestBody {
    _id: string;
    name: string;
    email: string;
    photo: string;
    gender: "male" | "female";
    dob: Date;
    age: number;
}

export type ControllerType = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;

export interface NewProductRequestBody {
    name: string;
    category: string;
    price: number;
    stock: number;
}
