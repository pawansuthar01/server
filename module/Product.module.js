import { model, Schema } from "mongoose";
const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      public_id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
    },

    description: {
      type: String,
      required: true,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    ProductLikes: [
      {
        ProductLike: {
          type: String,
          enum: ["TRUE", "FALSE"],
          default: "FALSE",
        },
        userName: {
          type: String,
          required: [true, "like be most required userName"],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
const Product = model("Product", ProductSchema);
export default Product;
