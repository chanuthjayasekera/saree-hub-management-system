const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

async function getMe(req, res){
  try{
    const user = await User.findById(req.user.id).select('_id name email role location createdAt updatedAt');
    if(!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  }catch(e){
    console.error('getMe error', e);
    res.status(500).json({ message: 'Server error' });
  }
}

async function updateMe(req, res){
  try{
    const { name, location, newPassword } = req.body || {};
    const update = {};

    if(name !== undefined){
      const n = String(name).trim();
      if(!n) return res.status(400).json({ message: 'Name cannot be empty' });
      update.name = n;
    }

    if(location !== undefined){
      const loc = String(location).trim();
      if(!loc) return res.status(400).json({ message: 'Location cannot be empty' });
      update.location = loc;
    }

    if(newPassword){
      if(String(newPassword).length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });
      update.passwordHash = await bcrypt.hash(String(newPassword), 10);
    }

    const user = await User.findByIdAndUpdate(req.user.id, update, { new:true }).select('_id name email role location createdAt updatedAt');
    if(!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  }catch(e){
    console.error('updateMe error', e);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getMe, updateMe };
