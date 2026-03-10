const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

async function bootstrapAdmin(){
  const email = (process.env.ADMIN_EMAIL || 'admin@saree.com').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';
  const name = process.env.ADMIN_NAME || 'Admin';

  const existing = await User.findOne({ email });
  if(existing) return;

  const passwordHash = await bcrypt.hash(String(password), 10);
  await User.create({ name, email, passwordHash, role: 'ADMIN' });

  console.log('✅ Default admin created:', email);
  console.log('   Change ADMIN_EMAIL / ADMIN_PASSWORD in backend/.env');
}

module.exports = { bootstrapAdmin };
