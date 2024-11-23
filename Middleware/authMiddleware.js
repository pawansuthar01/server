import JWT from "jsonwebtoken";
import AppError from "../utils/AppError.js";

export const isLoggedIn = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return next(new AppError("Unauthenticated,please login ", 500));
    }

    const UserDetails = await JWT.verify(token, process.env.JWT_SECRET);

    if (!UserDetails) {
      return next(new AppError("Token is not valid please login..", 400));
    }

    req.user = {
      id: UserDetails.id,
      userName: UserDetails.userName,
      email: UserDetails.email,
      role: UserDetails.role,
    };
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
  next();
};

export const authorizeRoles =
  (...roles) =>
  async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("you have not permission for this work", 400));
    }
    next();
  };
