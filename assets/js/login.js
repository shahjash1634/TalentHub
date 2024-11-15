document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  let role = document.getElementById('role').value;
  let username = document.getElementById('username').value;
  let password = document.getElementById('password').value;

  fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role })
  })
    .then(response => {
      if (response.ok) {
        window.location.href = role === 'giver' ? '/dashboard' : '/apply';
      } else {
        alert('Invalid credentials');
      }
    })
    .catch(err => console.error('Error:', err));
});
