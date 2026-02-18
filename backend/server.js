import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import onboardingRoutes from './routes/onboardingRoutes.js';
import glossaryRoutes from './routes/glossaryRoutes.js';
import faqRoutes from './routes/faqRoutes.js';
import User from './models/User.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to MongoDB and initialize admin
connectDB().then(async () => {
  try {
    const adminExists = await User.findOne({ role: 'administrator' });
    if (!adminExists) {
      await User.create({
        name: 'Administrator',
        email: 'admin@crm.com',
        password: 'admin123',
        role: 'administrator'
      });
      console.log('Default admin user created: admin@crm.com / admin123');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/glossary', glossaryRoutes);
app.use('/api/faq', faqRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
