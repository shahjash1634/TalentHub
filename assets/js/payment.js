/*document.getElementById("paymentForm").addEventListener("submit", function (event) {
  event.preventDefault();
  alert("Payment submitted successfully!");

  // Mock function to send a confirmation email (replace with actual email logic)
  sendConfirmationEmail("applicant@example.com", "Congratulations! You have been selected and paid.");

  // Update applied job status to "Selected"
  updateJobStatus("Selected");
});

function sendConfirmationEmail(email, message) {
  console.log(`Email sent to ${email}: ${message}`);
}

function updateJobStatus(status) {
  let appliedJobs = JSON.parse(localStorage.getItem("appliedJobs")) || [];
  appliedJobs = appliedJobs.map((job) => ({ ...job, status }));
  localStorage.setItem("appliedJobs", JSON.stringify(appliedJobs));
}*/
