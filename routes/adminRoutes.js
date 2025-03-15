const express = require('express');
const { login, getAllLogs } = require('../controllers/adminController');
const { validateIP, verifyUser } = require('../middlwares/validateIp');

const router = express.Router();

router.post('/login', validateIP, login);
router.get('/logs', verifyUser, getAllLogs);


module.exports = router;
