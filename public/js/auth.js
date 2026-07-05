// Login Function
async function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    alert('Please fill in both email and password.');
    return;
  }

  try {
    const res = await fetch(`${window.API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    
    if (data.success) {
      window.token = data.data.token;
      window.myUserId = data.data.user._id;
      
      localStorage.setItem('token', window.token);
      localStorage.setItem('myUserId', window.myUserId);
      
      if (typeof window.requestNotificationPermission === 'function') {
        window.requestNotificationPermission();
      }
      
      document.getElementById('loginBlock').classList.add('hidden');
      document.getElementById('contactsBlock').classList.remove('hidden');
      
      if (typeof window.initSocket === 'function') {
        window.initSocket();
      }
      if (typeof window.fetchUsers === 'function') {
        window.fetchUsers();
      }
    } else {
      alert('Login failed: ' + data.message);
    }
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

// Logout Function
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('myUserId');
  window.token = '';
  window.myUserId = '';
  
  if (window.socket) {
    window.socket.disconnect();
    window.socket = null;
  }
  
  document.getElementById('contactsBlock').classList.add('hidden');
  document.getElementById('loginBlock').classList.remove('hidden');
  document.getElementById('chatHeader').style.display = 'none';
  document.getElementById('messagesContainer').innerHTML = '<div style="text-align: center; color: #888; margin-top: 20px;">Select a contact to start chatting</div>';
  document.getElementById('targetId').value = '';
}

// Create Account / Registration Function
async function register() {
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const statusDiv = document.getElementById('registerStatus');

  if (!name || !email || !password) {
    alert('Please fill in all fields.');
    return;
  }

  statusDiv.style.color = '#ef4444';
  statusDiv.innerText = '';

  try {
    const res = await fetch(`${window.API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();

    if (data.success) {
      statusDiv.style.color = '#22c55e';
      statusDiv.innerText = 'Registration successful! Directing to login...';
      
      setTimeout(() => {
        // Auto-fill login fields and switch block
        document.getElementById('loginEmail').value = email;
        document.getElementById('loginPassword').value = password;
        toggleAuthBlock('login');
        statusDiv.innerText = '';
        
        // Clear registration fields
        document.getElementById('registerName').value = '';
        document.getElementById('registerEmail').value = '';
        document.getElementById('registerPassword').value = '';
      }, 1500);
    } else {
      statusDiv.innerText = data.message || 'Registration failed';
    }
  } catch (err) {
    statusDiv.innerText = 'Error: ' + err.message;
  }
}

// Toggle Auth Views (Login vs Registration)
function toggleAuthBlock(mode) {
  const loginBlock = document.getElementById('loginBlock');
  const registerBlock = document.getElementById('registerBlock');
  
  if (mode === 'register') {
    loginBlock.classList.add('hidden');
    registerBlock.classList.remove('hidden');
  } else {
    registerBlock.classList.add('hidden');
    loginBlock.classList.remove('hidden');
  }
}
