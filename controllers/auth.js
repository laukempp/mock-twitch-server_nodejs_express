const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/user");

//@desc     Register user
//@route    POST /api/v1/register
//@access   Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  //Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  sendTokenResponse(user, 200, res);
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  // We don't insert anything to db so model's default error handler doesn't kick in!
  if (!email || !password) {
    return next(
      new ErrorResponse("Please provide an email and a password", 400)
    );
  }

  // Check for user
  const user = await User.findOne({
    email,
  }).select("+password");

  if (!user) {
    return next(new ErrorResponse("invalid credentials", 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse("Invalid cretendials", 401));
  }

  sendTokenResponse(user, 200, res);
});

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};
