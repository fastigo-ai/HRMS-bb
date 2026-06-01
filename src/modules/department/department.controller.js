import Department from "./department.model.js";
import User from "../auth/user.model.js";
import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";

// Fetch all departments dynamically
export const getAllDepartments = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Departments']
  const departments = await Department.find().populate("leader", "-password");

  // Compute dynamic headcount per department from live Users
  const data = await Promise.all(
    departments.map(async (dept) => {
      const count = await User.countDocuments({ department: dept.name });
      
      const leaderUser = dept.leader || {};
      const leaderName = leaderUser.name || "Unassigned Lead";
      const leaderTitle = leaderUser.position || (leaderUser.role === 'manager' ? 'Engineering Lead & PM' : 'Department Head');
      
      const avatar = leaderUser.role === 'hr_admin'
        ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=64&h=64'
        : (leaderUser.role === 'manager'
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=64&h=64'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=64&h=64');

      return {
        id: dept._id,
        name: dept.name,
        desc: dept.desc || `Organized corporate operations division for ${dept.name}.`,
        leader: leaderName,
        leaderTitle: leaderTitle,
        avatar: avatar,
        headcount: count,
        budget: dept.budget,
        hiringStatus: dept.hiringStatus,
        accentColor: dept.accentColor,
        barColor: dept.barColor,
        efficiency: dept.efficiency
      };
    })
  );

  res.status(200).json({
    status: "success",
    data: {
      departments: data,
    },
  });
});

// Create a new corporate department vertical
export const createDepartment = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Departments']
  const { name, desc, leader, budget, hiringStatus, efficiency, accentColor, barColor } = req.body;

  if (!name) {
    return next(new AppError("Department name is required!", 400));
  }

  // Find manager lead by name or database _id
  let leaderId = req.user._id; // default to logged-in user
  if (leader) {
    const userQuery = leader.match(/^[0-9a-fA-F]{24}$/) ? { _id: leader } : { name: leader };
    const leaderUser = await User.findOne(userQuery);
    if (leaderUser) {
      leaderId = leaderUser._id;
    }
  }

  const newDept = await Department.create({
    name,
    desc,
    leader: leaderId,
    budget: budget || "₹1.0Cr / yr",
    hiringStatus: hiringStatus || "Active hiring",
    efficiency: efficiency || 95,
    accentColor: accentColor || "border-l-indigo-600",
    barColor: barColor || "bg-indigo-600",
  });

  res.status(201).json({
    status: "success",
    data: {
      department: newDept,
    },
  });
});

// Delete a corporate department
export const deleteDepartment = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Departments']
  const dept = await Department.findById(req.params.id);
  if (!dept) {
    return next(new AppError("Department not found!", 404));
  }

  await user.findByIdAndDelete({department: dept._id});
  await Department.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

export default { getAllDepartments, createDepartment, deleteDepartment };
