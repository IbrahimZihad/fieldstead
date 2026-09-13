import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import { Product, Category } from "../models";
import { ApiError } from "../middleware/errorHandler";

export const listProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, search, page = "1", limit = "12" } = req.query as Record<
      string,
      string
    >;

    const where: any = {};
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    const include: any[] = [{ model: Category, as: "category" }];
    if (category) {
      include[0].where = { slug: category };
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);

    const { rows, count } = await Product.findAndCountAll({
      where,
      include,
      order: [["createdAt", "DESC"]],
      limit: limitNum,
      offset: (pageNum - 1) * limitNum,
    });

    res.json({
      products: rows,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { idOrSlug } = req.params;
    const isNumeric = /^\d+$/.test(idOrSlug);
    const product = await Product.findOne({
      where: isNumeric ? { id: idOrSlug } : { slug: idOrSlug },
      include: [{ model: Category, as: "category" }],
    });
    if (!product) throw new ApiError(404, "Product not found");
    res.json({ product });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, slug, description, price, stock, imageUrl, categoryId } =
      req.body;
    if (!name || !slug || price === undefined || !categoryId) {
      throw new ApiError(
        400,
        "name, slug, price and categoryId are required"
      );
    }
    const product = await Product.create({
      name,
      slug,
      description: description || "",
      price,
      stock: stock ?? 0,
      imageUrl: imageUrl || "",
      categoryId,
    });
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) throw new ApiError(404, "Product not found");
    await product.update(req.body);
    res.json({ product });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) throw new ApiError(404, "Product not found");
    await product.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
