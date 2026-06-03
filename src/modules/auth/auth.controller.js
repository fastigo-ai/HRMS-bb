import jwt from "jsonwebtoken";
import User from "./user.model.js";
import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";

// Helper to sign Access JWT Token
const signAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });
};

// Helper to sign Refresh JWT Token
const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || "refresh-fallback-secret", {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });
};

// Helper to construct token response and store them in secure HTTP-only cookies
const createSendToken = async (user, statusCode, req, res) => {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  // Store the refresh token in database on the user object
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Remove password from output JSON
  user.password = undefined;

  // Cookie setup configuration
  const isProduction = process.env.NODE_ENV === "production";
  
  const accessTokenCookieOptions = {
    expires: new Date(
      Date.now() + 15 * 60 * 1000 // 15 minutes max age
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    sameSite: isProduction ? "none" : "lax",
  };

  const refreshTokenCookieOptions = {
    expires: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days max age
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    sameSite: isProduction ? "none" : "lax",
  };

  res.cookie("accessToken", accessToken, accessTokenCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

  res.status(statusCode).json({
    status: "success",
    token: accessToken, // for legacy headers support if needed
    data: {
      user,
    },
  });
};
export const signin = catchAsync(async(req, res, next) => {
  // #swagger.tags = ['Authentication']
  const {email, password} = req.body || {}
  if(!email || !password) {
    return 
  }
})

// Signup Controller
export const signup = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Authentication']
  const { name, email, password, role, position, department, phone, address, skills, bankDetails } = req.body;

  // Prevent duplicate check via catchAsync mapped to errorHandler (11000 code)
  const newUser = await User.create({
    name,
    email,
    password,
    role,
    position,
    department,
    phone,
    address,
    skills,
    bankDetails,
  });

  await createSendToken(newUser, 201, req, res);
});

// Login Controller
export const login = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Authenticaion']
  const { email, password } = req.body;

  // 1) Check if email and password exist in body
  if (!email || !password) {
    return next(new AppError("Please provide both email and password!", 400));
  }

  // 2) Check if user exists & password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password!", 401));
  }

  // 3) If everything is okay, send token back to client
  await createSendToken(user, 200, req, res);
});

// Refresh Token Controller
export const refresh = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Authentication']
  // 1) Get refresh token from cookie
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return next(new AppError("Refresh token missing! Please log in.", 401));
  }

  // 2) Verify refresh token
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "refresh-fallback-secret");
  } catch (err) {
    return next(new AppError("Invalid or expired refresh token. Please log in again.", 401));
  }

  // 3) Find user in database and check if refresh token matches
  const currentUser = await User.findById(decoded.id);
  if (!currentUser || currentUser.refreshToken !== refreshToken) {
    return next(new AppError("User session no longer exists or token was revoked.", 401));
  }

  // 4) Generate new tokens (token rotation) and update cookies/database
  await createSendToken(currentUser, 200, req, res);
});

// Logout Controller
export const logout = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Authentication']
  // Clear the refresh token inside the database
  if (req.user) {
    req.user.refreshToken = undefined;
    await req.user.save({ validateBeforeSave: false });
  } else {
    // Fallback: If access token is expired/missing, check the refresh token cookie
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "refresh-fallback-secret");
        await User.findByIdAndUpdate(decoded.id, { $unset: { refreshToken: 1 } });
      } catch (err) {
        // Silently capture verification errors to ensure clean cookies are returned
      }
    }
  }

  // Overwrite cookies with expired mock cookies
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 1000), // expires in 1 second
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  res.cookie("accessToken", "loggedout", cookieOptions);
  res.cookie("refreshToken", "loggedout", cookieOptions);

  res.status(200).json({
    status: "success",
    message: "Logged out successfully.",
  });
});

// Get Current User Profile
export const getProfile = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Authentication']
  res.status(200).json({
    status: "success",
    data: {
      user: req.user,
    },
  });
});

// Update Profile Controller
export const updateProfile = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Authentication']
  const allowedFields = ["name", "phone", "address", "skills", "bankDetails", "position", "department"];
  
  const updatedUser = await User.findById(req.user.id);
  if (!updatedUser) {
    return next(new AppError("User not found", 404));
  }

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updatedUser[field] = req.body[field];
    }
  });

  await updatedUser.save({ validateBeforeSave: true });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

export default { signup, login, refresh, logout, getProfile, updateProfile };
