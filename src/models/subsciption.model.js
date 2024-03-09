import { Timestamp } from "mongodb";
import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: true,
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: true,
    },
  },
  { Timestamps: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
