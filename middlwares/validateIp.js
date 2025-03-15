const ip = require('ip');
const AdminUser = require('../models/AdminUser');
const AccessLog = require('../models/AccessLog');
const transporter = require('../services/mailService');
const {verifyToken} = require('../services/jwtService');

const isLANIP = (req) => ip.isPrivate(req.ip || req.connection.remoteAddress);

const validateIP = async (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;

  if (isLANIP(req)) return next();

  const adminUser = await AdminUser.findOne({ staticIP: clientIP });
  if (adminUser) return next();

  await AccessLog.create({ ip: clientIP, status: 'blocked' });

  transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: 'superadmin@example.com',
    subject: 'Unauthorized Access Attempt',
    text: `Unauthorized access from IP: ${clientIP}`,
  });

  return res.status(403).json({ message: 'Access denied' });
};

const verifyUser = async (req, res, next) => {
  let token = req.headers['authorization'] || req.headers['Authorization'] ;
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  token = token.split(' ')[1];
  const user = await verifyToken(token);
  const userData = await AdminUser.findById({_id: user.userId})
  if(!userData){
    return res.status(401).json({ message: 'User Not Found' });
  }
  req.user = userData;
  next()
}
module.exports = { validateIP, isLANIP, verifyUser };
