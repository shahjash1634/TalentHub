require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');

const path = require('path');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'views')));



// Updated User Schema for Job Taker
const UserSchema = new mongoose.Schema({
  name: String,
  age: Number,
  email: String,
  phone: String,
  collegeYear: Number,       // College pass-out year
  cgpa: Number,               // CGPA
  degree: String,             // Degree name
  experience: String,         // Work experience details
  extracurricular: String,    // Extra-curricular activities
  about: String,              // About me
  role: String                // 'jobTaker' or 'jobGiver'
});

// Updated Job Schema for Job Giver
const JobSchema = new mongoose.Schema({
  name: String,               // Name of the job giver
  email: String,              // Email of the job giver
  phone: String,              // Phone number
  jobType: String,            // Type of job (e.g., Software, Marketing)
  stipend: String,            // Stipend details
  workExperience: Number,     // Required work experience
  jobOptions: [String],       // Array for job types (e.g., ['Full-Time', 'Part-Time', 'Internship'])
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
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
app.get('/appliedCandidates', async (req, res) => {
  try {
    // Fetch applied candidates (adjust based on your schema and logic)
    const users = await User.find({ role: 'jobTaker' }); // Assuming job takers are the candidates
    res.json(users);
  } catch (error) {
    console.error("Error fetching applied candidates:", error);
    res.status(500).send("Internal Server Error");
  }
});


// Handle User Registration
app.post('/register', async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Log the incoming body
    try {
      const { role, name, age, email, phone, collegeYear, degree, cgpa, extracurricular, experience, about, jobType, stipend, workExperience, jobOptions } = req.body;

      if (role === 'jobTaker') {
        // Create a Job Taker User document
        const user = new User({
          name, age, email, phone, collegeYear, degree, cgpa, extracurricular, experience, about, role
        });
        await user.save();
        console.log("Job Taker saved:", user);
      } else if (role === 'jobGiver') {
        // Create a Job Giver Job document
        const job = new Job({
          name, email, phone, jobType, stipend, workExperience, jobOptions: jobOptions.split(','), applicants: []
        });
        await job.save();
        console.log("Job Giver saved:", job);
      }

      // Redirect to apply page after successful registration
      res.redirect('/apply.html');
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).send("Internal Server Error");
    }
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


// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
