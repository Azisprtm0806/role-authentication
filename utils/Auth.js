const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { SECRET } = require("../config");

/**
 * @DESC To register the user (ADMIN, SUPER_ADMIN, USER)
 */

const userRegister = async (userDats, role, res) => {
  try {
    // Validate the username
    let usernameNotToken = await validateUsername(userDats.username);
    if (!usernameNotToken) {
      return res.status(400).json({
        message: "Username is already taken.",
        success: false,
      });
    }

    // validate the email
    let emailNotRegistered = await validateEmail(userDats.email);
    if (!emailNotRegistered) {
      return res.status(400).json({
        message: "Email is already registered.",
        success: false,
      });
    }

    // get the hashed password
    const hashedPassword = await bcrypt.hash(userDats.password, 12);

    // create a new user
    const newUser = new User({
      ...userDats,
      password: hashedPassword,
      role: role,
    });
    await newUser.save();

    return res.status(201).json({
      message: "Hurry! now you are successfully registered, plea nor login.",
      success: true,
    });
  } catch (error) {
    // implement logger function(winston)
    return res.status(500).json({
      message: "Unable to create your account.",
      success: false,
    });
  }
};

const userLogin = async (userCreds, role, res) => {
  let { username, password } = userCreds;
  // first check if the username is in the database
  const user = await User.findOne({ username: username });
  if (!user) {
    return res.status(500).json({
      message: "username is not found, invalid login.",
      success: false,
    });
  }
  // we will check the role
  if (user.role !== role) {
    return res.status(500).json({
      message: "please make sure you are logging in from the right path.",
      success: false,
    });
  }
  // that means user is existing and trying to signin
  // now check the password
  let isMacth = await bcrypt.compare(password, user.password);
  if (isMacth) {
    // signin the token and issue it to the user
    let token = jwt.sign(
      {
        user_id: user.id,
        role: user.role,
        username: user.username,
        email: user.email,
      },
      SECRET,
      { expiresIn: "7 days" }
    );

    let result = {
      username: user.username,
      role: user.role,
      email: user.email,
      token: `Baerer ${token}`,
      expiresIn: 168,
    };

    return res.status(200).json({
      ...result,
      message: "Hurray! You Are now Logged in.",
      success: true,
    });
  } else {
    return res.status(500).json({
      message: "Incorrect password",
      success: false,
    });
  }
};

const validateUsername = async (username) => {
  let user = await User.findOne({ username: username });
  return user ? false : true;
};

const validateEmail = async (email) => {
  let user = await User.findOne({ email: email });
  return user ? false : true;
};

module.exports = {
  userRegister,
  userLogin,
};
