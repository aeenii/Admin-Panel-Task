const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./services/dbService');
const authRoutes = require('./routes/adminRoutes');
const seedAdminUser = require('./seed/adminSeeder');

dotenv.config();
connectDB();
seedAdminUser()

const app = express();
app.use(express.json());

app.use('/api/v1', authRoutes);

module.exports = app;
