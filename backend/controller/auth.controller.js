import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

export const Signup = async (req, res) => {
  try {
    const { name, email, password, role = "client" } = req.body;
    const userExists = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      "INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4) RETURNING *",
      [name, email, hashedPassword, role],
    );

    const token = jwt.sign(
      { id: newUser.rows[0].id, role: newUser.rows[0].role, name: newUser.rows[0].name, email: newUser.rows[0].email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "User registered successfully",
      token,
      user: { id: newUser.rows[0].id, name: newUser.rows[0].name, email: newUser.rows[0].email, role: newUser.rows[0].role }
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const Sigin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
    const userData = user.rows[0];

    const token = jwt.sign(
      { id: userData.id, role: userData.role, name: userData.name, email: userData.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

