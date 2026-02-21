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
import picklistRoutes from './routes/picklistRoutes.js';
import User from './models/User.js';
import Picklist from './models/Picklist.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to MongoDB and initialize admin
connectDB().then(async () => {
  try {
    // Create admin if not exists, update password if exists
    const existingAdmin = await User.findOne({ email: 'admin@crm.com' });
    if (!existingAdmin) {
      await User.create({
        name: 'Administrator',
        email: 'admin@crm.com',
        password: 'Admin@123',
        role: 'administrator'
      });
      console.log('Admin user created: admin@crm.com / Admin@123');
    } else {
      // Ensure role is administrator
      if (existingAdmin.role !== 'administrator') {
        existingAdmin.role = 'administrator';
        await existingAdmin.save();
      }
      console.log('Admin user exists: admin@crm.com');
    }

    // Auto-seed picklists if none exist
    const picklistCount = await Picklist.countDocuments();
    if (picklistCount === 0) {
      const defaultPicklists = [
        {
          name: 'category',
          label: 'Category (Spotify Monthly Listeners)',
          items: [
            { value: 'Premier 1 - 20M', label: 'Premier 1 - 20M', order: 1 },
            { value: 'Premier 2 - 10M', label: 'Premier 2 - 10M', order: 2 },
            { value: 'Premier 3 - 5M', label: 'Premier 3 - 5M', order: 3 },
            { value: 'Elite 1 - 1M', label: 'Elite 1 - 1M', order: 4 },
            { value: 'Elite 2 - 600K', label: 'Elite 2 - 600K', order: 5 },
            { value: 'Elite 3 - 100K', label: 'Elite 3 - 100K', order: 6 },
            { value: 'Standard 1 - 50K', label: 'Standard 1 - 50K', order: 7 },
            { value: 'Standard 2 - 10K', label: 'Standard 2 - 10K', order: 8 },
            { value: 'Standard 3 - Below 10K', label: 'Standard 3 - Below 10K', order: 9 },
          ]
        },
        {
          name: 'tier',
          label: 'Tier (Instagram Followers)',
          items: [
            { value: 'Tier 1 - 1M', label: 'Tier 1 - 1M', order: 1 },
            { value: 'Tier 2 - 750K', label: 'Tier 2 - 750K', order: 2 },
            { value: 'Tier 3 - 500K', label: 'Tier 3 - 500K', order: 3 },
            { value: 'Tier 4 - 250K', label: 'Tier 4 - 250K', order: 4 },
            { value: 'Tier 5 - 100K', label: 'Tier 5 - 100K', order: 5 },
            { value: 'Tier 6 - 50K', label: 'Tier 6 - 50K', order: 6 },
            { value: 'Tier 7 - 10K', label: 'Tier 7 - 10K', order: 7 },
            { value: 'Tier 8 - Below 10K', label: 'Tier 8 - Below 10K', order: 8 },
          ]
        },
        {
          name: 'talentType',
          label: 'Talent Type',
          items: [
            { value: 'Individual', label: 'Individual', order: 1 },
            { value: 'Band', label: 'Band', order: 2 },
            { value: 'Group', label: 'Group', order: 3 },
          ]
        },
        {
          name: 'source',
          label: 'Source',
          items: [
            { value: 'Personal Reference', label: 'Personal Reference', order: 1 },
            { value: 'Curated Artist', label: 'Curated Artist', order: 2 },
            { value: 'Open Inbound', label: 'Open Inbound', order: 3 },
            { value: 'Special Curated', label: 'Special Curated', order: 4 },
            { value: 'Cartel', label: 'Cartel', order: 5 },
            { value: 'Soumini', label: 'Soumini', order: 6 },
            { value: 'Marriott', label: 'Marriott', order: 7 },
            { value: 'Website', label: 'Website', order: 8 },
            { value: 'SVF', label: 'SVF', order: 9 },
            { value: 'AME', label: 'AME', order: 10 },
            { value: 'Caartel Music', label: 'Caartel Music', order: 11 },
            { value: 'Manipuri Zone', label: 'Manipuri Zone', order: 12 },
            { value: 'Getgrist', label: 'Getgrist', order: 13 },
            { value: 'Artist or Fan Onboarding Management', label: 'Artist or Fan Onboarding Management', order: 14 },
          ]
        },
        {
          name: 'memberStatus',
          label: 'Member Status',
          items: [
            { value: 'Pending', label: 'Pending', order: 1 },
            { value: 'Updated', label: 'Updated', order: 2 },
            { value: 'On Hold', label: 'On Hold', order: 3 },
          ]
        },
        {
          name: 'contactStatus',
          label: 'Contact Status',
          items: [
            { value: 'New', label: 'New', order: 1 },
            { value: 'Contacted', label: 'Contacted', order: 2 },
            { value: 'In Discussion', label: 'In Discussion', order: 3 },
            { value: 'Follow-up Required', label: 'Follow-up Required', order: 4 },
          ]
        },
        {
          name: 'meetingType',
          label: 'Meeting Type',
          items: [
            { value: 'In-Person', label: 'In-Person', order: 1 },
            { value: 'Google Meet', label: 'Google Meet', order: 2 },
          ]
        },
        {
          name: 'membershipType',
          label: 'Membership Type',
          items: [
            { value: 'artist-investor', label: 'Artist Investor - rs 2500 per share investment', order: 1 },
            { value: 'partner-artist', label: 'Partner Artist - Distribution + Events', order: 2 },
          ]
        },
        {
          name: 'spoc',
          label: 'SPOC',
          items: [
            { value: 'Vishal Onkar', label: 'Vishal Onkar', order: 1 },
            { value: 'Soumini Paul', label: 'Soumini Paul', order: 2 },
            { value: 'Aayan De', label: 'Aayan De', order: 3 },
            { value: 'Joshua Singh', label: 'Joshua Singh', order: 4 },
            { value: 'Racheal Singh', label: 'Racheal Singh', order: 5 },
            { value: 'Aayush Jain', label: 'Aayush Jain', order: 6 },
          ]
        },
        {
          name: 'onboardingStatus',
          label: 'Onboarding Status',
          items: [
            { value: 'hot', label: 'Hot', order: 1 },
            { value: 'warm', label: 'Warm', order: 2 },
            { value: 'cold', label: 'Cold', order: 3 },
            { value: 'closed-won', label: 'Closed Won', order: 4 },
            { value: 'closed-lost', label: 'Closed Lost', order: 5 },
            { value: 'cold-storage', label: 'Cold Storage', order: 6 },
          ]
        },
        {
          name: 'closureStatus',
          label: 'Closure Status',
          items: [
            { value: 'ssa-sha-investor-agreement-sent', label: 'SSA/SHA/Investor agreement sent', order: 1 },
            { value: 'create-whatsapp-group', label: 'Create a Whatsapp Group', order: 2 },
            { value: 'kyc-received', label: 'KYC received', order: 3 },
            { value: 'investment-received', label: 'Investment Received', order: 4 },
            { value: 'share-certificate-sent', label: 'Share Certificate Sent', order: 5 },
            { value: 'distribution-agreements-sent', label: 'Distribution Agreements Sent', order: 6 },
            { value: 'content-received-for-upload', label: 'Content received for upload', order: 7 },
            { value: 'first-call-done', label: 'First Call done', order: 8 },
            { value: 'intro-email-sent', label: 'Intro Email sent after conversation', order: 9 },
            { value: 'closure-email-sent', label: 'Closure email Sent', order: 10 },
          ]
        }
      ];

      await Picklist.insertMany(defaultPicklists);
      console.log('Default picklists seeded successfully');
    }

    // Ensure closureStatus picklist exists (for existing databases)
    const closureExists = await Picklist.findOne({ name: 'closureStatus' });
    if (!closureExists) {
      await Picklist.create({
        name: 'closureStatus',
        label: 'Closure Status',
        items: [
          { value: 'ssa-sha-investor-agreement-sent', label: 'SSA/SHA/Investor agreement sent', order: 1 },
          { value: 'create-whatsapp-group', label: 'Create a Whatsapp Group', order: 2 },
          { value: 'kyc-received', label: 'KYC received', order: 3 },
          { value: 'investment-received', label: 'Investment Received', order: 4 },
          { value: 'share-certificate-sent', label: 'Share Certificate Sent', order: 5 },
          { value: 'distribution-agreements-sent', label: 'Distribution Agreements Sent', order: 6 },
          { value: 'content-received-for-upload', label: 'Content received for upload', order: 7 },
          { value: 'first-call-done', label: 'First Call done', order: 8 },
          { value: 'intro-email-sent', label: 'Intro Email sent after conversation', order: 9 },
          { value: 'closure-email-sent', label: 'Closure email Sent', order: 10 },
        ]
      });
      console.log('closureStatus picklist seeded');
    }
  } catch (error) {
    console.error('Error during initialization:', error);
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
app.use('/api/picklists', picklistRoutes);

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
