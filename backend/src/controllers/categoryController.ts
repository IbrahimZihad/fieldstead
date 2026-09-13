import { Request, Response, NextFunction } from "express";
import { Category, Product } from "../models";
import { ApiError } from "../middleware/errorHandler";

export const listCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await Category.findAll({ order: [["name", "ASC"]] });
    res.json({ categories });
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, slug } = req.body;
    if (!name || !slug) throw new ApiError(400, "name and slug are required");
    const category = await Category.create({ name, slug });
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) throw new ApiError(404, "Category not found");
    await category.update(req.body);
    res.json({ category });
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) throw new ApiError(404, "Category not found");
    const productCount = await Product.count({
      where: { categoryId: category.id },
    });
    if (productCount > 0) {
      throw new ApiError(
        400,
        `Cannot delete "${category.name}" — ${productCount} product(s) still use it`
      );
    }
    await category.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
