import catchAsync from "../../utils/catchAsync.js";
import Lead from "./lead.model.js";

export const getAnalytics = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Sales']
  
  // 1. Lead Velocity (Leads per day over last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const leadsLast30Days = await Lead.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });
  const velocity = (leadsLast30Days / 30).toFixed(1);

  // 2. Average Conversion Time (Closed Won)
  const wonLeads = await Lead.find({ status: "Closed Won" });
  let totalConversionTimeMs = 0;
  wonLeads.forEach(lead => {
    totalConversionTimeMs += (new Date(lead.updatedAt).getTime() - new Date(lead.createdAt).getTime());
  });
  const avgConversionTimeDays = wonLeads.length > 0 
    ? (totalConversionTimeMs / wonLeads.length / (1000 * 60 * 60 * 24)).toFixed(1) 
    : 0;

  // 3. Funnel Drop-off Rates (Counts per stage)
  const pipelineOrder = ["Lead", "Contacted", "Qualified", "Meeting Scheduled", "Negotiation", "Closed Won", "Closed Lost"];
  
  const funnelCounts = await Lead.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  const funnel = {};
  pipelineOrder.forEach(stage => {
    const stageData = funnelCounts.find(f => f._id === stage);
    funnel[stage] = stageData ? stageData.count : 0;
  });

  res.status(200).json({
    status: "success",
    data: {
      velocity: parseFloat(velocity),
      avgConversionTimeDays: parseFloat(avgConversionTimeDays),
      funnel
    }
  });
});
