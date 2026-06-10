import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { isLocalDB } from '../db/db';
import { UserModel } from '../models/user';
import { localDb } from '../db/jsonDb';
import { authProtect, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

const getUsersDB = () => (isLocalDB ? localDb.getCollection('users') : UserModel);

// Generate JWT token helper
const generateToken = (id: string, email: string, role: string) => {
  const secret = process.env.JWT_SECRET || 'agriai_super_secret_jwt_token_2026';
  return jwt.sign({ id, email, role }, secret, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please enter all required fields.' });
  }

  try {
    const users = getUsersDB();
    const userExists = await users.findOne({ email });

    if (userExists) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await users.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      avatar: '',
      phone: '',
      location: ''
    });

    const token = generateToken(newUser._id, newUser.email, newUser.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: `Registration failed: ${error.message}` });
  }
});

// @route   POST /api/auth/login
// @desc    Log in user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter all required fields.' });
  }

  try {
    const users = getUsersDB();
    const user = await users.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user._id, user.email, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        location: user.location
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: `Login failed: ${error.message}` });
  }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
router.get('/profile', authProtect, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authorized' });
    
    const users = getUsersDB();
    const user = await users.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        location: user.location,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: `Profile retrieval failed: ${error.message}` });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile details
router.put('/profile', authProtect, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authorized' });
    
    const { name, avatar, phone, location } = req.body;
    const users = getUsersDB();
    
    const updatedUser = await users.findByIdAndUpdate(req.user.id, {
      name,
      avatar,
      phone,
      location
    });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        phone: updatedUser.phone,
        location: updatedUser.location
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: `Profile update failed: ${error.message}` });
  }
});

// @route   PUT /api/auth/password
// @desc    Update user password
router.put('/password', authProtect, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authorized' });
    
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Please enter current and new passwords.' });
    }

    const users = getUsersDB();
    const user = await users.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    await users.findByIdAndUpdate(req.user.id, { password: hashedNewPassword });

    res.status(200).json({
      success: true,
      message: 'Password updated successfully.'
    });
  } catch (error: any) {
    res.status(500).json({ error: `Password update failed: ${error.message}` });
  }
});

export default router;
