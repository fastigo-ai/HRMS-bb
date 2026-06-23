import Company from "./company.model.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";

// Retrieve company details or initialize with a default one if none exists
export const getCompanyDetails = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Company']
  let company = await Company.findOne();
  
  if (!company) {
    company = await Company.create({
      name: "Fastigo X Technologies Inc.",
      address: "882 Park Boulevard, Suite 100, San Francisco, California 94103",
      latitude: 37.7749,
      longitude: -122.4194,
      radius: 200,
      saturdayRule: "5-day",
       
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      company,
    },
  });
});


// Update company office details (restricted to HR admin)
export const updateCompanyDetails = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Company']
  const { name, address, latitude, longitude, radius, saturdayRule } = req.body;

  if (!name || !address || latitude === undefined || longitude === undefined || radius === undefined) {
    return next(new AppError("Please provide name, address, latitude, longitude, and radius!", 400));
  }

  if (saturdayRule && !["5-day", "6-day", "2nd-4th-off"].includes(saturdayRule)) {
    return next(new AppError("Invalid Saturday working rule!", 400));
  }

  let company = await Company.findOne();
  
  if (company) {
    company.name = name;
    company.address = address;
    company.latitude = Number(latitude);
    company.longitude = Number(longitude);
    company.radius = Number(radius);
    if (saturdayRule) company.saturdayRule = saturdayRule;
    await company.save();
  } else {
    company = await Company.create({
      name,
      address,
      latitude: Number(latitude),
      longitude: Number(longitude),
      radius: Number(radius),
      saturdayRule: saturdayRule || "5-day",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      company,
    },
  });
});
