// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // MongoDB Connection with fallback
// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log('✅ Connected to MongoDB');
//   } catch (err) {
//     console.error('❌ MongoDB connection error:', err.message);
//     console.log('⚠️  Using in-memory storage for development');
//     // For development, we'll use in-memory storage
//     global.inMemoryTeams = [];
//   }
// };

// connectDB();

// // Routes

// app.get('/', (req, res) => {
//   res.json({ status: 'welcome', message: 'Free Fire Tournament API is running' });
// });

// app.use('/api/team', require('./routes/registrationRoutes'));
// app.use('/api/admin', require('./routes/adminRoutes'));
// app.use('/api/user', require('./routes/userRoutes'));
// app.use('/api/payment', require('./routes/payment'));

// // Health check endpoint
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'OK', message: 'Free Fire Tournament API is running' });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`📧 Email service: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}`);
//   console.log(`💳 Payment service: Disabled`);
// });
