fetch('http://localhost:5000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com', password: 'password' })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
