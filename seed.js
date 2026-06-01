import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./src/modules/auth/user.model.js";
import Attendance from "./src/modules/attendance/attendance.model.js";
import Project from "./src/modules/project/project.model.js";
import Timesheet from "./src/modules/timesheet/timesheet.model.js";
import Payslip from "./src/modules/payroll/payslip.model.js";
import Department from "./src/modules/department/department.model.js";
import Lead from "./src/modules/sales/lead.model.js";
import SalesActivity from "./src/modules/sales/salesActivity.model.js";
import Dwr from "./src/modules/sales/dwr.model.js";

dotenv.config();

const employeesToSeed = [
  {
    name: "Sarah Jenkins",
    email: "sarah@worksphere.io",
    role: "hr_admin",
    position: "HR Director",
    department: "People Operations"
  },
  {
    name: "David Miller",
    email: "david@worksphere.io",
    role: "manager",
    position: "Engineering Lead",
    department: "Product Engineering"
  },
  {
    name: "Alex Johnson",
    email: "alex@worksphere.io",
    role: "standard_employee",
    position: "Senior Frontend Engineer",
    department: "SaaS Development"
  },
  {
    name: "Julian Day",
    email: "julian@worksphere.io",
    role: "standard_employee",
    position: "Design Director",
    department: "Design & UX"
  },
  {
    name: "Elena Rodriguez",
    email: "elena@worksphere.io",
    role: "standard_employee",
    position: "VP Growth",
    department: "Marketing"
  },
  {
    name: "Amara Kante",
    email: "amara@worksphere.io",
    role: "standard_employee",
    position: "Business Development Associate",
    department: "Sales"
  },
  {
    name: "Marcus Vance",
    email: "marcus@worksphere.io",
    role: "standard_employee",
    position: "Business Development Manager",
    department: "Sales"
  }
];

async function seed() {
  try {
    const connUri = process.env.MONGODB_URI;
    await mongoose.connect(connUri);
    console.log("Connected to MongoDB.");

    // Delete existing standard seeded users to avoid duplicates
    const emailsToSeed = employeesToSeed.map(e => e.email);
    await User.deleteMany({ email: { $in: emailsToSeed } });
    console.log("Cleared existing seeded users if any.");

    const createdUsers = [];
    const passwordHash = await bcrypt.hash("password123", 12);

    for (const empData of employeesToSeed) {
      const userObj = new User({
        ...empData,
        password: passwordHash
      });
      // Generate standard empId
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      userObj.empId = `WS-${randomNum}`;
      
      const randomAadhaar = Array.from({ length: 3 }, () => Math.floor(1000 + Math.random() * 9000)).join(" ");
      const randomPAN = "ABCDE" + Math.floor(1000 + Math.random() * 9000) + "F";
      userObj.aadhaarNumber = randomAadhaar;
      userObj.panNumber = randomPAN;
      userObj.aadhaarCardDoc = "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=300";
      userObj.panCardDoc = "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=300";

      await userObj.save();
      createdUsers.push(userObj);
      console.log(`Seeded user: ${userObj.name} (${userObj.role})`);
    }

    // Seed Corporate Departments
    await Department.deleteMany({});
    console.log("Cleared existing departments.");

    const findUserByName = (name) => createdUsers.find(u => u.name === name);

    const departmentsToSeed = [
      {
        name: "Product Engineering",
        desc: "Organized corporate product engineering division focused on high-scalability web portals and microservices.",
        leader: findUserByName("David Miller")?._id,
        budget: "₹5.0Cr / yr",
        hiringStatus: "2 Openings",
        efficiency: 96,
        accentColor: "border-l-indigo-600",
        barColor: "bg-indigo-600",
      },
      {
        name: "Design & UX",
        desc: "Corporate user experience design vertical establishing organizational design systems and interactive interfaces.",
        leader: findUserByName("Julian Day")?._id,
        budget: "₹1.5Cr / yr",
        hiringStatus: "1 Opening",
        efficiency: 94,
        accentColor: "border-l-sky-600",
        barColor: "bg-sky-400",
      },
      {
        name: "Marketing",
        desc: "Growth hacking and corporate marketing operation tasked with brand expansion and SaaS demand generation.",
        leader: findUserByName("Elena Rodriguez")?._id,
        budget: "₹2.0Cr / yr",
        hiringStatus: "3 Openings",
        efficiency: 95,
        accentColor: "border-l-emerald-600",
        barColor: "bg-emerald-500",
      },
      {
        name: "People Operations",
        desc: "Corporate human resources vertical managing workforce registrations, compensation planning, and talent registry metrics.",
        leader: findUserByName("Sarah Jenkins")?._id,
        budget: "₹1.0Cr / yr",
        hiringStatus: "1 Opening",
        efficiency: 98,
        accentColor: "border-l-rose-600",
        barColor: "bg-rose-500",
      },
      {
        name: "Sales",
        desc: "High-performance business development vertical driving SaaS client acquisition and corporate revenue growth.",
        leader: findUserByName("Marcus Vance")?._id,
        budget: "₹3.5Cr / yr",
        hiringStatus: "2 Openings",
        efficiency: 97,
        accentColor: "border-l-indigo-600",
        barColor: "bg-indigo-600",
      }
    ];

    for (const deptData of departmentsToSeed) {
      if (deptData.leader) {
        await Department.create(deptData);
        console.log(`Seeded department: ${deptData.name} linked to manager.`);
      } else {
        console.log(`Skipped seeding department: ${deptData.name} due to missing manager user.`);
      }
    }

    // Now, let's delete existing attendance logs for these seeded users
    const userIds = createdUsers.map(u => u._id);
    await Attendance.deleteMany({ employee: { $in: userIds } });
    console.log("Cleared existing attendance logs for these seeded users.");

    // Let's generate attendance logs for the last 30 days (from day 1 to day 27 of May 2026, or general 30 days)
    const logsToCreate = [];
    const today = new Date("2026-05-27T12:00:00.000Z");

    for (let d = 1; d <= 27; d++) {
      const dayDate = new Date(today.getFullYear(), today.getMonth(), d, 12, 0, 0);
      
      // Skip some weekends to make it look realistic (Saturday = 6, Sunday = 0)
      const dayOfWeek = dayDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Only 10% chance of anyone working on weekend
        if (Math.random() > 0.1) continue;
      }

      const dateString = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

      for (const user of createdUsers) {
        // 10% chance of being absent on any weekday
        if (Math.random() < 0.1) continue;

        // Choose random mode
        const modes = ["Office", "WFH", "Field"];
        const modeWeights = [0.6, 0.3, 0.1]; // 60% Office, 30% WFH, 10% Field
        const rand = Math.random();
        let mode = "Office";
        if (rand < 0.6) mode = "Office";
        else if (rand < 0.9) mode = "WFH";
        else mode = "Field";

        // Choose random check-in time (between 8:15 AM and 10:00 AM)
        const checkInHour = Math.random() < 0.7 ? 8 : 9; // 70% chance of 8 AM, 30% chance of 9 AM
        const checkInMinute = Math.floor(Math.random() * 60);

        const clockInDate = new Date(dayDate);
        clockInDate.setHours(checkInHour, checkInMinute, 0, 0);

        let status = "Present";
        let isLate = false;
        if (checkInHour > 9 || (checkInHour === 9 && checkInMinute > 30)) {
          status = "Late";
          isLate = true;
        }

        // Choose random check-out time (between 5:00 PM and 6:30 PM)
        const clockOutDate = new Date(dayDate);
        clockOutDate.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);

        const diffMs = clockOutDate - clockInDate;
        const diffHrs = Math.floor(diffMs / 3600000);
        const diffMins = Math.floor((diffMs % 3600000) / 60000);
        const timeSpent = `${diffHrs}h ${diffMins}m`;

        const location = mode === "Office" ? "Headquarters" : mode === "WFH" ? "Remote (Home Office)" : "Client Site";

        logsToCreate.push({
          employee: user._id,
          date: dateString,
          clockIn: clockInDate,
          clockOut: clockOutDate,
          status,
          isLate,
          location,
          mode,
          timeSpent
        });
      }
    }

    await Attendance.insertMany(logsToCreate);
    console.log(`Successfully seeded ${logsToCreate.length} attendance records.`);

    // Seed Projects
    await Project.deleteMany({});
    console.log("Cleared existing projects.");

    const managerUser = createdUsers.find(u => u.role === "manager") || createdUsers[0];
    const developerUsers = createdUsers.filter(u => u.role === "standard_employee");

    const projectsToCreate = [
      {
        name: "Acme Web App Redesign",
        desc: "Design and implement a modern responsive web portal using React + TailwindCSS.",
        leader: managerUser._id,
        headcount: 3,
        budget: "₹12.50L",
        status: "In Progress",
        efficiency: 95
      },
      {
        name: "Enterprise HR System Migration",
        desc: "Migrate legacy databases and authentication structures to standard JWT secure pipelines.",
        leader: managerUser._id,
        headcount: 2,
        budget: "₹8.00L",
        status: "Planning",
        efficiency: 90
      },
      {
        name: "Cloud Billing Architecture Optimization",
        desc: "Optimize cloud usage cost centers and dockerize staging pipelines for cost savings.",
        leader: managerUser._id,
        headcount: 1,
        budget: "₹4.50L",
        status: "Delayed",
        efficiency: 82
      }
    ];

    await Project.insertMany(projectsToCreate);
    console.log("Successfully seeded projects.");

    // Seed Timesheets
    await Timesheet.deleteMany({});
    console.log("Cleared existing timesheets.");

    const timesheetsToCreate = [];
    const weeks = ["May 29, 2026", "May 22, 2026", "May 15, 2026"];

    for (const dev of developerUsers) {
      let index = 0;
      for (const wk of weeks) {
        // First week is pending, other weeks are approved/rejected to make it look realistic
        const status = index === 0 ? "Pending" : index === 1 ? "Approved" : "Rejected";
        timesheetsToCreate.push({
          employee: dev._id,
          weekEnding: wk,
          totalHours: 35 + Math.floor(Math.random() * 8), // 35 to 42 hours
          allocation: 100 - (index * 20), // 100%, 80%, 60%
          status
        });
        index++;
      }
    }

    await Timesheet.insertMany(timesheetsToCreate);
    console.log(`Successfully seeded ${timesheetsToCreate.length} timesheets.`);

    // Seed Payslips
    await Payslip.deleteMany({});
    console.log("Cleared existing payslips.");

    const payslipsToCreate = [];
    const periods = ["April 2026", "March 2026", "February 2026"];

    for (const user of createdUsers) {
      // 15% standard income tax deduction
      const baseSalary = user.role === "hr_admin" ? 95000 : user.role === "manager" ? 120000 : 85000;
      const taxWithheld = Math.round(baseSalary * 0.15);
      const netPay = baseSalary - taxWithheld;

      for (const prd of periods) {
        payslipsToCreate.push({
          employee: user._id,
          period: prd,
          baseSalary,
          taxWithheld,
          netPay,
          status: "Disbursed"
        });
      }
    }

    await Payslip.insertMany(payslipsToCreate);
    console.log(`Successfully seeded ${payslipsToCreate.length} payslips.`);

    // Clear existing Sales collections
    await Lead.deleteMany({});
    await SalesActivity.deleteMany({});
    await Dwr.deleteMany({});
    console.log("Cleared existing CRM Sales collections.");

    const amaraUser = createdUsers.find(u => u.name === "Amara Kante");
    const marcusUser = createdUsers.find(u => u.name === "Marcus Vance");

    if (amaraUser && marcusUser) {
      const leadsToCreate = [
        {
          name: "Robert Chen",
          company: "Apex Global Corp",
          phone: "+1 (555) 892-3029",
          email: "robert@apexglobal.com",
          source: "LinkedIn Outbound",
          status: "Qualified",
          priority: "High",
          next_followup: "May 30, 2026",
          notes: "Interested in enterprise cloud suite licenses.",
          assignedTo: amaraUser._id,
        },
        {
          name: "Amanda Ross",
          company: "Zenith Tech",
          phone: "+1 (555) 490-2182",
          email: "amanda@zenith.io",
          source: "Cold Email",
          status: "Contacted",
          priority: "Medium",
          next_followup: "Jun 01, 2026",
          notes: "Sent brochure, waiting for a callback.",
          assignedTo: amaraUser._id,
        },
        {
          name: "Vikram Singh",
          company: "Indus Logistics",
          phone: "+1 (555) 902-3920",
          email: "vikram@indus.in",
          source: "Referral",
          status: "Negotiation",
          priority: "High",
          next_followup: "May 29, 2026",
          notes: "Reviewing proposal pricing sheet. BDM handling close.",
          assignedTo: marcusUser._id,
        },
        {
          name: "Claire Dubois",
          company: "Elysian Creative",
          phone: "+1 (555) 309-8402",
          email: "claire@elysian.fr",
          source: "Inbound Demo",
          status: "Meeting Scheduled",
          priority: "High",
          next_followup: "Jun 03, 2026",
          notes: "Scheduled demo for next Monday afternoon.",
          assignedTo: marcusUser._id,
        },
        {
          name: "Thomas Vance",
          company: "Nova Retail",
          phone: "+1 (555) 829-1940",
          email: "vance@novaretail.com",
          source: "Website Signup",
          status: "Lead",
          priority: "Low",
          next_followup: "Jun 05, 2026",
          notes: "New signup, needs discovery call scheduled.",
          assignedTo: amaraUser._id,
        }
      ];

      const createdLeads = await Lead.insertMany(leadsToCreate);
      console.log(`Seeded ${createdLeads.length} leads in DB.`);

      const robertLead = createdLeads.find(l => l.name === "Robert Chen");
      const amandaLead = createdLeads.find(l => l.name === "Amanda Ross");
      const vikramLead = createdLeads.find(l => l.name === "Vikram Singh");

      const activitiesToCreate = [
        {
          lead: robertLead._id,
          leadName: robertLead.name,
          company: robertLead.company,
          type: "call",
          description: "Conducted introductory call. Prospect qualified for Enterprise Plan.",
          duration: "12m 40s",
          outcome: "Qualified & Progressed",
          verified: true,
          createdBy: amaraUser._id,
        },
        {
          lead: amandaLead._id,
          leadName: amandaLead.name,
          company: amandaLead.company,
          type: "email",
          description: "Dispatched custom pricing presentation and features sheet.",
          duration: "N/A",
          outcome: "Pending Response",
          verified: false,
          createdBy: amaraUser._id,
        },
        {
          lead: vikramLead._id,
          leadName: vikramLead.name,
          company: vikramLead.company,
          type: "proposal",
          description: "Dispatched final negotiation quote with 10% discount margin.",
          duration: "N/A",
          outcome: "Negotiation Mode",
          verified: true,
          createdBy: marcusUser._id,
        },
        {
          lead: robertLead._id,
          leadName: robertLead.name,
          company: robertLead.company,
          type: "meeting",
          description: "Verified Client check-in visit. Anti-fake GPS geofence tag verified.",
          duration: "N/A",
          outcome: "Visit Proof Validated",
          verified: true,
          createdBy: amaraUser._id,
        }
      ];

      await SalesActivity.insertMany(activitiesToCreate);
      console.log("Seeded simulated call/meeting activities.");

      const dwrsToCreate = [
        {
          employee: amaraUser._id,
          summary: "Prospected 15 new companies via LinkedIn and completed 12 cold outreach sessions. Managed to qualify Apex Global Corp and scheduled demo.",
          plan: "Conduct follow-up check-ins with Amanda from Zenith Tech and log outcomes.",
          blockers: "None",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
          employee: marcusUser._id,
          summary: "Reviewed three negotiation decks. Conducted final proposal presentation for Indus Logistics.",
          plan: "Close negotiations with Indus Logistics and draft SaaS SLA agreement.",
          blockers: "Review SLA draft requires approval from legal.",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      ];

      await Dwr.insertMany(dwrsToCreate);
      console.log("Seeded Daily Work Reports (DWR).");
    }

  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

seed();
