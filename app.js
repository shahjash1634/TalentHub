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
    const { role, name, age, email, phone, collegeYear, degree, cgpa, extracurricular, experience, about, jobType, stipend, workExperience, jobOptions } = req.body;

    if (role === 'jobTaker') {
      const user = new User({ name, age, email, phone, collegeYear, degree, cgpa, extracurricular, experience, about, role });
      await user.save();
    } else if (role === 'jobGiver') {
      const job = new Job({ name, email, phone, jobType, stipend, workExperience, jobOptions: jobOptions.split(','), applicants: [] });
      await job.save();
    }

    res.redirect('/apply.html');
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Apply Page
app.get('/apply', async (req, res) => {
  const jobs = await Job.find();
  res.render('apply', { jobs });
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

    // Prepare payment details
    const paymentDetails = `
      <h3>Payment Confirmation</h3>
      <p><strong>Company Name:</strong> ${companyName}</p>
      <p><strong>Company Email:</strong> ${companyEmail}</p>
      <p><strong>Starting Amount:</strong> ${startingAmount}</p>
      <p><strong>Payment Type:</strong> ${paymentType}</p>
      ${paymentType === 'card'
        ? `<p><strong>Bank Name:</strong> ${bankName}</p>
           <p><strong>Expiry Date:</strong> ${expiryDate}</p>` // Card payment details
        : paymentType === 'upi'
          ? `<p><strong>UPI ID:</strong> ${upiId}</p>` // UPI payment details
          : ''
      }
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
      subject: 'Payment Confirmation',
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
    res.json(users);
  } catch (error) {
    console.error("Error fetching applied candidates:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
