import mongoose from "mongoose";

const quotationSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.ObjectId,
      ref: "Lead",
      required: true,
    },
    quotationNumber: {
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
      enum: ["Draft", "Sent", "Accepted", "Rejected"],
      default: "Draft",
    },
    validUntil: {
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

const Quotation = mongoose.model("Quotation", quotationSchema);
export default Quotation;
