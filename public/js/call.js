// WebRTC Call Logic
function playRingtone(isOutgoing = false) {
  if (!window.audioCtx) window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (window.audioCtx.state === 'suspended') window.audioCtx.resume();
  
  const playTone = () => {
    if (!window.audioCtx) return;
    const osc = window.audioCtx.createOscillator();
    const gain = window.audioCtx.createGain();
    osc.connect(gain);
    gain.connect(window.audioCtx.destination);
    
    if (isOutgoing) {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, window.audioCtx.currentTime);
      osc.frequency.setValueAtTime(480, window.audioCtx.currentTime);
      
      gain.gain.setValueAtTime(0, window.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, window.audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, window.audioCtx.currentTime + 1.5);
      gain.gain.linearRampToValueAtTime(0, window.audioCtx.currentTime + 1.6);
      
      osc.start(window.audioCtx.currentTime);
      osc.stop(window.audioCtx.currentTime + 1.6);
    } else {
      osc.type = 'square';
      osc.frequency.setValueAtTime(600, window.audioCtx.currentTime);
      osc.frequency.setValueAtTime(800, window.audioCtx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0, window.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, window.audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.1, window.audioCtx.currentTime + 0.4);
      gain.gain.linearRampToValueAtTime(0, window.audioCtx.currentTime + 0.45);
      
      osc.start(window.audioCtx.currentTime);
      osc.stop(window.audioCtx.currentTime + 0.5);
      
      const osc2 = window.audioCtx.createOscillator();
      const gain2 = window.audioCtx.createGain();
      osc2.type = 'square';
      osc2.connect(gain2);
      gain2.connect(window.audioCtx.destination);
      
      osc2.frequency.setValueAtTime(600, window.audioCtx.currentTime + 0.6);
      osc2.frequency.setValueAtTime(800, window.audioCtx.currentTime + 0.7);
      
      gain2.gain.setValueAtTime(0, window.audioCtx.currentTime + 0.6);
      gain2.gain.linearRampToValueAtTime(0.1, window.audioCtx.currentTime + 0.65);
      gain2.gain.setValueAtTime(0.1, window.audioCtx.currentTime + 1.0);
      gain2.gain.linearRampToValueAtTime(0, window.audioCtx.currentTime + 1.05);
      
      osc2.start(window.audioCtx.currentTime + 0.6);
      osc2.stop(window.audioCtx.currentTime + 1.05);
    }
  };

  playTone();
  window.ringInterval = setInterval(playTone, isOutgoing ? 3000 : 2000);
}

function stopRingtone() {
  if (window.ringInterval) {
    clearInterval(window.ringInterval);
    window.ringInterval = null;
  }
}

async function setupLocalStream(isVideoCall) {
  try {
    window.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideoCall });
    document.getElementById('localVideo').srcObject = window.localStream;
  } catch (err) {
    alert('Could not access Camera/Microphone: ' + err.message);
    throw err;
  }
}

function setupPeerConnection() {
  window.peerConnection = new RTCPeerConnection(window.iceServers);
  
  // Add local stream tracks to connection
  window.localStream.getTracks().forEach(track => {
    window.peerConnection.addTrack(track, window.localStream);
  });

  if (!window.remoteStream) {
    window.remoteStream = new MediaStream();
    document.getElementById('remoteVideo').srcObject = window.remoteStream;
    const audioEl = document.getElementById('remoteAudio');
    if (audioEl) audioEl.srcObject = window.remoteStream;
  }

  // Handle incoming remote stream securely ensuring elements update
  window.peerConnection.ontrack = (event) => {
    const track = event.track;
    if (!window.remoteStream.getTracks().find(t => t.id === track.id)) {
      window.remoteStream.addTrack(track);
    }
    
    // Attempt play
    const videoElement = document.getElementById('remoteVideo');
    const audioElement = document.getElementById('remoteAudio');
    if (videoElement) videoElement.play().catch(e => console.log('Video play error', e));
    if (audioElement) audioElement.play().catch(e => console.log('Audio play error', e));
  };

  // Send ICE candidates to peer
  window.peerConnection.onicecandidate = (event) => {
    if (event.candidate && window.socket) {
      window.socket.emit('webrtc_ice_candidate', { receiverId: window.callReceiverId, candidate: event.candidate });
    }
  };

  // Start recording when connection is established
  window.peerConnection.onconnectionstatechange = () => {
    if (window.peerConnection.connectionState === 'connected') {
      startRecording();
    }
  };
}

async function initiateCall(isVideoCall) {
  window.callReceiverId = document.getElementById('targetId').value;
  if (!window.callReceiverId) return alert('Select a contact to call!');
  
  const receiver = window.allUsers.find(u => u._id === window.callReceiverId);
  const receiverName = receiver ? receiver.name : window.callReceiverId;
  
  window.myIsVideoCall = isVideoCall;
  
  // Update UI for video/audio mode
  if (isVideoCall) {
    document.getElementById('videoContainer').classList.remove('hidden');
    document.getElementById('audioContainer').classList.add('hidden');
    document.getElementById('screenShareBtn').classList.remove('hidden');
  } else {
    document.getElementById('videoContainer').classList.add('hidden');
    document.getElementById('audioAvatar').innerText = (receiverName || 'U').charAt(0);
    document.getElementById('audioContainer').classList.remove('hidden');
    document.getElementById('screenShareBtn').classList.add('hidden');
  }
  
  document.getElementById('activeCallOverlay').classList.remove('hidden');
  document.getElementById('callStatusText').innerText = `Calling ${receiverName}...`;
  
  try {
    await setupLocalStream(isVideoCall);
    if (window.socket) {
      window.socket.emit('call_user', { receiverId: window.callReceiverId, isVideoCall });
    }
    playRingtone(true);
  } catch (e) {
    document.getElementById('activeCallOverlay').classList.add('hidden');
  }
}

async function acceptCall() {
  if (window.activeCallNotification) {
    window.activeCallNotification.close();
    window.activeCallNotification = null;
  }
  if (!window.incomingCallData) return;
  window.callReceiverId = window.incomingCallData.senderId;
  window.myIsVideoCall = window.incomingCallData.isVideoCall;
  
  // Update UI for video/audio mode
  if (window.myIsVideoCall) {
    document.getElementById('videoContainer').classList.remove('hidden');
    document.getElementById('audioContainer').classList.add('hidden');
    document.getElementById('screenShareBtn').classList.remove('hidden');
  } else {
    document.getElementById('videoContainer').classList.add('hidden');
    document.getElementById('audioAvatar').innerText = document.getElementById('incomingAvatar').innerText;
    document.getElementById('audioContainer').classList.remove('hidden');
    document.getElementById('screenShareBtn').classList.add('hidden');
  }

  document.getElementById('incomingCallOverlay').classList.add('hidden');
  document.getElementById('activeCallOverlay').classList.remove('hidden');
  document.getElementById('callStatusText').innerText = 'Connecting...';
  
  stopRingtone();
  try {
    await setupLocalStream(window.incomingCallData.isVideoCall);
    setupPeerConnection();
    if (window.socket) {
      window.socket.emit('answer_call', { receiverId: window.callReceiverId });
    }
  } catch (e) {
    rejectCall();
  }
}

function rejectCall() {
  if (window.activeCallNotification) {
    window.activeCallNotification.close();
    window.activeCallNotification = null;
  }
  stopRingtone();
  if (window.incomingCallData) {
    if (window.socket) {
      window.socket.emit('end_call', { receiverId: window.incomingCallData.senderId });
    }
    sendCallSystemMessage(window.incomingCallData.senderId, `📞 Missed ${window.incomingCallData.isVideoCall ? 'Video' : 'Audio'} Call`);
    window.incomingCallData = null;
  }
  document.getElementById('incomingCallOverlay').classList.add('hidden');
}

async function createOffer() {
  setupPeerConnection();
  const offer = await window.peerConnection.createOffer();
  await window.peerConnection.setLocalDescription(offer);
  if (window.socket) {
    window.socket.emit('webrtc_offer', { receiverId: window.callReceiverId, offer });
  }
}

async function handleOffer(offer) {
  await window.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await window.peerConnection.createAnswer();
  await window.peerConnection.setLocalDescription(answer);
  if (window.socket) {
    window.socket.emit('webrtc_answer', { receiverId: window.callReceiverId, answer });
  }
  
  await processIceQueue();
  
  document.getElementById('callStatusText').innerText = '00:00'; 
  window.callStartTime = Date.now();
  window.isCallConnected = true;
  
  if (window.callTimer) clearInterval(window.callTimer);
  window.callTimer = setInterval(() => {
    const durationSecs = Math.floor((Date.now() - window.callStartTime) / 1000);
    const mins = Math.floor(durationSecs / 60).toString().padStart(2, '0');
    const secs = (durationSecs % 60).toString().padStart(2, '0');
    document.getElementById('callStatusText').innerText = `${mins}:${secs}`;
  }, 1000);
}

async function toggleScreenShare() {
  if (!window.isScreenSharing) {
    try {
      window.screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = window.screenStream.getVideoTracks()[0];
      
      const sender = window.peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
      if (sender) {
        sender.replaceTrack(screenTrack);
      }
      
      document.getElementById('localVideo').srcObject = window.screenStream;
      window.isScreenSharing = true;
      document.getElementById('screenShareBtn').style.background = '#28a745';

      screenTrack.onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.error('Error sharing screen:', err);
    }
  } else {
    stopScreenShare();
  }
}

function stopScreenShare() {
  if (!window.isScreenSharing) return;
  
  const videoTrack = window.localStream.getVideoTracks()[0];
  const sender = window.peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
  if (sender && videoTrack) {
    sender.replaceTrack(videoTrack);
  }
  
  if (window.screenStream) {
    window.screenStream.getTracks().forEach(track => track.stop());
    window.screenStream = null;
  }
  
  document.getElementById('localVideo').srcObject = window.localStream;
  window.isScreenSharing = false;
  document.getElementById('screenShareBtn').style.background = '#0084ff';
}

async function handleAnswer(answer) {
  await window.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  await processIceQueue();
  document.getElementById('callStatusText').innerText = '00:00'; 
  window.callStartTime = Date.now();
  window.isCallConnected = true;
  
  if (window.callTimer) clearInterval(window.callTimer);
  window.callTimer = setInterval(() => {
    const durationSecs = Math.floor((Date.now() - window.callStartTime) / 1000);
    const mins = Math.floor(durationSecs / 60).toString().padStart(2, '0');
    const secs = (durationSecs % 60).toString().padStart(2, '0');
    document.getElementById('callStatusText').innerText = `${mins}:${secs}`;
  }, 1000);
}

async function processIceQueue() {
  for (const candidate of window.iceCandidateQueue) {
    try { 
      await window.peerConnection.addIceCandidate(new RTCIceCandidate(candidate)); 
    } catch (e) { 
      console.error('Delayed ICE err', e); 
    }
  }
  window.iceCandidateQueue = [];
}

function endCall() {
  if (window.activeCallNotification) {
    window.activeCallNotification.close();
    window.activeCallNotification = null;
  }
  stopRingtone();
  if (window.callReceiverId) {
    if (window.socket) {
      window.socket.emit('end_call', { receiverId: window.callReceiverId });
    }
    
    if (!window.isCallConnected) {
      sendCallSystemMessage(window.callReceiverId, `📞 Canceled ${window.myIsVideoCall ? 'Video' : 'Audio'} Call`);
    } else if (window.callStartTime) {
      const durationSecs = Math.floor((Date.now() - window.callStartTime) / 1000);
      const mins = Math.floor(durationSecs / 60);
      const secs = durationSecs % 60;
      sendCallSystemMessage(window.callReceiverId, `📞 ${window.myIsVideoCall ? 'Video' : 'Audio'} Call Ended (${mins}m ${secs}s)`);
    }
  }
  if (window.callTimer) {
    clearInterval(window.callTimer);
    window.callTimer = null;
  }
  stopRecording();
  
  if (window.screenStream) {
    window.screenStream.getTracks().forEach(track => track.stop());
    window.screenStream = null;
  }
  window.isScreenSharing = false;
  const screenShareBtn = document.getElementById('screenShareBtn');
  if (screenShareBtn) screenShareBtn.style.background = '#0084ff';

  if (window.peerConnection) {
    window.peerConnection.close();
    window.peerConnection = null;
  }
  if (window.localStream) {
    window.localStream.getTracks().forEach(track => track.stop());
    window.localStream = null;
  }
  if (window.remoteStream) {
    window.remoteStream = null;
  }
  window.callReceiverId = null;
  window.incomingCallData = null;
  window.callStartTime = null;
  window.isCallConnected = false;
  window.iceCandidateQueue = [];
  document.getElementById('incomingCallOverlay').classList.add('hidden');
  document.getElementById('activeCallOverlay').classList.add('hidden');
  document.getElementById('remoteVideo').srcObject = null;
  document.getElementById('localVideo').srcObject = null;
  const audioEl = document.getElementById('remoteAudio');
  if (audioEl) audioEl.srcObject = null;
}

// Call Recording Logic
function startRecording() {
  if (!window.remoteStream || window.remoteStream.getTracks().length === 0) return;
  window.recordedChunks = [];
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const destination = audioContext.createMediaStreamDestination();

    // Mix local audio
    if (window.localStream && window.localStream.getAudioTracks().length > 0) {
      const localSource = audioContext.createMediaStreamSource(new MediaStream([window.localStream.getAudioTracks()[0]]));
      localSource.connect(destination);
    }

    // Mix remote audio
    if (window.remoteStream && window.remoteStream.getAudioTracks().length > 0) {
      const remoteSource = audioContext.createMediaStreamSource(new MediaStream([window.remoteStream.getAudioTracks()[0]]));
      remoteSource.connect(destination);
    }

    const combinedTracks = [...destination.stream.getAudioTracks()];
    // Add video track if it exists
    if (window.remoteStream.getVideoTracks().length > 0) {
      combinedTracks.push(window.remoteStream.getVideoTracks()[0]);
    }

    const finalStream = new MediaStream(combinedTracks);
    
    // Ensure supported mime type
    let options = { mimeType: 'video/webm' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: 'video/mp4' };
    }
    
    window.callRecorder = new MediaRecorder(finalStream, options);

    window.callRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) window.recordedChunks.push(e.data);
    };

    window.callRecorder.onstop = () => {
      if (window.recordedChunks.length === 0) return;
      const blob = new Blob(window.recordedChunks, { type: window.callRecorder.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Call_Recording_${new Date().toISOString().replace(/[:.]/g, '-')}.${window.callRecorder.mimeType.split('/')[1].split(';')[0]}`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      window.recordedChunks = [];
    };

    window.callRecorder.start();
  } catch (err) {
    console.error("Recording setup failed", err);
  }
}

function stopRecording() {
  if (window.callRecorder && window.callRecorder.state !== 'inactive') {
    window.callRecorder.stop();
    window.callRecorder = null;
  }
}

async function sendCallSystemMessage(receiverId, content) {
  try {
    const res = await fetch(`${window.API_URL}/messages`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${window.token}`
      },
      body: JSON.stringify({
        receiver: receiverId,
        content: content,
        isGroupMessage: false
      })
    });
    const data = await res.json();
    if (data.success) {
      if (typeof window.appendMessage === 'function') {
        window.appendMessage(data.data, true);
      }
    }
  } catch (err) {
    console.error('Failed to send call system message', err);
  }
}

window.showCallNotification = function(callerName, isVideoCall) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const callType = isVideoCall ? 'Video Call' : 'Audio Call';
    const notification = new Notification(`Incoming ${callType}`, {
      body: `${callerName} is calling you...`,
      tag: 'incoming-call',
      requireInteraction: true
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    window.activeCallNotification = notification;
  }
};
