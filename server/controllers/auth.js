import User from "../models/User";
import { hashPassword, comparePassword } from "../utils/auth";
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
