import catchAsync from "../../utils/catchAsync.js";
import Quotation from "./quotation.model.js";
import Lead from "./lead.model.js";
import SalesActivity from "./salesActivity.model.js";

export const generateQuotation = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Sales']
  const { leadId, items, subtotal, tax, totalAmount, validUntil, notes } = req.body;

  const lead = await Lead.findById(leadId);
  if (!lead) {
    return res.status(404).json({ status: "fail", message: "Lead not found" });
  }

  const quotationNumber = `QT-${Date.now()}`;

  const quotation = await Quotation.create({
    lead: leadId,
    quotationNumber,
    items,
    subtotal,
    tax,
    totalAmount,
    validUntil,
    notes,
    createdBy: req.user.id,
  });

  // Log activity
  const newActivity = await SalesActivity.create({
    lead: leadId,
    leadName: lead.name,
    company: lead.company,
    type: "email",
    description: `Generated Quotation ${quotationNumber} for amount ${totalAmount}`,
    duration: "N/A",
    outcome: "Quote Sent",
    verified: true,
    createdBy: req.user.id,
  });

  const io = req.app.get("io");
  if (io) {
    io.emit("activity_added", newActivity);
  }

  res.status(201).json({
    status: "success",
    data: {
      quotation
    }
  });
});

export const getQuotations = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Sales']
  const quotations = await Quotation.find().populate('lead', 'name company');

  res.status(200).json({
    status: "success",
    results: quotations.length,
    data: {
      quotations
    }
  });
});



export const updateQuotation = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Sales']
  const quotation = await Quotation.findById(req.params.id);

  if (!quotation) {
    return res.status(404).json({ status: "fail", message: "Quotation not found" });
  }

  const { items, subtotal, tax, totalAmount, validUntil, notes, status } = req.body;

  quotation.items = items || quotation.items;
  quotation.subtotal = subtotal !== undefined ? subtotal : quotation.subtotal;
  quotation.tax = tax !== undefined ? tax : quotation.tax;
  quotation.totalAmount = totalAmount !== undefined ? totalAmount : quotation.totalAmount;
  quotation.validUntil = validUntil || quotation.validUntil;
  quotation.notes = notes !== undefined ? notes : quotation.notes;
  quotation.status = status || quotation.status;

  await quotation.save();

  const io = req.app.get("io");
  if (io) {
    io.emit("quotation_updated", quotation);
  }

  res.status(200).json({
    status: "success",
    data: {
      quotation
    }
  });
});

export const deleteQuotation = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Sales']
  const quotation = await Quotation.findByIdAndDelete(req.params.id);

  if (!quotation) {
    return res.status(404).json({ status: "fail", message: "Quotation not found" });
  }

  const io = req.app.get("io");
  if (io) {
    io.emit("quotation_deleted", req.params.id);
  }

  res.status(204).json({
    status: "success",
    data: null
  });
});
