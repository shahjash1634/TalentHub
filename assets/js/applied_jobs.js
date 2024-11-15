/*function displayAppliedJobs() {
  const appliedJobsContainer = document.querySelector(".applied-jobs-list");
  const appliedJobs = JSON.parse(localStorage.getItem("appliedJobs")) || [];

  appliedJobs.forEach((job) => {
    const jobItem = document.createElement("div");
    jobItem.classList.add("job-item");
    jobItem.innerHTML = `
      <h3>${job.jobTitle}</h3>
      <p>Status: ${job.status}</p>
    `;
    appliedJobsContainer.appendChild(jobItem);
  });
}

// Call the function to display applied jobs on page load
displayAppliedJobs();*/
