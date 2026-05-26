import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/modules/auth/user.model.js";
import Category from "./src/modules/category/category.model.js";

dotenv.config();

const users = [
  {
    name: "Sarah Jenkins",
    email: "hr@worksphere.io",
    password: "password123",
    role: "hr_admin",
    position: "HR Director",
    department: "People Operations",
    empId: "WS-00101",
    joinDate: new Date("2021-10-12"),
    phone: "+1 (555) 102-3948",
    address: "882 Park Boulevard, San Francisco, CA 94103",
    skills: ["Talent Acquisition", "Corporate Culture", "Conflict Resolution", "Compensation & Benefits", "Compliance"],
    bankDetails: {
      bankName: "JPMorgan Chase & Co.",
      accountNo: "•••• •••• 1102",
      panNumber: "BBBPJ1024D",
      ifscCode: "CHAS0001204"
    }
  },
  {
    name: "David Miller",
    email: "manager@worksphere.io",
    password: "password123",
    role: "manager",
    position: "Engineering Lead & PM",
    department: "Engineering Services",
    empId: "WS-04802",
    joinDate: new Date("2022-03-18"),
    phone: "+1 (555) 482-9011",
    address: "948 Pine Heights, Denver, CO 80202",
    skills: ["Sprint Planning", "Agile Delivery", "Resource Allocation", "System Architecture", "Direct Mentoring"],
    bankDetails: {
      bankName: "Wells Fargo Clearing",
      accountNo: "•••• •••• 4802",
      panNumber: "CCCND4802A",
      ifscCode: "WFGO0004802"
    }
  },
  {
    name: "Alex Johnson",
    email: "employee@worksphere.io",
    password: "password123",
    role: "standard_employee",
    position: "Senior Developer",
    department: "Engineering & SaaS Architecture",
    empId: "WS-88402",
    joinDate: new Date("2023-01-15"),
    phone: "+1 (555) 382-9029",
    address: "422 Willow Lane, Austin, TX 78701",
    skills: ["React / Next.js", "Tailwind CSS v4", "NodeJS / Express", "Enterprise RBAC Architectures", "Geofencing APIs"],
    bankDetails: {
      bankName: "Silicon Valley Clearing Bank",
      accountNo: "•••• •••• 9840",
      panNumber: "AAAPJ9082F",
      ifscCode: "SVCB0008842"
    }
  }
];

const categories = [
  { name: "Engineering", description: "Technical and code-related tasks" },
  { name: "Creative", description: "Design, corporate typography, and art-related tasks" },
  { name: "Product", description: "Scrum management, sprint planning, and roadmap tasks" },
  { name: "Backend", description: "Database setups, server clusters, and caching tasks" }
];

const seedDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hrm-saas";
    console.log("Connecting to database for seeding...");
    await mongoose.connect(connUri);
    console.log("Connected to MongoDB.");

    // Delete existing users to ensure clean state
    console.log("Clearing existing users...");
    await User.deleteMany();

    // Create new users. This will automatically execute Mongoose pre-save middleware to hash passwords!
    console.log("Inserting dummy users...");
    for (const u of users) {
      await User.create(u);
    }

    // Delete existing categories
    console.log("Clearing existing categories...");
    await Category.deleteMany();

    // Create default categories
    console.log("Inserting default categories...");
    for (const c of categories) {
      await Category.create(c);
    }

    console.log("Database seeded successfully with dummy users and categories!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();
