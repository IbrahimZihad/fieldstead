import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models";
import { ApiError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";

const signToken = (id: number) => {
  const secret = process.env.JWT_SECRET || "dev_secret";
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({ id }, secret, { expiresIn } as jwt.SignOptions);
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw new ApiError(400, "name, email and password are required");
    }
    if (password.length < 6) {
      throw new ApiError(400, "password must be at least 6 characters");
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      throw new ApiError(409, "An account with this email already exists");
    }

    const user = await User.create({ name, email, password, role: "customer" });
    const token = signToken(user.id);

    res.status(201).json({ user: user.toJSONSafe(), token });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError(400, "email and password are required");
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, "Invalid email or password");
    }

    const token = signToken(user.id);
    res.json({ user: user.toJSONSafe(), token });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findByPk(req.user!.id);
    if (!user) throw new ApiError(404, "User not found");
    res.json({ user: user.toJSONSafe() });
  } catch (err) {
    next(err);
  }
};
