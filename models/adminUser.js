const mongoose = require('mongoose');

const AdminUserSchema = new mongoose.Schema({
    username: { 
      type: String, 
      require: true 
    },
    password: { 
      type: String, 
      require: true 
    },
    staticIP: { 
      type: String, 
      require: true 
    }, 
    otpSecret: { 
      type: String, 
      require: true 
    },
    failedAttempts: { 
      type: Number, 
      default: 0 
    },
    locked: { 
      type: Boolean, 
      default: false 
    },
  },
  { timestamps: true }
);
const AdminUser = mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema);
module.exports = AdminUser; // Use module.exports
