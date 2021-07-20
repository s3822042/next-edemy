import User from "../models/user";
import { hashPassword, comparePassword } from "../utils/auth";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import AWS from "aws-sdk";
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // validation
    if (!username) return res.status(400).send("Name is required");
    if (!password || password.length < 6) {
      return res
        .status(400)
        .send("Password is required and should have at least 6 characters");
    }
    let userExist = await User.findOne({ email }).exec();
    if (userExist) return res.status(400).send("Email already exists");

    // hash password
    const hashedPassword = await hashPassword(password);

    // register user
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });
    await user.save();
    console.log("save user", user);
    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error. Try again");
  }
};

export const login = async (req, res) => {
  try {
    // console.log(req.body);
    const { email, password } = req.body;
    // check if our db has user with that email
    const user = await User.findOne({ email }).exec();
    if (!user) return res.status(400).send("No user found");
    // check password
    const match = await comparePassword(password, user.password);
    if (!match) return res.status(400).send("Wrong password");

    // create signed jwt
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    // return user and token to client, exclude hashed password
    user.password = undefined;
    // send token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      // secure: true, // only works on https
    });
    // send user as json response
    res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error. Try again.");
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.json({ message: "Sign out success" });
  } catch (err) {
    console.log(err);
  }
};
