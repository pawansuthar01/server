import Product from "../module/Product.module.js";
import User from "../module/use.module.js";
import AppError from "../utils/AppError.js";

export const AddCardProduct = async (req, res, next) => {
  const { productId } = req.body;
  const { id } = req.user;

  if (!id || !productId) {
    return next(new AppError("All fields are required.", 400));
  }

  try {
    // Find the product by ID
    const FindProduct = await Product.findById(productId);
    if (!FindProduct) {
      return next(new AppError("Product not found.", 404));
    }

    // Find the user by ID
    const userFind = await User.findById(id);
    if (!userFind) {
      return next(new AppError("User not found.", 404));
    }

    // Check if the product already exists in the user's wallet
    const productExists = userFind.walletAddProducts.some(
      (item) => item.product && item.product.toString() === productId
    );

    if (productExists) {
      return next(new AppError("Product is already in the wallet.", 400));
    }

    // Handle product image (use the first image if the array exists)
    const productImage = FindProduct.images
      ? FindProduct.images[0] // Select the first image
      : { public_id: null, secure_url: null }; // Fallback if no images
    console.log(productImage);
    userFind.walletAddProducts.push({
      product: FindProduct._id, // Product ID
      name: FindProduct.name,
      price: FindProduct.price,
      description: FindProduct.description,
      image: {
        public_id: productImage.public_id,
        secure_url: productImage.secure_url,
      },
    });

    // Save the updated user
    await userFind.save();

    res.status(200).json({
      success: true,
      user: userFind,
      message: "Product successfully added to wallet.",
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

export const removeCardProduct = async (req, res, next) => {
  const { productId } = req.body;
  const { id } = req.user;
  if (!id || !productId) {
    return next(new AppError("all filed is required..", 400));
  }
  try {
    const FindProduct = await Product.findById(productId);
    if (!FindProduct) {
      return next(new AppError("Product is not Found..", 400));
    }

    const userFind = await User.findOneAndUpdate(
      { _id: id },
      { $pull: { walletAddProducts: { product: productId } } },
      { new: true }
    );

    if (!userFind) {
      return next(new AppError("user is not Found..", 400));
    }

    await userFind.save();
    res.status(200).json({
      success: true,
      userFind,
      message: "successfully remove product in wallet..",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

export const AllRemoveCardProduct = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new AppError("all filed is required..", 400));
  }
  try {
    const userFind = await User.findOneAndUpdate(
      { _id: id },
      { $set: { walletAddProducts: [] } },
      { new: true }
    );

    if (!userFind) {
      return next(new AppError("user is not Found..", 400));
    }

    await userFind.save();
    res.status(200).json({
      success: true,
      userFind,
      message: "successfully All product remove in wallet..",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
