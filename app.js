require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();

// MongoDB Connection
mongoose
  .connect(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'yourSecretKey',
  resave: false,
  saveUninitialized: true,
}));
app.use(express.static(path.join(__dirname, 'views')));

// Schemas
const UserSchema = new mongoose.Schema({
  name: String,
  age: Number,
  email: String,
  phone: String,
  collegeYear: Number,
  cgpa: Number,
  degree: String,
  experience: String,
  extracurricular: String,
  about: String,
  role: String,
});

const JobSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  jobType: String,
  stipend: String,
  workExperience: Number,
  jobOptions: [String],
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, default: 'pending' }, // Add a status field to track the job status
});

const User = mongoose.model('User', UserSchema);
const Job = mongoose.model('Job', JobSchema);

// Routes

// Welcome Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

// Register Page
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/register.html'));
});

// Handle User Registration
app.post('/register', async (req, res) => {
  try {
    const { role, ...data } = req.body;

    if (role === 'jobTaker') {
      const user = new User(data);
      await user.save();
    } else if (role === 'jobGiver') {
      const jobOptionsArray = Array.isArray(data.jobOptions)
        ? data.jobOptions
        : [data.jobOptions];
      const job = new Job({ ...data, jobOptions: jobOptionsArray });
      await job.save();
    } else {
      return res.status(400).send('Invalid role specified.');
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Apply for Job (job taker applying to a job)
app.post('/apply', async (req, res) => {
  try {
    const { jobId, userId } = req.body;

    const job = await Job.findById(jobId);
    const user = await User.findById(userId);

    if (!job || !user) {
      return res.status(404).send('Job or User not found');
    }

    // Add the user to the applicants list
    job.applicants.push(user._id); // Add the user to the applicants list
    await job.save();

    res.status(200).send('Application successful');
  } catch (error) {
    console.error("Error applying for job:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Apply Page - Return job data as JSON
app.get('/apply', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs); // Send jobs data as JSON
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Payment Confirmation Route
app.post('/confirmPayment', async (req, res) => {
  try {
    const { companyName, companyEmail, confirmationEmail, startingAmount, paymentType, bankName, expiryDate, upiId } = req.body;

    // Validate confirmationEmail
    if (!confirmationEmail) {
      return res.status(400).json({ message: 'No recipient email defined' });
    }

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail(confirmationEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const paymentDetails = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background: #f9f9f9;">
        <h2 style="text-align: center; color: #4CAF50;">🎉 TalentHub Selection Confirmation 🎉</h2>
        <p>Dear Customer,</p>
        <p>We are delighted to inform you that a payment of <strong>${startingAmount}</strong> has been successfully sent and processed via TalentHub.</p>
        <p>Here are the details of the transaction:</p>
        <ul style="list-style-type: none; padding: 0;">
        <li><strong>Company Email:</strong> ${companyName}</li>
          <li><strong>Company Email:</strong> ${companyEmail}</li>
          <li><strong>Starting Amount:</strong> ${startingAmount}</li>
          <li><strong>Payment Type:</strong> ${paymentType}</li>
          ${paymentType === 'card'
        ? `<li><strong>Bank Name:</strong> ${bankName}</li>
               <li><strong>Expiry Date:</strong> ${expiryDate}</li>` // Card payment details
        : paymentType === 'upi'
          ? `<li><strong>UPI ID:</strong> ${upiId}</li>` // UPI payment details
          : ''
      }
        </ul>
        <p>As part of the welcome bonus initiative, we’re excited to grant you a starting bonus to kickstart your journey with ${companyName}. We look forward to a successful collaboration.</p>
        <p style="text-align: center; font-weight: bold; color: #4CAF50;">Thank you for trusting TalentHub!</p>
        <p>Best regards,<br>The TalentHub Team</p>
      </div>
    `;

    // Set up Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER, // Use the company email entered in the form as the sender
        pass: process.env.EMAIL_PASS, // Use an environment variable for email password
      },
    });

    // Mail options
    const mailOptions = {
      from: companyEmail, // Sender email (from the form input)
      to: confirmationEmail, // Recipient email (from the form input)
      subject: 'Selection Confirmation',
      html: paymentDetails,
    };

    console.log("Mail Options:", mailOptions); // Debugging log

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Payment confirmed and email sent!' });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Applied Candidates Route
app.get('/appliedCandidates', async (req, res) => {
  try {
    const users = await User.find({ role: 'jobTaker' });
    console.log("Fetched Users:", users); // Add this line
    res.json(users);
  } catch (error) {
    console.error("Error fetching applied candidates:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to get applied jobs for the user
app.get('/appliedJobs', async (req, res) => {
  try {
    const userId = req.session.userId; // Change this to match how you store user data
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Fetch jobs applied by the user (you should modify this based on your data structure)
    const appliedJobs = await Job.find({ applicants: userId });

    if (appliedJobs.length === 0) {
      return res.status(404).json({ message: 'No applied jobs found' });
    }

    // Format the jobs data (modify this based on your schema)
    const jobs = appliedJobs.map(job => ({
      title: job.name, // Replace 'name' with the actual field from your Job schema
      status: job.status || 'pending', // Modify as necessary
    }));

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching applied jobs:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Update Job Status to "Confirmed"
app.post('/confirmJob', async (req, res) => {
  try {
    const { jobId, userId } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).send("Job not found");

    const applicant = job.applicants.find(app => app.userId.toString() === userId);
    if (!applicant) return res.status(404).send("Applicant not found");

    applicant.status = "Confirmed";
    await job.save();

    res.status(200).send("Job status updated to Confirmed");
  } catch (error) {
    console.error("Error confirming job:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
