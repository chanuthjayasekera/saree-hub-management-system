const jwt = require('jsonwebtoken');

function authRequired(req, res, next){
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if(!token) return res.status(401).json({ message: 'Unauthorized' });

  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
    req.user = payload; // { id, role, email, name }
    next();
  }catch(e){
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function requireRole(...roles){
  return (req, res, next) => {
    if(!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if(!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

module.exports = { authRequired, requireRole };
