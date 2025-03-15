const mongoose = require('mongoose');
const AccessLogSchema = new mongoose.Schema(
  {
    timestamp: { 
      type: Date, 
      default: Date.now, 
      require: true,
    },
    ip: { 
      type: String, 
      require: true 
    },
    deviceInfo: { 
      type: String, 
      require: true 
    },
    status: {
      type: String, 
      require: true,
      enum:['success', 'failed', 'blocked'],
    }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model('AccessLog', AccessLogSchema);
