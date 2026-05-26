import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Employee name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Employee email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"],
    },
    position: {
      type: String,
      required: [true, "Employee position is required"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Employee department is required"],
      trim: true,
    },
    salary: {
      type: Number,
      required: [true, "Employee salary is required"],
      min: [0, "Salary cannot be negative"],
    },
    avatar: {
      type: String,
      default: "",
    },
    resume: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "suspended"],
        message: "Status must be active, inactive, or suspended",
      },
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
