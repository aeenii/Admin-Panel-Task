const AdminUser = require('../models/adminUser'); 
const speakeasy = require('speakeasy');

const seedAdminUser = async () => {
  const existingAdmin = await AdminUser.findOne({ username: 'admin' });
  const otpSecret = speakeasy.generateSecret().base32;
  const adminUser = new AdminUser({
    username: 'admin',
    password: 'admin123', 
    staticIP: '123.45.67.89',
    otpSecret: otpSecret,
  });
  if(!existingAdmin) await adminUser.save();
}

module.exports = seedAdminUser;