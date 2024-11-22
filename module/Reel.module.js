import { model, Schema } from "mongoose";
const ReelSchema = new Schema(
  {
    title: {
      type: "string",
      required: [true, "title is required.."],
      minlength: [5, "title is most be 5 char"],
      trim: true,
    },
    description: {
      type: "string",
      required: [true, "title is required.."],
      minlength: [5, "title is most be 5 char"],
      trim: true,
    },
    Reel: {
      public_id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
    },
    numberOfComment: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        userName: String,

        comment: String,
      },
      {
        timestamps: true,
      },
    ],
    likeCount: {
      type: Number,
      default: 0,
    },
    ReelLikes: [
      {
        ReelLike: {
          type: String,
          enum: ["TRUE", "FALSE"],
          default: "FALSE",
        },
        userName: {
          type: String,
          required: [true, "like be most required userName"],
        },
      },
      {
        timestamps: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);
const Reel = model("Reel", ReelSchema);
export default Reel;
