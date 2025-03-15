const speakeasy = require('speakeasy');
const AdminUser = require('../models/AdminUser');
const AccessLog = require('../models/AccessLog');
const { isLANIP } = require('../middlwares/validateIp');
const {generateToken} = require('../services/jwtService')

exports.login = async (req, res) => {
  const { username, password, otp } = req.body;
  const clientIP = req.ip || req.connection.remoteAddress;
  const adminUser = await AdminUser.findOne({ username });
  if (!adminUser) {
    await AccessLog.create({ ip: clientIP, status: 'failed' });
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  if(adminUser.locked)return res.status(401).json({ message: 'Admin Account is locked' });


  if (adminUser.password !== password) {
    adminUser.failedAttempts += 1;
    if (adminUser.failedAttempts >= 5) {
      adminUser.locked = true;
    }
    await adminUser.save();
    return res.status(401).json({ message: 'Invalid username or Password' });
  }

  if (!isLANIP(req)) {
    if (!otp || !speakeasy.totp.verify({
        secret: adminUser.otpSecret,
        encoding: 'base32',
        token: otp,
        window: 2
      })) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }
  }

  const token = generateToken(adminUser._id);
  await AccessLog.create({ ip: clientIP, status: 'success' });

  res.json({ token });
};
exports.getAllLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query; 
    const skip = (page - 1) * limit;
    const pipeline = [
      ...(status ? [{ $match: { status } }] : []),
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          logs: [
            { $skip: skip }, 
            { $limit: parseInt(limit) }, 
          ],
          counts: [
            {
              $group: {
                _id: null,
                totalLogs: { $sum: 1 },
                successCount: {
                  $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] },
                },
                failCount: {
                  $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
                },
              },
            },
          ],
        },
      },

      { $unwind: '$counts' },
      {
        $project: {
          logs: 1,
          totalLogs: '$counts.totalLogs',
          successCount: '$counts.successCount',
          failCount: '$counts.failCount',
          currentPage: { $literal: parseInt(page) },
          totalPages: {
            $ceil: { $divide: ['$counts.totalLogs', parseInt(limit)] },
          },
        },
      },
    ];

    const result = await AccessLog.aggregate(pipeline);

    return res.json(result[0]);
    
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}
