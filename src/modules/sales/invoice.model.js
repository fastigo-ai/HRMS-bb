import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    quotation: {
      type: mongoose.Schema.ObjectId,
      ref: "Quotation",
    },
    lead: {
      type: mongoose.Schema.ObjectId,
      ref: "Lead",
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    items: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        total: { type: Number, required: true },
      }
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Unpaid", "Partially Paid", "Paid", "Overdue", "Cancelled"],
      default: "Unpaid",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    notes: String,
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "Employee",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;
