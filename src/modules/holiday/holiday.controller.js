import Holiday from "./holiday.model.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";

export const createHoliday = catchAsync(async (req, res, next) => {
  const { date, name, description, isOptional } = req.body;

  if (!date || !name) {
    return next(new AppError("Please provide both holiday date and name!", 400));
  }

  const existing = await Holiday.findOne({ date: new Date(date) });
  if (existing) {
    return next(new AppError("A holiday is already scheduled on this date!", 400));
  }

  const newHoliday = await Holiday.create({
    date: new Date(date),
    name,
    description,
    isOptional: !!isOptional,
  });

  res.status(201).json({
    status: "success",
    data: {
      holiday: newHoliday,
    },
  });
});

export const getAllHolidays = catchAsync(async (req, res, next) => {
  const holidays = await Holiday.find().sort({ date: 1 });

  res.status(200).json({
    status: "success",
    results: holidays.length,
    data: {
      holidays,
    },
  });
});

export const deleteHoliday = catchAsync(async (req, res, next) => {
  const holiday = await Holiday.findByIdAndDelete(req.params.id);

  if (!holiday) {
    return next(new AppError("No holiday found with that ID!", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
