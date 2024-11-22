import { model, Schema } from "mongoose";

const NotificationSchema = new Schema(
  {
    userId: {
      type: String,
      ref: "USER",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "like",
        "comment",
        "message",
        "New Account",
        "Order",
        "blog",
        "new product",
      ],
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
const Notification = model("Notification", NotificationSchema);
export default Notification;
