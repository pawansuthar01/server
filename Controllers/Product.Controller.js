import Notification from "../module/Notification.module.js";
import Product from "../module/Product.module.js";
import User from "../module/use.module.js";
import AppError from "../utils/AppError.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";

// //upload product// //
export const ProductUpload = async (req, res, next) => {
  const { name, description, price } = req.body;
  const { userName } = req.user;
  if (!name || !description || !price) {
    return next(new AppError(" All felids is required", 400));
  }
  try {
    const product = await Product.create({
      name,
      description,
      price,

      image: {
        public_id: "this is a one time use",
        secure_url: "this is a one time use",
      },
    });
    if (!product) {
      return next(
        new AppError(" product failed  to upload, Please try again..", 400)
      );
    }
    if (req.file) {
      try {
        const imageUpload = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "Product",
        });
        if (imageUpload) {
          product.image.public_id = imageUpload.public_id;
          product.image.secure_url = imageUpload.secure_url;
        }
        fs.rm(`uploads/${req.file.filename}`);
      } catch (error) {
        fs.rm(`uploads/${req.file.filename}`);
        return next(
          new AppError(`file upload file try again ${error.message}`, 400)
        );
      }
    }
    await product.save();

    const users = await User.find({}, "_id");
    if (!users || users.length === 0) {
      return next(new AppError("no user found ...."));
    }

    const notification = users.map((user) => ({
      userId: user._id,

      message: `${userName} has new product Upload: "${product.name}"`,
      type: "new product",
      read: false,
    }));

    await Notification.insertMany(notification);

    res.status(200).json({
      success: true,
      data: product,
      Message: "Product uploaded successfully and notification sent.",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
export const productUpdate = async (req, res, next) => {
  const { id } = req.params;
  console.log(id);
  if (!id) {
    return next(new AppError("product update to id is required..", 400));
  }
  try {
    const product = await Product.findByIdAndUpdate(
      id,
      {
        $set: req.body,
      },
      {
        runValidators: true,
      }
    );
    if (!product) {
      return next(
        new AppError(" product failed  to update.., Please try again..", 400)
      );
    }
    res.status(200).json({
      success: true,
      message: "product successfully update...",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
export const productDelete = async (req, res, next) => {
  const { id } = req.params;
  console.log(id);
  if (!id) {
    return next(new AppError("product update to id is required..", 400));
  }
  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return next(
        new AppError(" product failed  to Delete.., Please try again..", 400)
      );
    }
    res.status(200).json({
      success: true,
      message: "product successfully Delete...",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
export const getProduct = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new AppError("product update to id is required..", 400));
  }
  try {
    const product = await Product.findById(id);
    if (!product) {
      return next(
        new AppError(" product failed  to get.., Please try again..", 400)
      );
    }
    res.status(200).json({
      success: true,
      data: product,
      message: "product successfully get...",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
export const getAllProduct = async (req, res, next) => {
  try {
    const product = await Product.find({});

    if (!product) {
      return next(
        new AppError(" product failed  to get.., Please try again..", 400)
      );
    }
    res.status(200).json({
      success: true,
      data: product,
      message: "product  successfully get all...",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
// // product like and dislike Api//
export const LikeAndDisLikeProduct = async (req, res, next) => {
  const { id } = req.params;
  console.log(req.params);
  const { userName } = req.user;
  if (!userName) {
    return next(new AppError("username is required ..", 400));
  }
  if (!id) {
    return next(new AppError("postId is required ..", 400));
  }
  try {
    const product = await Product.findOne({
      _id: id,
    });

    if (!product) {
      return next(new AppError("product does not found. ..", 400));
    }
    const likeIndex = product.ProductLikes.findIndex(
      (like) => like.userName === userName
    );

    if (likeIndex !== -1) {
      if (product.ProductLikes[likeIndex].ProductLike === "TRUE") {
        product.ProductLikes.splice(likeIndex, 1);
        console.log("successFully disLike ");
      } else {
        product.ProductLikes[likeIndex].ProductLike = "TRUE";
        console.log("successFully Like ");
      }
    } else {
      product.ProductLikes.push({ userName, ProductLike: "TRUE" });
      console.log("successFully Like in full data ");
    }
    product.likeCount = product.ProductLikes.filter(
      (like) => like.ProductLike == "TRUE"
    ).length;
    await product.save();
    res.status(200).json({
      success: true,
      product,
      message: "product successfully like...",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
