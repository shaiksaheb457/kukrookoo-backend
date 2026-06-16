const User          = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendEmail     = require("../utils/sendEmail");
const crypto        = require("crypto");

// ── Register ──────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    // Generate OTP
    const otpCode    = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry  = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const user = await User.create({
      name,
      email,
      password,
      otp: { code: otpCode, expiresAt: otpExpiry },
    });

    // Send OTP email
    await sendEmail({
      to: email,
      subject: "Verify your KukrooKoo account",
      html: `
        <div style="font-family:Arial;max-width:500px;margin:auto;padding:32px;background:#FFF8F0;border-radius:12px;">
          <h2 style="color:#A11217;">Welcome to KukrooKoo 🐓</h2>
          <p>Hi <strong>${name}</strong>, your OTP to verify your account is:</p>
          <div style="font-size:36px;font-weight:bold;color:#A11217;letter-spacing:8px;margin:24px 0;">${otpCode}</div>
          <p>This OTP expires in <strong>10 minutes</strong>.</p>
          <p style="color:#888;font-size:12px;">If you didn't sign up, ignore this email.</p>
        </div>
      `,
    });

    res.status(201).json({
      message: "Registration successful. Check your email for OTP.",
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Verify OTP ────────────────────────────────────────────
exports.verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp.code !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (new Date() > user.otp.expiresAt)
      return res.status(400).json({ message: "OTP expired. Please request a new one." });

    user.isVerified  = true;
    user.otp         = {};
    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: "Email verified successfully!",
      token,
      user: {
        id:         user._id,
        name:       user.name,
        email:      user.email,
        role:       user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Resend OTP ────────────────────────────────────────────
exports.resendOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const otpCode   = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = { code: otpCode, expiresAt: otpExpiry };
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Your new KukrooKoo OTP",
      html: `<div style="font-family:Arial;padding:32px;background:#FFF8F0;border-radius:12px;">
        <h2 style="color:#A11217;">New OTP</h2>
        <div style="font-size:36px;font-weight:bold;color:#A11217;letter-spacing:8px;margin:24px 0;">${otpCode}</div>
        <p>Expires in 10 minutes.</p>
      </div>`,
    });

    res.json({ message: "New OTP sent to your email." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Login ─────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    if (!user.isVerified)
      return res.status(401).json({ message: "Please verify your email first", userId: user._id });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id:     user._id,
        name:   user.name,
        email:  user.email,
        role:   user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Forgot Password ───────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "No account with that email" });

    const token  = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetToken       = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    await sendEmail({
      to: email,
      subject: "Reset your KukrooKoo password",
      html: `<div style="font-family:Arial;padding:32px;background:#FFF8F0;border-radius:12px;">
        <h2 style="color:#A11217;">Password Reset</h2>
        <p>Click the button below to reset your password. Link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#A11217;color:white;border-radius:8px;text-decoration:none;font-weight:bold;">Reset Password</a>
        <p style="color:#888;font-size:12px;">If you didn't request this, ignore this email.</p>
      </div>`,
    });

    res.json({ message: "Password reset link sent to your email." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Reset Password ────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetToken:       token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired reset token" });

    user.password         = password;
    user.resetToken       = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Get current user (me) ─────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp -resetToken");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ── Update Profile ────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true }
    ).select("-password -otp -resetToken");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Add Address ───────────────────────────────────────────
exports.addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses.push(req.body);
    await user.save();
    res.json({ addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Get all customers (admin) ───────────────────────────────
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "user" })
      .select("-password -otp -resetToken")
      .sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};