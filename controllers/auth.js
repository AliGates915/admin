import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";
import jwt from "jsonwebtoken";

//Register
export const register = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);
    const newUser = new User({
      ...req.body,
      password: hash,
    });
    await newUser.save();
    res.status(200).send("User has been Register");
  } catch (error) {
    next(error);
  }
};
// Login
export const login = async (req, res, next) => {
  try {
    console.log("Login endpoint hit");
    const user = await User.findOne({ username: req.body.username });

    if (!user) return next(createError(404, "User not found!"));

    const isPassword = await bcrypt.compare(req.body.password, user.password);
    if (!isPassword) {
      return next(createError(400, "Wrong password or username"));
    }
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET
    );

    const { password, isAdmin, ...otherDetails } = user._doc;
    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: false, // Ensure this is false if you're testing on HTTP
        sameSite: "None", 
      })
      .status(200)
      .json({ ...otherDetails, isAdmin });
  } catch (error) {
    next(error);
  }
};
