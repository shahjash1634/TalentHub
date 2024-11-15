/*let currentStep = 1;

// Function to move to the next step
function nextStep() {
  const currentStepDiv = document.getElementById(`step-${currentStep}`);
  const nextStepDiv = document.getElementById(`step-${currentStep + 1}`);

  // Validate inputs in the current step
  if (validateStep(currentStepDiv)) {
    // Hide current step and show the next step
    currentStepDiv.style.display = 'none';
    if (nextStepDiv) {
      nextStepDiv.style.display = 'block';
      currentStep++;
    }
  } else {
    alert("Please fill in all fields.");
  }
}

// Function to validate the inputs of the current step
function validateStep(stepDiv) {
  const inputs = stepDiv.querySelectorAll("input, textarea");
  for (const input of inputs) {
    if (!input.value.trim()) {
      return false; // Return false if any field is empty
    }
  }
  return true; // Return true if all fields are filled
}

// Handle form submission
document.getElementById("registerForm").addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent the default form submission

  // Collect the form data as a JavaScript object
  const formData = {
    username: document.getElementById('username').value,
    password: document.getElementById('password').value,
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    college: document.getElementById('college').value,
    degree: document.getElementById('degree').value,
    cgpa: document.getElementById('cgpa').value,
    extracurricular: document.getElementById('extracurricular').value,
    experience: document.getElementById('experience').value
  };

  // Send the form data as JSON
  fetch('/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Redirect to apply.html upon successful registration
        window.location.href = "/apply.html";
      } else {
        alert("Registration failed. Please try again.");
      }
    })
    .catch(error => {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    });
});
*/