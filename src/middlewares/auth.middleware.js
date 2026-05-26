import { promisify } from "util";
import jwt from "jsonwebtoken";
import User from "../modules/auth/user.model.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";

// Middleware to protect routes (Authentication check)
export const protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in! Please log in to get access.", 401));
  }

  // 2) Verification of JWT token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("The user belonging to this token no longer exists.", 401));
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError("User recently changed password! Please log in again.", 401));
  }

  // Grant access to protected route by placing the user on the req object
  req.user = currentUser;
  next();
});

// Middleware to restrict access based on user role (Authorization gate)
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array e.g. ['hr_admin', 'manager']
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action.", 403));
    }
    next();
  };
};
