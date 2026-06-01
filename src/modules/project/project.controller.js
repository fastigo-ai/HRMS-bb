import Project from "./project.model.js";
import User from "../auth/user.model.js";
import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";

// Retrieve all projects
export const getProjects = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Projects']
  const projects = await Project.find()
    .populate("leader", "name email role empId position department")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: projects.length,
    data: {
      projects,
    },
  });
});

// Create a new project (restricted to managers and HR admins)
export const createProject = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Projects']
  const { name, desc, leaderName, headcount, budget, status, efficiency } = req.body;

  if (!name) {
    return next(new AppError("Project name is required!", 400));
  }

  let leaderId = null;
  if (leaderName) {
    const leaderUser = await User.findOne({ name: leaderName });
    if (leaderUser) {
      leaderId = leaderUser._id;
    }
  }

  const newProject = await Project.create({
    name,
    desc,
    leader: leaderId,
    headcount: headcount || 1,
    budget: budget || "₹0.00L",
    status: status || "Planning",
    efficiency: efficiency || 90,
  });

  const populated = await Project.findById(newProject._id).populate(
    "leader",
    "name email role empId position department"
  );

  res.status(201).json({
    status: "success",
    data: {
      project: populated,
    },
  });
});
