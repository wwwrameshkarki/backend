import mongoose from "mongoose";

const OwnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  info: { type: String, default: "" },
  image: { type: String, default: "" },
});

export default mongoose.model("Owner", OwnerSchema);
