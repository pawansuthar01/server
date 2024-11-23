import Order from "../module/Order.module.js";
import Product from "../module/Product.module.js";
import AppError from "../utils/AppError.js";
import Razorpay from "razorpay";
import crypto from "crypto";

export const CreateOrder = async (req, res, next) => {
  const {
    userId,
    products,
    shippingAddress,
    paymentStatus,
    PaymentMethod,
    totalAmount,
  } = req.body;
  console.log(PaymentMethod, paymentStatus);
  if (!userId || !products || !shippingAddress || !totalAmount) {
    return next(new AppError("All fields are required.", 400));
  }

  const productDetails = await Promise.all(
    products.map(async (product) => {
      const productFound = await Product.findById(product.product);
      if (!productFound) {
        return next(
          new AppError(`Product with ID ${product.product} not found.`, 400)
        );
      }
      return {
        product: productFound._id,
        productDetails: {
          name: productFound.name,
          image: productFound.image,
          description: productFound.description,
          price: productFound.price,
        },
        quantity: product.quantity,
        price: productFound.price,
      };
    })
  );

  const newOrder = new Order({
    userId,
    products: productDetails,
    shippingAddress,
    PaymentMethod,
    paymentStatus,
    totalAmount,
  });

  if (!newOrder) {
    return next(new AppError("Failed to create order.", 400));
  }

  await newOrder.save();

  res.status(200).json({
    message: "Order placed successfully.",
    success: true,
    data: newOrder,
  });
};

const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.SECRET_ID,
});

export const createOrderPayment = async (req, res, next) => {
  try {
    const { totalAmount } = req.body;

    if (!totalAmount || totalAmount <= 0) {
      return next(new AppError("Invalid or missing totalAmount", 400));
    }

    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return next(new AppError("Failed to create Razorpay order", 500));
    }
    console.log(order.id);

    res.status(200).json({
      success: true,
      orderId: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return next(new AppError(error.message || "Internal Server Error", 500));
  }
};

export const PaymentVerify = async (req, res, next) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    req.body;
  console.log(req.boy);
  console.log(process.env.SECRET_ID);
  try {
    const generated_signature = crypto
      .createHmac("sha256", process.env.SECRET_ID)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      res.status(200).json({ success: true, message: "Payment Verified" });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

export const UpdateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(req.body);
    if (!id) {
      return next(new AppError("all  filed required ", 400));
    }
    const order = await Order.findOneAndUpdate(
      { _id: id },
      { $set: req.body },
      { new: true }
    );
    if (!order) {
      return next(new AppError("order is does not found..", 400));
    }

    res.status(200).json({
      success: true,
      message: "update Order...",
      data: order,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

export const CancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(new AppError("all  filed required ", 400));
    }
    const order = await Order.findOneAndUpdate(
      { _id: id },
      { $set: { orderStats: "Canceled" } },
      { new: true }
    );
    if (!order) {
      return next(new AppError("order is does not found..", 400));
    }

    res.status(200).json({
      success: true,
      message: "update Order...",
      data: order,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(new AppError("all flied is required..", 400));
    }
    const OrderExit = await Order.find({ userId: id });

    if (!OrderExit) {
      return next(new AppError("Order Not Found..", 400));
    }
    res.status(200).json({
      success: true,
      message: "successFully Order Get...",
      data: OrderExit,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

export const AllOrder = async (req, res, next) => {
  try {
    const Orders = await Order.find();
    if (!Orders) {
      return next(new AppError("Order Not Found..", 400));
    }
    res.status(200).json({
      success: true,
      message: "successFully Order Get...",
      data: Orders,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
