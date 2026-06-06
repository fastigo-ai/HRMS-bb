import Candidate, { RecruitmentSetting } from "./candidate.model.js";
import Department from "../department/department.model.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";

// 1. Create Candidate
export const createCandidate = catchAsync(async (req, res, next) => {
  const { name, role, email, source, notes } = req.body;

  if (!name || !role) {
    return next(new AppError("Name and target role are required properties!", 400));
  }

  const resumeUrl = req.file ? req.file.path : "";

  const newCandidate = await Candidate.create({
    name,
    role,
    email,
    source: source || "LinkedIn Outbound",
    notes: notes || "",
    resume: resumeUrl,
    stage: "Applied",
    stageHistory: [
      {
        stage: "Applied",
        enteredAt: new Date(),
      },
    ],
  });

  res.status(201).json({
    status: "success",
    data: {
      candidate: newCandidate,
    },
  });
});

// 2. Get All Candidates
export const getCandidates = catchAsync(async (req, res, next) => {
  const candidates = await Candidate.find().sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: candidates.length,
    data: {
      candidates,
    },
  });
});

// 3. Update Candidate Stage
export const updateCandidateStage = catchAsync(async (req, res, next) => {
  const { stage } = req.body;

  const validStages = ["Applied", "Screening", "Technical Round", "Manager Round", "Offer Extended", "Hired", "Rejected"];
  if (!validStages.includes(stage)) {
    return next(new AppError(`Invalid pipeline stage: ${stage}!`, 400));
  }

  const candidate = await Candidate.findById(req.params.id);
  if (!candidate) {
    return next(new AppError("Candidate not found!", 404));
  }

  // Push new stage to stageHistory
  candidate.stage = stage;
  candidate.stageHistory.push({
    stage,
    enteredAt: new Date(),
  });

  if (stage === "Hired") {
    candidate.hiredAt = new Date();
  }

  await candidate.save();

  res.status(200).json({
    status: "success",
    data: {
      candidate,
    },
  });
});

// 4. Delete Candidate
export const deleteCandidate = catchAsync(async (req, res, next) => {
  const candidate = await Candidate.findByIdAndDelete(req.params.id);
  if (!candidate) {
    return next(new AppError("Candidate not found!", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// 5. Get Recruitment Metrics
export const getCandidateMetrics = catchAsync(async (req, res, next) => {
  const candidates = await Candidate.find();

  const totalCandidates = candidates.length;
  const activeCandidates = candidates.filter(c => c.stage !== "Hired" && c.stage !== "Rejected").length;

  let setting = await RecruitmentSetting.findOne({ key: "openPositions" });
  const openPositions = setting ? setting.value : 8;

  // Calculate Time-to-Hire
  const hiredCandidates = candidates.filter(c => c.stage === "Hired" && c.hiredAt);
  let totalDays = 0;
  hiredCandidates.forEach(c => {
    const start = c.stageHistory[0]?.enteredAt || c.createdAt;
    const diffTime = Math.abs(new Date(c.hiredAt) - new Date(start));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    totalDays += diffDays;
  });

  const avgTimeToHire = hiredCandidates.length > 0 
    ? Math.round(totalDays / hiredCandidates.length) 
    : 18; // Default fallback to 18 days if no candidates hired yet

  // Sourcing Channels Breakdown
  const channelCounts = {};
  candidates.forEach(c => {
    const ch = c.source || "LinkedIn Outbound";
    channelCounts[ch] = (channelCounts[ch] || 0) + 1;
  });

  const sourcingChannels = Object.keys(channelCounts).map(channel => {
    const count = channelCounts[channel];
    const percentage = totalCandidates > 0 ? Math.round((count / totalCandidates) * 100) : 0;
    return {
      name: channel,
      percentage,
    };
  });

  // Make sure at least default channels exist with 0% if totalCandidates is 0
  const defaultChannels = ["LinkedIn Outbound", "Employee Referral", "Careers Portal", "Agency", "Direct Application"];
  defaultChannels.forEach(ch => {
    if (!sourcingChannels.some(sc => sc.name === ch)) {
      sourcingChannels.push({ name: ch, percentage: 0 });
    }
  });

  res.status(200).json({
    status: "success",
    data: {
      totalCandidates,
      activeCandidates,
      avgTimeToHire,
      sourcingChannels,
      openPositions,
    },
  });
});

// 6. Update Recruitment Metrics / Open Positions
export const updateCandidateMetrics = catchAsync(async (req, res, next) => {
  const { openPositions } = req.body;
  
  if (openPositions === undefined) {
    return next(new AppError("openPositions value is required!", 400));
  }

  let setting = await RecruitmentSetting.findOne({ key: "openPositions" });
  if (!setting) {
    setting = await RecruitmentSetting.create({ key: "openPositions", value: openPositions });
  } else {
    setting.value = openPositions;
    await setting.save();
  }

  res.status(200).json({
    status: "success",
    data: {
      openPositions: setting.value,
    },
  });
});
