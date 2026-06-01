import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const bankDetailsSchema = new mongoose.Schema({
  bankName: {
    type: String,
    default: "Silicon Valley Clearing Bank",
  },
  accountNo: {
    type: String,
    default: "•••• •••• 0000",
  },
  panNumber: {
    type: String,
    default: "XXAPJ0000F",
  },
  ifscCode: {
    type: String,
    default: "SVCB0008800",
  },
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["standard_employee", "manager", "hr_admin"],
      default: "standard_employee",
    },
    position: {
      type: String,
    },
    department: {
      type: String,
    },
    empId: {
      type: String,
      unique: true,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    phone: {
      type: String,
      default: "+1 (555) 901-2940",
    },
    address: {
      type: String,
      default: "Simulated Enterprise HQ, Staging City",
    },
    skills: {
      type: [String],
      default: ["React Framework", "Zustand Stores", "Vite Modules"],
    },
    bankDetails: {
      type: bankDetailsSchema,
      default: () => ({}),
    },
    location: {
      type: String,
      default: "HQ Austin"
    },
    gender: {
      type: String,
      default: "male"
    },
    prevCompany: {
      type: String,
      default: "N/A"
    },
    prevDesignation: {
      type: String,
      default: "N/A"
    },
    prevDuration: {
      type: String,
      default: "N/A"
    },
    prevCtc: {
      type: String,
      default: "N/A"
    },
    prevRelievingDoc: {
      type: String,
    },
    prevSalarySlip: {
      type: String,
    },
    joiningSalary: {
      type: String,
      default: "N/A"
    },
    aadhaarNumber: {
      type: String,
      default: "N/A"
    },
    panNumber: {
      type: String,
      default: "N/A"
    },
    aadhaarCardDoc: {
      type: String,
    },
    panCardDoc: {
      type: String,
    },
    passwordChangedAt: Date,
    refreshToken: String,
    leaveBalances: {
      casualLeave: { type: Number, default: 1 },
      sickLeave: { type: Number, default: 1 },
      paidLeave: { type: Number, default: 1 },
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to auto-generate values and hash passwords
userSchema.pre("save", async function () {
  // 1) Hash password if it has been modified
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  // 2) Set default position & department based on role if not already specified
  if (!this.position) {
    this.position =
      this.role === "hr_admin"
        ? "HR Coordinator"
        : this.role === "manager"
        ? "Scrum Manager"
        : "Frontend Engineer";
  }
  if (!this.department) {
    this.department =
      this.role === "hr_admin"
        ? "People Operations"
        : this.role === "manager"
        ? "Product Engineering"
        : "SaaS Development";
  }

  // 3) Automatically generate a unique empId if not set
  if (!this.empId) {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    this.empId = `WS-${randomNum}`;
  }
});

// Instance method to check if password is correct
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if password was changed after token issuance
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model("User", userSchema);

export default User;
