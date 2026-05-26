import Category from "./category.model.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";

// Create a new category
export const createCategory = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Categories']
  const { name, description } = req.body;

  if (!name) {
    return next(new AppError("Category name is required!", 400));
  }

  const newCategory = await Category.create({ name, description });

  res.status(201).json({
    status: "success",
    data: {
      category: newCategory,
    },
  });
});

// Retrieve all categories
export const getAllCategories = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Categories']
  const categories = await Category.find();

  res.status(200).json({
    status: "success",
    results: categories.length,
    data: {
      categories,
    },
  });
});

export default { createCategory, getAllCategories };
