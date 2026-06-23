import mongoose from "mongoose";

const payslipSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A payslip must belong to an employee!"],
    },
    period: {
      type: String,
      required: [true, "Please provide the monthly period (e.g. 'May 2026')!"],
    },
    baseSalary: {
      type: Number,
      required: [true, "Please provide the base salary amount!"],
    },
    basic: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    specialAllowance: { type: Number, default: 0 },
    providentFund: { type: Number, default: 0 },
    customEarnings: [{ label: String, amount: Number }],
    customDeductions: [{ label: String, amount: Number }],
    incomeTax: { type: Number, default: 0 },
    taxWithheld: {
      type: Number,
      required: [true, "Please provide the tax withheld amount!"],
    },
    netPay: {
      type: Number,
      required: [true, "Please provide the net pay amount!"],
    },
    status: {
      type: String,
      enum: ["Pending", "Disbursed"],
      default: "Disbursed",
    },
    totalLeaves: {
      type: Number,
      default: 0,
    },
    extraLeaves: {
      type: Number,
      default: 0,
    },
    deductionAmount: {
      type: Number,
      default: 0,
    },
    finalSalary: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure an employee can only have one payslip per monthly period
payslipSchema.index({ employee: 1, period: 1 }, { unique: true });

const Payslip = mongoose.model("Payslip", payslipSchema);

export default Payslip;
