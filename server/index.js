import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import UserModel from "./models/user.model.js";
import ItemModel from "./models/product.model.js";
import NotificationModel from "./models/notification.model.js";
import dns from "node:dns/promises";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();

app.use(cors());
app.use(express.json({ limit: "12mb" }));

const PORT = Number(process.env.PORT) || 5000;

const DEFAULT_MONGODB_URI =
  "mongodb+srv://admin:1234@cluster0.5fffxlg.mongodb.net/SmartCampus?appName=Cluster0";

function resolveMongoUri() {
  const raw = String(process.env.MONGODB_URI || "").trim();
  if (!raw) return DEFAULT_MONGODB_URI;
  const looksLikePlaceholder =
    /cluster\.\.\.\./i.test(raw) ||
    /@cluster\.mongodb\.net/i.test(raw) ||
    /USER|PASSWORD|<password>/i.test(raw) ||
    !/^mongodb(\+srv)?:\/\//i.test(raw);
  if (looksLikePlaceholder) {
    console.warn(
      "MONGODB_URI is missing or still a placeholder — using project default Atlas URI."
    );
    return DEFAULT_MONGODB_URI;
  }
  return raw;
}

const conStr = resolveMongoUri();

function sanitizeItemImage(raw) {
  if (raw == null || raw === "") return null;
  const s = String(raw).trim();
  if (!/^data:image\/(jpeg|jpg|png|gif|webp);base64,/i.test(s)) return null;
  if (s.length > 10_000_000) return null;
  return s;
}

mongoose
  .connect(conStr)
  .then(() => {
    console.log("Database Connected..");
  })
  .catch((error) => {
    console.error("Database Error...", error.message);
  });

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function requireAdmin(adminUserId) {
  if (!adminUserId) return null;
  const admin = await UserModel.findById(adminUserId).lean();
  if (!admin || !admin.isAdmin) return null;
  return admin;
}

function normalizeOmaniPhoneE164(input) {
  const raw = String(input ?? "")
    .trim()
    .replace(/[\s\-().]/g, "")
    .replace(/^\+/, "");
  let d = raw;
  if (d.startsWith("00968")) d = d.slice(5);
  else if (d.startsWith("968")) d = d.slice(3);
  if (!/^[79]\d{7}$/.test(d)) return null;
  return `968${d}`;
}

  app.post("/register",async(req,res)=>{
    try{
        const {firstname,lastname,email,password}=req.body;
        const emailNorm = String(email ?? "").trim().toLowerCase();
        const user=await UserModel.findOne({email:emailNorm});
        if(user)
            res.send({message:"User Exists"});
        else
            {
                const hpwd=await bcrypt.hash(password,10);
                const newuser=new UserModel({firstname,lastname,email:emailNorm,password:hpwd});
                newuser.save();
                res.send({message:"User Registered"});
            }
    }
    catch(error){
        res.send("Read Error..."+error);
    }
});
app.post("/login",async(req,res)=>{
    try{
        const {email,password}=req.body;
        const emailNorm = String(email ?? "").trim().toLowerCase();
        const user=await UserModel.findOne({email:emailNorm});
        if(user){
            const match=await bcrypt.compare(password,user.password);
            if(match){
                const safeUser=user.toObject();
                delete safeUser.password;
                res.send({user:safeUser,message:"success"});
            }
            else
                res.send({message:"Invalid Credentials"});
        } 
        else
            {
                res.send({message:"Invalid Credentials"});
            }
    }
    catch(error){
        res.send("Read Error..."+error);
    }
});

app.put("/profile", async (req, res) => {
  try {
    const { userId, firstname, lastname, email, oldPassword, newPassword } =
      req.body;
    const emailNorm = String(email ?? "").trim().toLowerCase();
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (emailNorm !== user.email) {
      const taken = await UserModel.findOne({ email: emailNorm });
      if (taken) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }
    if (newPassword) {
      if (!oldPassword) {
        return res
          .status(400)
          .json({ message: "Current password is required" });
      }
      const match = await bcrypt.compare(oldPassword, user.password);
      if (!match) {
        return res.status(400).json({ message: "Current password is wrong" });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }
    user.firstname = String(firstname ?? "").trim();
    user.lastname = String(lastname ?? "").trim();
    user.email = emailNorm;
    await user.save();
    const safeUser = user.toObject();
    delete safeUser.password;
    res.send({ user: safeUser, message: "Profile updated" });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
});

/** Reset password by email (no email service — suitable for campus demo). */
app.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email and new password are required" });
    }
    if (String(newPassword).length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    const user = await UserModel.findOne({ email: String(email).trim() });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.send({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Password reset failed" });
  }
});

app.get("/items", async (req, res) => {
  try {
    const { type } = req.query;
    if (type !== "lost" && type !== "found") {
      return res.status(400).json({ message: "Query type must be lost or found" });
    }
    const items = await ItemModel.find({
      listingType: type,
      hidden: { $ne: true },
      resolved: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .lean();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Could not load items" });
  }
});

app.post("/items", async (req, res) => {
  try {
    const {
      userId,
      listingType,
      productName,
      phone,
      incidentDate,
      incidentLocation,
      description,
      latitude,
      longitude,
      image,
    } = req.body;
    if (
      !userId ||
      !listingType ||
      !productName ||
      !phone ||
      !incidentLocation ||
      !description
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (listingType !== "lost" && listingType !== "found") {
      return res.status(400).json({ message: "Invalid listing type" });
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const date = new Date(incidentDate);
    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({ message: "Invalid incident date" });
    }
    let lat =
      latitude === "" || latitude === undefined || latitude === null
        ? null
        : Number(latitude);
    let lng =
      longitude === "" || longitude === undefined || longitude === null
        ? null
        : Number(longitude);
    if (lat != null && (Number.isNaN(lat) || lat < -90 || lat > 90)) {
      return res.status(400).json({ message: "Invalid latitude" });
    }
    if (lng != null && (Number.isNaN(lng) || lng < -180 || lng > 180)) {
      return res.status(400).json({ message: "Invalid longitude" });
    }

    const phoneNorm = normalizeOmaniPhoneE164(phone);
    if (!phoneNorm) {
      return res.status(400).json({ message: "Invalid Omani phone number" });
    }

    let imageStored = null;
    if (image != null && String(image).trim() !== "") {
      imageStored = sanitizeItemImage(image);
      if (!imageStored) {
        return res.status(400).json({ message: "Invalid image (use JPG, PNG, GIF, or WebP under ~8 MB)" });
      }
    }

    const item = await ItemModel.create({
      userId,
      listingType,
      productName: String(productName).trim(),
      phone: phoneNorm,
      incidentDate: date,
      incidentLocation: String(incidentLocation).trim(),
      description: String(description).trim(),
      latitude: lat,
      longitude: lng,
      image: imageStored,
      hidden: false,
      resolved: false,
    });
    const created = await ItemModel.findById(item._id).lean();

    try {
      const posterLabel =
        [user.firstname, user.lastname].filter(Boolean).join(" ").trim() ||
        "A campus user";
      const shortName = String(productName).trim().slice(0, 80);
      await NotificationModel.create({
        title:
          listingType === "found"
            ? "New found listing"
            : "New lost listing",
        body: `${posterLabel} posted “${shortName}”. Check the ${listingType} feed.`,
        link: listingType === "found" ? "/found" : "/lost",
        createdBy: user._id,
      });
    } catch (notifErr) {
      console.error("Broadcast notification failed:", notifErr);
    }

    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: "Could not create item" });
  }
});

app.put("/items/:id", async (req, res) => {
  try {
    const {
      userId,
      productName,
      phone,
      incidentDate,
      incidentLocation,
      description,
      latitude,
      longitude,
      image,
    } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
    const item = await ItemModel.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    if (String(item.userId) !== String(userId)) {
      return res.status(403).json({ message: "You can only edit your own listings" });
    }
    const date = new Date(incidentDate);
    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({ message: "Invalid incident date" });
    }
    let lat =
      latitude === "" || latitude === undefined || latitude === null
        ? null
        : Number(latitude);
    let lng =
      longitude === "" || longitude === undefined || longitude === null
        ? null
        : Number(longitude);
    if (lat != null && (Number.isNaN(lat) || lat < -90 || lat > 90)) {
      return res.status(400).json({ message: "Invalid latitude" });
    }
    if (lng != null && (Number.isNaN(lng) || lng < -180 || lng > 180)) {
      return res.status(400).json({ message: "Invalid longitude" });
    }

    const phoneNorm = normalizeOmaniPhoneE164(phone);
    if (!phoneNorm) {
      return res.status(400).json({ message: "Invalid Omani phone number" });
    }

    if (image !== undefined) {
      if (image == null || String(image).trim() === "") {
        item.image = null;
      } else {
        const imageStored = sanitizeItemImage(image);
        if (!imageStored) {
          return res.status(400).json({ message: "Invalid image (use JPG, PNG, GIF, or WebP under ~8 MB)" });
        }
        item.image = imageStored;
      }
    }

    item.productName = String(productName).trim();
    item.phone = phoneNorm;
    item.incidentDate = date;
    item.incidentLocation = String(incidentLocation).trim();
    item.description = String(description).trim();
    item.latitude = lat;
    item.longitude = lng;
    await item.save();
    const updated = await ItemModel.findById(item._id).lean();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Could not update item" });
  }
});

/** Owner: lost → mark as found; found → mark as returned to owner. Public feeds hide when resolved is true. */
app.patch("/items/:id/resolution", async (req, res) => {
  try {
    const { userId, resolved } = req.body;
    if (!userId || typeof resolved !== "boolean") {
      return res
        .status(400)
        .json({ message: "userId and resolved (boolean) are required" });
    }
    const item = await ItemModel.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    if (String(item.userId) !== String(userId)) {
      return res
        .status(403)
        .json({ message: "You can only update your own listings" });
    }
    if (item.listingType !== "lost" && item.listingType !== "found") {
      return res.status(400).json({ message: "Invalid listing type" });
    }
    item.resolved = resolved;
    await item.save();
    res.json(await ItemModel.findById(item._id).lean());
  } catch (error) {
    res.status(500).json({ message: "Could not update listing status" });
  }
});

app.delete("/items/:id", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
    const item = await ItemModel.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    if (String(item.userId) !== String(userId)) {
      return res.status(403).json({ message: "You can only delete your own listings" });
    }
    await item.deleteOne();
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Could not delete item" });
  }
});

/** Broadcast notifications (created by admin) — all users can read. */
app.get("/notifications", async (req, res) => {
  try {
    const list = await NotificationModel.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: "Could not load notifications" });
  }
});

/** Admin only: post a campus-wide notification. */
app.post("/admin/notifications", async (req, res) => {
  try {
    const { adminUserId, title, body, link } = req.body;
    if (!adminUserId || !title || !body) {
      return res
        .status(400)
        .json({ message: "adminUserId, title, and body are required" });
    }
    const admin = await UserModel.findById(adminUserId);
    if (!admin || !admin.isAdmin) {
      return res.status(403).json({ message: "Only admins can send notifications" });
    }
    let safeLink = "/home";
    const l = String(link ?? "").trim();
    if (l.startsWith("/") && !l.startsWith("//")) {
      safeLink = l.slice(0, 200);
    }
    const doc = await NotificationModel.create({
      title: String(title).trim().slice(0, 120),
      body: String(body).trim().slice(0, 500),
      link: safeLink,
      createdBy: admin._id,
    });
    res.status(201).json(doc);
  } catch (error) {
    res.status(500).json({ message: "Could not create notification" });
  }
});

/** Admin dashboard: user/listings counts and latest sign-ups. */
app.get("/admin/stats", async (req, res) => {
  try {
    const adminUserId = req.query.adminUserId;
    if (!(await requireAdmin(adminUserId))) {
      return res.status(403).json({ message: "Admin access required" });
    }
    const visibleFilter = { hidden: { $ne: true }, resolved: { $ne: true } };
    const [
      userCount,
      listingVisibleCount,
      lostVisible,
      foundVisible,
      hiddenListings,
      totalListings,
      latestUsersRaw,
    ] = await Promise.all([
      UserModel.countDocuments({}),
      ItemModel.countDocuments(visibleFilter),
      ItemModel.countDocuments({ ...visibleFilter, listingType: "lost" }),
      ItemModel.countDocuments({ ...visibleFilter, listingType: "found" }),
      ItemModel.countDocuments({ hidden: true }),
      ItemModel.countDocuments({}),
      UserModel.find({})
        .sort({ createdAt: -1 })
        .limit(8)
        .select("firstname lastname email createdAt")
        .lean(),
    ]);
    const latestUsers = latestUsersRaw.map((u) => ({
      firstname: u.firstname,
      lastname: u.lastname,
      email: u.email,
      createdAt: u.createdAt,
    }));
    res.json({
      userCount,
      listingVisibleCount,
      lostVisible,
      foundVisible,
      hiddenListings,
      totalListings,
      latestUsers,
    });
  } catch (error) {
    res.status(500).json({ message: "Could not load stats" });
  }
});

/** Admin: all listings including hidden, with optional type filter and search. */
app.get("/admin/items", async (req, res) => {
  try {
    const adminUserId = req.query.adminUserId;
    if (!(await requireAdmin(adminUserId))) {
      return res.status(403).json({ message: "Admin access required" });
    }
    const type = String(req.query.type ?? "all").toLowerCase();
    const q = String(req.query.q ?? "").trim();
    const query = {};
    if (type === "lost" || type === "found") {
      query.listingType = type;
    } else if (type !== "all") {
      return res
        .status(400)
        .json({ message: "type must be all, lost, or found" });
    }
    if (q) {
      const rx = new RegExp(escapeRegex(q), "i");
      query.$or = [
        { productName: rx },
        { description: rx },
        { incidentLocation: rx },
      ];
    }
    const items = await ItemModel.find(query)
      .sort({ createdAt: -1 })
      .limit(300)
      .lean();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Could not load listings" });
  }
});

/** Admin: hide or un-hide a listing (still in DB; hidden from public feeds). */
app.patch("/admin/items/:id", async (req, res) => {
  try {
    const { adminUserId, hidden } = req.body;
    if (!(await requireAdmin(adminUserId))) {
      return res.status(403).json({ message: "Admin access required" });
    }
    if (typeof hidden !== "boolean") {
      return res.status(400).json({ message: "hidden (boolean) is required" });
    }
    const item = await ItemModel.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    item.hidden = hidden;
    await item.save();
    res.json(await ItemModel.findById(item._id).lean());
  } catch (error) {
    res.status(500).json({ message: "Could not update listing" });
  }
});

/** Admin: permanently delete any listing. */
app.delete("/admin/items/:id", async (req, res) => {
  try {
    const { adminUserId } = req.body;
    if (!(await requireAdmin(adminUserId))) {
      return res.status(403).json({ message: "Admin access required" });
    }
    const item = await ItemModel.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    await item.deleteOne();
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Could not delete listing" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
