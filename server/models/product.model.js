import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    incidentDate: { type: Date, required: true },
    incidentLocation: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    listingType: {
      type: String,
      enum: ["lost", "found"],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    image: { type: String, default: null },
    /** When true, listing is hidden from public lost/found feeds (admin moderation). */
    hidden: { type: Boolean, default: false },
    /** Lost: owner found the item. Found: owner returned item to claimant. Hidden from public feeds when true. */
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ItemModel = mongoose.model("Item", itemSchema, "items");
export default ItemModel;
