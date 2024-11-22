import Product from "../module/Product.module.js";
import User from "../module/use.module.js";
import AppError from "../utils/AppError.js";

export const AddCardProduct = async (req, res, next) => {
  const { productId } = req.body;

  const { id } = req.user;
  console.log(id);
  if (!id || !productId) {
    return next(new AppError("all filed is required..", 400));
  }

  try {
    const FindProduct = await Product.findById(productId);
    if (!FindProduct) {
      return next(new AppError("Product is not Found..", 400));
    }
    const userFind = await User.findById(id);
    if (!userFind) {
      return next(new AppError("user is not Found..", 400));
    }

    const productExists = userFind.walletAddProducts.some(
      (item) => item.product && item.product.toString() === productId // Ensure `item.product` is defined
    );

    if (productExists) {
      return next(new AppError("Product is already in the wallet.", 400));
    }
    userFind.walletAddProducts.push({
      product: FindProduct._id, // Assuming `product` is the product's ID
      name: FindProduct.name,
      price: FindProduct.price,
      description: FindProduct.description,
      image: {
        public_id: FindProduct.image.public_id, // Adjust based on how your product's image field is structured
        secure_url: FindProduct.image.secure_url,
      },
    });
    await userFind.save();
    res.status(200).json({
      success: true,
      userFind,
      message: "successfully add product in wallet..",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
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
