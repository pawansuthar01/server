import User from "../module/use.module.js";
import AppError from "../utils/AppError.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";
import crypto from "crypto";
import SendEmail from "../utils/SendEmial.js";
const cookieOption = {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: true,
};

export const RegisterUser = async (req, res, next) => {
  const { userName, fullName, email, password, phoneNumber } = req.body;
  if (!fullName || !email || !password || !userName || !phoneNumber) {
    return next(new AppError(" All felids is required", 400));
  }
  try {
    const userNameExit = await User.findOne({ userName });
    if (userNameExit) {
      return next(new AppError(" userName is already exist", 400));
    }
    const userExist = await User.findOne({ email });
    if (userExist) {
      return next(new AppError(" email is already exist", 400));
    }

    const avatar = {
      public_id: email,
      secure_url:
        "https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg",
    };
    if (req.file) {
      try {
        const avatarUpload = await cloudinary.v2.uploader.upload(
          req.file.path,
          {
            folder: "content",
            width: 250,
            height: 250,
            gravity: "faces",
            crop: "fill",
          }
        );
        if (avatarUpload) {
          avatar.public_id = avatarUpload.public_id;
          avatar.secure_url = avatarUpload.secure_url;
        }

        fs.rm(`uploads/${req.file.filename}`);
      } catch (error) {
        fs.rm(`uploads/${req.file.filename}`);
        return next(new AppError(` ${error.message}`, 400));
      }
    }
    const user = await User.create({
      userName,
      fullName,
      phoneNumber,
      email,
      password,
      avatar,
    });
    if (!user) {
      return next(
        new AppError(" User registration is failed , Please try again..", 400)
      );
    }
    await user.save();
    const token = await user.generateJWTToken();
    user.password = undefined;
    res.cookie("token", token, cookieOption);
    console.log(token);
    res.cookie("token", token, cookieOption);
    res.status(200).json({
      success: true,
      data: user,
      Message: "successfully register...",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
export const login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError(" All felids is required", 400));
  }
  try {
    const userExist = await User.findOne({ email }).select("+password");
    if (!userExist) {
      return next(new AppError(" user not found...", 400));
    }
    if (!(await userExist.comparePassword(password))) {
      return next(new AppError("password Does not match..", 400));
    }
    const Token = await userExist.generateJWTToken();
    userExist.password = undefined;
    res.cookie("token", Token, cookieOption);
    console.log("token=", Token);
    res.status(200).json({
      success: true,
      data: userExist,
      Message: "successfully login...",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

export const logout = async (req, res, next) => {
  console.log("yes");
  try {
    res.cookie("token", null, {
      maxAge: 0,
      httpOnly: true,
      secure: true,
    });

    res.status(200).json({
      success: true,

      Message: "successfully logout...",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
export const getProfile = async (req, res, next) => {
  try {
    const userExist = await User.findById(req.user.id);
    if (!userExist) {
      return next(new AppError(" please login..", 400));
    }
    res.status(200).json({
      success: true,
      data: userExist,
      Message: "successfully getProfile...",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
export const resetPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    if (!email) {
      return next(new AppError("Enter your email."));
    }
    const userExist = await User.findOne({ email });
    if (!userExist) {
      return next(new AppError(" email not found...", 400));
    }
    const resetToken = await userExist.generatePasswordResetToken();

    await userExist.save();
    const resetPassword_url = `http://localhost:5000/api/v3/user/changePassword${resetToken}`;
    const subject = "Reset Password ";
    const message = `You can reset your password by clicking <a href=${resetPassword_url} target="_blank">Reset your password</a>.
    If the above link does not work for some reason, copy-paste this link in a new tab:${resetPassword_url} 
    If you did not request this, kindy ignore this email.`;
    try {
      await SendEmail(email, subject, message);
      res.status(200).json({
        success: true,
        email: email,
        token: resetToken,
        message: "successfully email send.. ",
      });
    } catch (error) {
      userExist.forgotPasswordExpiry = undefined;
      userExist.forgotPasswordToken = undefined;
      userExist.save();
      return next(new AppError("Failed to send email " + error.message, 500));
    }
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
export const changePassword = async (req, res, next) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  if (!password) {
    return next(new AppError("Enter your new password", 400));
  }

  try {
    const forgotPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    console.log(forgotPasswordToken);
    const user = await User.findOne({
      forgotPasswordToken,
      forgotPasswordExpiry: { $gt: Date.now() },
    });
    if (!user) {
      return next(
        new AppError("Token does not exit or expiry, please try again", 400)
      );
    }

    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save();

    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "Password successfully updated.",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

export const updatePassword = async (req, res, next) => {
  const { password, newPassword } = req.body;
  try {
    if (!password || !newPassword) {
      return next(new AppError(" all filed is required..", 400));
    }
    const userExist = await User.findById(req.user.id).select("+password");
    if (!userExist) {
      return next(new AppError(" please login..", 400));
    }

    if (!(await userExist.comparePassword(password))) {
      return next(new AppError("password does not match...", 400));
    }

    userExist.password = newPassword;

    await userExist.save();
    userExist.password = undefined;
    res.status(200).json({
      success: true,
      message: "password successfully updated...",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

export const UpdateUserProfile = async (req, res, next) => {
  const { fullName } = req.body;
  if (!fullName) {
    return next(new AppError(" All felids is required", 400));
  }
  try {
    const userExist = await User.findById(req.user.id);
    if (!userExist) {
      return next(new AppError(" please login..", 400));
    }

    if (fullName) {
      userExist.fullName = fullName;
    }
    if (req.file) {
      await cloudinary.v2.uploader.destroy(userExist.avatar.public_id);
    }
    if (req.file) {
      try {
        const avatarUpload = await cloudinary.v2.uploader.upload(
          req.file.path,
          {
            folder: "Avatar",
            width: 250,
            height: 250,
            gravity: "faces",
            crop: "fill",
          }
        );
        if (avatarUpload) {
          userExist.avatar.public_id = avatarUpload.public_id;
          userExist.avatar.secure_url = avatarUpload.secure_url;
        }
        fs.rm(`uploads/${req.file.filename}`);
      } catch (error) {
        fs.rm(`uploads/${req.file.filename}`);
        return next(
          new AppError(`file upload file try again ${error.message}`, 400)
        );
      }
    }
    await userExist.save();
    const Token = await userExist.generateJWTToken();
    userExist.password = undefined;
    res.cookie("token", Token, cookieOption);
    res.status(200).json({
      success: true,
      data: userExist,
      Message: "successfully update profile...",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
export const getAllDate = async (req, res, next) => {
  try {
    const allUser = await User.find({});
    const allUserCount = await User.countDocuments();
    const allADMINCount = await User.countDocuments({
      role: "ADMIN",
    });
    const allAUTHORCount = await User.countDocuments({
      role: "AUTHOR",
    });
    res.status(200).json({
      success: true,
      allUserCount,
      allADMINCount,
      allAUTHORCount,
      allUser,
      message: "successfully allUser get..",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
