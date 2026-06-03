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
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken || refreshToken === "loggedout") {
        return next(new AppError("You are not logged in! Please log in to get access.", 401));
      }

      try {
        const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "refresh-fallback-secret");
        const currentUser = await User.findById(decodedRefresh.id);
        
        if (!currentUser || currentUser.refreshToken !== refreshToken) {
          return next(new AppError("The user session no longer exists. Please log in again.", 401));
        }

        // Generate new tokens
        const newAccessToken = jwt.sign({ id: currentUser._id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN || "15m",
        });
        const newRefreshToken = jwt.sign({ id: currentUser._id }, process.env.JWT_REFRESH_SECRET || "refresh-fallback-secret", {
          expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
        });

        // Store new refresh token in DB
        currentUser.refreshToken = newRefreshToken;
        await currentUser.save({ validateBeforeSave: false });

        // Set cookies
        const isProduction = process.env.NODE_ENV === "production";
        const cookieOptions = {
          httpOnly: true,
          secure: req.secure || req.headers["x-forwarded-proto"] === "https",
          sameSite: isProduction ? "none" : "lax",
        };

        res.cookie("accessToken", newAccessToken, {
          ...cookieOptions,
          expires: new Date(Date.now() + 15 * 60 * 1000)
        });
        res.cookie("refreshToken", newRefreshToken, {
          ...cookieOptions,
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        res.setHeader("x-new-access-token", newAccessToken);

        req.user = currentUser;
        return next();
      } catch (refreshErr) {
        return next(new AppError("Session expired. Please log in again.", 401));
      }
    }
    return next(err);
  }

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
