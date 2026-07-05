window.allUsers = [];

// Fetch and display users for contacts list
async function fetchUsers() {
  try {
    const res = await fetch(`${window.API_URL}/users`, {
      headers: { 'Authorization': `Bearer ${window.token}` }
    });
    const data = await res.json();
    
    if (data.success) {
      // Exclude myself
      window.allUsers = data.data.filter(u => u._id !== window.myUserId);
      renderUsers(window.allUsers);
    }
  } catch(e) {
    console.error('Failed to fetch users', e);
  }
}

function renderUsers(users) {
  const container = document.getElementById('contactsList');
  if (!container) return;
  container.innerHTML = '';
  
  if (users.length === 0) {
    container.innerHTML = '<div style="color: #888; text-align: center; padding: 20px;">No contacts found</div>';
    return;
  }
  
  const currentTarget = document.getElementById('targetId').value;
  
  users.forEach(user => {
    const div = document.createElement('div');
    div.className = `contact-item ${user._id === currentTarget ? 'active' : ''}`;
    div.onclick = () => selectContact(user);
    
    const initial = (user.name || 'U').charAt(0);
    
    div.innerHTML = `
      <div class="contact-avatar">${initial}</div>
      <div style="flex-grow: 1; min-width: 0;">
        <div class="contact-name">${user.name}</div>
        <div class="contact-email">${user.email}</div>
      </div>
    `;
    container.appendChild(div);
  });
}

function filterUsers() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const filtered = window.allUsers.filter(u => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query));
  renderUsers(filtered);
}

function selectContact(user) {
  document.getElementById('targetId').value = user._id;
  document.getElementById('chatHeaderName').innerText = user.name;
  document.getElementById('chatHeader').style.display = 'flex';
  
  // Update active state in UI
  renderUsers(window.allUsers);
  
  loadMessages();
}

// Load Messages
async function loadMessages() {
  if (!window.token) return;
  const targetId = document.getElementById('targetId').value;
  if (!targetId) return;

  try {
    const res = await fetch(`${window.API_URL}/messages/${targetId}`, {
      headers: { 'Authorization': `Bearer ${window.token}` }
    });
    const data = await res.json();
    
    const container = document.getElementById('messagesContainer');
    container.innerHTML = '';
    
    if (data.success && data.data) {
      data.data.forEach(msg => appendMessage(msg, msg.sender._id === window.myUserId || msg.sender === window.myUserId));
    }
  } catch (err) {
    alert('Error loading messages: ' + err.message);
  }
}

// Send Message via REST API (which triggers socket)
async function sendMessage() {
  const content = document.getElementById('msgContent').value;
  const targetId = document.getElementById('targetId').value;
  const sendBtn = document.querySelector('.input-area button:last-child');

  if ((!content && !window.selectedMediaFile) || !targetId) return alert('Enter message/media and target ID');

  sendBtn.innerText = 'Sending...';
  sendBtn.disabled = true;

  try {
    let imageUrl = '';
    let videoUrl = '';
    let audioUrl = '';
    
    // Upload File to Cloudinary if selected
    if (window.selectedMediaFile) {
      const formData = new FormData();
      formData.append('file', window.selectedMediaFile);
      
      const uploadRes = await fetch(`${window.API_URL}/uploads/file`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${window.token}` },
        body: formData
      });
      
      const uploadData = await uploadRes.json();
      if (uploadData.success) {
        const url = uploadData.data.secure_url;
        if (window.selectedMediaType === 'image') imageUrl = url;
        else if (window.selectedMediaType === 'video') videoUrl = url;
        else if (window.selectedMediaType === 'audio') audioUrl = url;
        else imageUrl = url; // fallback
      } else {
        throw new Error(uploadData.message || 'Media upload failed');
      }
    }

    // Send Message
    const res = await fetch(`${window.API_URL}/messages`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${window.token}`
      },
      body: JSON.stringify({
        receiver: targetId,
        content,
        imageUrl: imageUrl || undefined,
        videoUrl: videoUrl || undefined,
        audioUrl: audioUrl || undefined,
        isGroupMessage: false
      })
    });
    const data = await res.json();

    if (data.success) {
      appendMessage(data.data, true);
      document.getElementById('msgContent').value = '';
      clearMediaSelection();
      
      // Stop typing event
      if (window.socket) {
        window.socket.emit('stop_typing', { receiverId: targetId });
      }
    } else {
      alert('Failed to send: ' + data.message);
    }
  } catch (err) {
    alert('Error sending message: ' + err.message);
  } finally {
    sendBtn.innerText = 'Send';
    sendBtn.disabled = false;
  }
}

// Handle typing events
function handleTyping() {
  const targetId = document.getElementById('targetId').value;
  if (!window.socket || !targetId) return;

  window.socket.emit('typing', { receiverId: targetId });
  
  clearTimeout(window.typingTimeout);
  window.typingTimeout = setTimeout(() => {
    if (window.socket) {
      window.socket.emit('stop_typing', { receiverId: targetId });
    }
  }, 2000);
}

// Handle media selection (image, video, audio)
function handleMediaSelection(event) {
  const file = event.target.files[0];
  if (file) {
    window.selectedMediaFile = file;
    
    document.getElementById('imagePreview').classList.add('hidden');
    document.getElementById('videoPreview').classList.add('hidden');
    document.getElementById('audioPreview').classList.add('hidden');
    
    const previewUrl = URL.createObjectURL(file);
    
    if (file.type.startsWith('image/')) {
      window.selectedMediaType = 'image';
      document.getElementById('imagePreview').src = previewUrl;
      document.getElementById('imagePreview').classList.remove('hidden');
    } else if (file.type.startsWith('video/')) {
      window.selectedMediaType = 'video';
      document.getElementById('videoPreview').src = previewUrl;
      document.getElementById('videoPreview').classList.remove('hidden');
    } else if (file.type.startsWith('audio/')) {
      window.selectedMediaType = 'audio';
      document.getElementById('audioPreview').src = previewUrl;
      document.getElementById('audioPreview').classList.remove('hidden');
    } else {
      window.selectedMediaType = 'file';
    }
    
    document.getElementById('imagePreviewContainer').classList.remove('hidden');
  }
}

function clearMediaSelection() {
  window.selectedMediaFile = null;
  window.selectedMediaType = null;
  document.getElementById('msgImageFile').value = '';
  document.getElementById('imagePreviewContainer').classList.add('hidden');
  document.getElementById('imagePreview').src = '';
  document.getElementById('videoPreview').src = '';
  document.getElementById('audioPreview').src = '';
}

// Audio Recording (Voice message)
async function toggleRecording() {
  if (!window.isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      window.mediaRecorder = new MediaRecorder(stream);
      window.audioChunks = [];
      
      window.mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) window.audioChunks.push(e.data);
      };
      
      window.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(window.audioChunks, { type: 'audio/webm' });
        const file = new File([audioBlob], 'voice_message.webm', { type: 'audio/webm' });
        
        // simulate file selection
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        document.getElementById('msgImageFile').files = dataTransfer.files;
        
        handleMediaSelection({ target: document.getElementById('msgImageFile') });
      };
      
      window.mediaRecorder.start();
      window.isRecording = true;
      document.getElementById('recordBtn').style.background = '#ff4d4d';
      document.getElementById('recordBtn').style.color = 'white';
      document.getElementById('recordingIndicator').style.display = 'block';
    } catch (err) {
      alert('Microphone access denied or not available.');
    }
  } else {
    if (window.mediaRecorder && window.mediaRecorder.state !== 'inactive') {
      window.mediaRecorder.stop();
      window.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    window.isRecording = false;
    document.getElementById('recordBtn').style.background = 'rgba(255,255,255,0.1)';
    document.getElementById('recordBtn').style.color = 'white';
    document.getElementById('recordingIndicator').style.display = 'none';
  }
}

// Utility: Append message to UI
function appendMessage(msg, isMine) {
  const container = document.getElementById('messagesContainer');
  if (!container) return;
  
  const div = document.createElement('div');
  div.className = `message ${isMine ? 'msg-mine' : 'msg-theirs'}`;

  let html = `
    <div style="font-size: 11px; color: ${isMine ? '#bae6fd' : '#94a3b8'}; margin-bottom: 4px;">
      ${isMine ? 'You' : (msg.sender && msg.sender.name ? msg.sender.name : (msg.sender && msg.sender._id ? msg.sender._id : msg.sender))}
    </div>
    ${msg.content ? `<div>${msg.content}</div>` : ''}
  `;
  if (msg.imageUrl) html += `<br><img src="${msg.imageUrl}" class="msg-img" alt="image">`;
  if (msg.videoUrl) html += `<br><video src="${msg.videoUrl}" class="msg-video" controls></video>`;
  if (msg.audioUrl) html += `<br><audio src="${msg.audioUrl}" class="msg-audio" controls></audio>`;
  
  // Seen ticks (only for my messages)
  let ticks = '';
  if (isMine) {
    if (msg.seen) ticks = `<span id="tick-${msg._id}" class="seen-tick">✓✓</span>`;
    else ticks = `<span id="tick-${msg._id}" class="unseen-tick">✓</span>`;
  }
  
  html += `<div class="msg-meta">${new Date(msg.createdAt || Date.now()).toLocaleTimeString()} ${ticks}</div>`;
  
  div.innerHTML = html;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  
  // If someone else sent it and we are receiving it live, emit seen
  if (!isMine && msg._id && !msg.seen) {
     if (window.socket) {
       window.socket.emit('mark_seen', { messageId: msg._id, receiverId: msg.sender._id || msg.sender });
     }
  }
}
