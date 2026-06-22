import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { User } from "../src/models/User.js";
import { Workspace } from "../src/models/Workspace.js";
import { Project } from "../src/models/Project.js";
import { Task } from "../src/models/Task.js";
import { Comment } from "../src/models/Comment.js";
import { Notification } from "../src/models/Notification.js";
import { Activity } from "../src/models/Activity.js";

const securityQuestion = "What was your first school?";
const securityAnswer = "school";
const e2ePassword = "TaskFlow#2026";

async function normalizeSecurityAnswer(answer) {
  return String(answer || "").trim().toLowerCase().replace(/\s+/g, " ");
}

async function seed() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("MONGODB_URI environment variable is missing.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB at:", mongoUri.split("@").pop());
  await mongoose.connect(mongoUri);
  console.log("Connected successfully. Starting seed...");

  // 1. Clear existing demo data (or all data to keep Atlas cluster clean)
  console.log("Clearing existing collections...");
  await User.deleteMany({ email: { $in: ["demo@example.com", "sarah.admin@example.com", "david.member@example.com", "priya.member@example.com"] } });
  // We can locate workpaces owned or membered by these users
  const demoUserEmails = ["demo@example.com", "sarah.admin@example.com", "david.member@example.com", "priya.member@example.com"];
  
  // Let's create users
  console.log("Creating demo team users...");
  const hashedAnswer = await bcrypt.hash(await normalizeSecurityAnswer(securityAnswer), 12);
  const passwordHash = await bcrypt.hash(e2ePassword, 12);

  const suhas = new User({
    name: "Naguru Suhas",
    email: "demo@example.com",
    username: "suhas-cits1993",
    password: e2ePassword,
    securityQuestion,
    securityAnswerHash: hashedAnswer,
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Naguru%20Suhas"
  });
  await suhas.save();

  const sarah = new User({
    name: "Sarah Jenkins",
    email: "sarah.admin@example.com",
    username: "sarah-jenkins",
    password: e2ePassword,
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Sarah%20Jenkins"
  });
  await sarah.save();

  const david = new User({
    name: "David Chen",
    email: "david.member@example.com",
    username: "david-chen",
    password: e2ePassword,
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=David%20Chen"
  });
  await david.save();

  const priya = new User({
    name: "Priya Sharma",
    email: "priya.member@example.com",
    username: "priya-sharma",
    password: e2ePassword,
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Priya%20Sharma"
  });
  await priya.save();

  // Clean old workspaces of these users
  const userIds = [suhas._id, sarah._id, david._id, priya._id];
  await Workspace.deleteMany({ owner: { $in: userIds } });
  
  // 2. Create Workspace
  console.log("Creating demo Workspace...");
  const workspace = new Workspace({
    name: "Codtech Product Engineering",
    description: "Main collaboration workspace for the TaskFlow platform development, agile tracking, and deployment audits.",
    owner: suhas._id,
    inviteCode: crypto.randomBytes(8).toString("hex"),
    members: [
      { user: suhas._id, role: "Owner" },
      { user: sarah._id, role: "Admin" },
      { user: david._id, role: "Member" },
      { user: priya._id, role: "Member" }
    ]
  });
  await workspace.save();

  // Clean old projects/tasks/comments/notifications/activities for this workspace
  await Project.deleteMany({ workspace: workspace._id });
  await Task.deleteMany({ workspace: workspace._id });
  await Comment.deleteMany({ task: { $in: [] } }); // Cleaned below
  await Notification.deleteMany({ workspace: workspace._id });
  await Activity.deleteMany({ workspace: workspace._id });

  // 3. Create Projects
  console.log("Creating demo Projects...");
  const project1 = new Project({
    workspace: workspace._id,
    title: "TaskFlow MVP Release",
    description: "Core features implementation, security audits, E2E testing, and production deployment workflows.",
    status: "Active",
    members: [suhas._id, sarah._id, david._id, priya._id],
    createdBy: suhas._id
  });
  await project1.save();

  const project2 = new Project({
    workspace: workspace._id,
    title: "Mobile Client Prototyping",
    description: "UI/UX mockups, responsive components styling, and prototype reviews for the mobile companion app.",
    status: "Planning",
    members: [suhas._id, sarah._id],
    createdBy: suhas._id
  });
  await project2.save();

  // 4. Create Tasks
  console.log("Creating demo Tasks...");
  
  // Task 1: Completed
  const task1 = new Task({
    workspace: workspace._id,
    project: project1._id,
    title: "Configure Socket.io real-time engine",
    description: "Integrate WebSocket server on backend and wire up live hooks in the React Kanban board for instantaneous status updates.",
    status: "Completed",
    priority: "Critical",
    assignedUser: david._id,
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    tags: ["Backend", "WebSockets"],
    createdBy: suhas._id
  });
  await task1.save();

  // Task 2: Review
  const task2 = new Task({
    workspace: workspace._id,
    project: project1._id,
    title: "Design Analytics Dashboard & Recharts",
    description: "Create visual dashboards for metrics including productivity score, completion rates, team workload, and activity feeds using Recharts.",
    status: "Review",
    priority: "High",
    assignedUser: priya._id,
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
    tags: ["Frontend", "DataViz"],
    createdBy: suhas._id
  });
  await task2.save();

  // Task 3: In Progress
  const task3 = new Task({
    workspace: workspace._id,
    project: project1._id,
    title: "Setup Passport.js Google OAuth Strategy",
    description: "Register GCP OAuth client, configure routing, define callback controllers, and map external profile parameters to Mongoose schema.",
    status: "In Progress",
    priority: "Medium",
    assignedUser: sarah._id,
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // In 4 days
    tags: ["Auth", "Security"],
    createdBy: suhas._id
  });
  await task3.save();

  // Task 4: To Do (High)
  const task4 = new Task({
    workspace: workspace._id,
    project: project1._id,
    title: "Write Playwright E2E automation suite",
    description: "Draft comprehensive test specs validating user onboarding, workspace switches, project creation, task assignments, and RBAC blocks.",
    status: "To Do",
    priority: "High",
    assignedUser: suhas._id,
    dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // In 6 days
    tags: ["Testing", "QA"],
    createdBy: sarah._id
  });
  await task4.save();

  // Task 5: To Do (Low)
  const task5 = new Task({
    workspace: workspace._id,
    project: project1._id,
    title: "Vercel & Render Production Deployments",
    description: "Establish automated GitHub build pipelines, add environment variables/secrets on remote hosts, and perform live verification tests.",
    status: "To Do",
    priority: "Low",
    assignedUser: sarah._id,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // In 10 days
    tags: ["DevOps", "Cloud"],
    createdBy: suhas._id
  });
  await task5.save();

  // 5. Create Comments
  console.log("Creating demo Comments...");
  const comment1 = new Comment({
    task: task1._id,
    user: priya._id,
    body: "I verified the WebSocket room separation locally. Updates broadcast instantly and cleanly without leaking workspace data."
  });
  await comment1.save();

  const comment2 = new Comment({
    task: task1._id,
    user: david._id,
    body: "Excellent feedback! I've updated the connection keep-alives and verified reconnection logic on network drop. Closing task."
  });
  await comment2.save();

  const comment3 = new Comment({
    task: task2._id,
    user: suhas._id,
    body: "The analytics layout looks incredibly polished. Let's make sure the Recharts tooltips display correct values in both light and dark mode."
  });
  await comment3.save();

  // Update task comment counters (or comments exist as collection)
  // Our schema tracks comments in a separate model, the normalizeTask extracts commentCount as count.
  
  // 6. Create Notifications
  console.log("Creating demo Notifications...");
  // Unread for Suhas
  const notif1 = new Notification({
    user: suhas._id,
    workspace: workspace._id,
    type: "Comment Added",
    title: "New comment on Design Analytics Dashboard",
    body: "Priya Sharma uploaded initial Recharts screens and requested feedback.",
    unread: true,
    entity: { kind: "Task", id: task2._id }
  });
  await notif1.save();

  // Read for Suhas
  const notif2 = new Notification({
    user: suhas._id,
    workspace: workspace._id,
    type: "Task Completed",
    title: "Task Completed: Configure Socket.io real-time engine",
    body: "David Chen marked the task as Completed.",
    unread: false,
    entity: { kind: "Task", id: task1._id }
  });
  await notif2.save();

  // Unread for Suhas
  const notif3 = new Notification({
    user: suhas._id,
    workspace: workspace._id,
    type: "Task Assigned",
    title: "Task Assigned: Write Playwright E2E automation suite",
    body: "Sarah Jenkins assigned you a new task.",
    unread: true,
    entity: { kind: "Task", id: task4._id }
  });
  await notif3.save();

  // 7. Create Activities
  console.log("Creating demo Activities...");
  const activities = [
    { workspace: workspace._id, actor: suhas._id, action: "created", targetType: "Workspace", targetName: "Codtech Product Engineering" },
    { workspace: workspace._id, actor: sarah._id, action: "joined", targetType: "Workspace", targetName: "Codtech Product Engineering" },
    { workspace: workspace._id, actor: david._id, action: "joined", targetType: "Workspace", targetName: "Codtech Product Engineering" },
    { workspace: workspace._id, actor: priya._id, action: "joined", targetType: "Workspace", targetName: "Codtech Product Engineering" },
    { workspace: workspace._id, actor: suhas._id, action: "created", targetType: "Project", targetName: "TaskFlow MVP Release" },
    { workspace: workspace._id, actor: suhas._id, action: "created", targetType: "Project", targetName: "Mobile Client Prototyping" },
    { workspace: workspace._id, actor: suhas._id, action: "created", targetType: "Task", targetName: "Configure Socket.io real-time engine" },
    { workspace: workspace._id, actor: david._id, action: "updated", targetType: "Task", targetName: "Configure Socket.io real-time engine", metadata: { status: "In Progress" } },
    { workspace: workspace._id, actor: david._id, action: "completed", targetType: "Task", targetName: "Configure Socket.io real-time engine" },
    { workspace: workspace._id, actor: priya._id, action: "commented on", targetType: "Task", targetName: "Configure Socket.io real-time engine" },
    { workspace: workspace._id, actor: priya._id, action: "updated", targetType: "Task", targetName: "Design Analytics Dashboard & Recharts", metadata: { status: "Review" } }
  ];

  await Activity.insertMany(activities);

  console.log("Database seeded successfully with professional demo data!");
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

seed().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
