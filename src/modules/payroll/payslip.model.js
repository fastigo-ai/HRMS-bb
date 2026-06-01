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
  },
  {
    timestamps: true,
  }
);

// Ensure an employee can only have one payslip per monthly period
payslipSchema.index({ employee: 1, period: 1 }, { unique: true });

const Payslip = mongoose.model("Payslip", payslipSchema);

export default Payslip;
