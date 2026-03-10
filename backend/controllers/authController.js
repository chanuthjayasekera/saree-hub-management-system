const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

function signUser(user){
  const payload = { id: user._id.toString(), role: user.role, email: user.email, name: user.name, location: user.location || '' };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret_change_me', { expiresIn: '7d' });
  return { token, user: payload };
}

async function register(req, res){
  try{
    const { name, email, password, location } = req.body || {};
    if(!name || !email || !password || !location) return res.status(400).json({ message: 'Name, email, password, and location are required' });
    if(String(password).length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
    if(existing) return res.status(409).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await User.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      passwordHash,
      role: 'USER',
      location: String(location).trim()
    });

    return res.status(201).json(signUser(user));
  }catch(e){
    console.error('register error', e);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function login(req, res){
  try{
    const { email, password } = req.body || {};
    if(!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if(!user) return res.status(401).json({ message: 'Invalid email or password' });

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if(!ok) return res.status(401).json({ message: 'Invalid email or password' });

    return res.json(signUser(user));
  }catch(e){
    console.error('login error', e);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { register, login };
