// Init Socket
function initSocket() {
  if (window.socket) window.socket.disconnect();
  
  window.socket = io(window.location.origin, {
    auth: { token: window.token }
  });

  window.socket.on('connect', () => {
    console.log('Socket connected:', window.socket.id);
  });

  window.socket.on('receive_message', (msg) => {
    if (typeof window.appendMessage === 'function') {
      window.appendMessage(msg, false);
    }
    
    // Mark as seen immediately if we are chatting with this user
    const currentTargetId = document.getElementById('targetId').value;
    if (msg.sender === currentTargetId) {
      window.socket.emit('mark_seen', { messageId: msg._id, receiverId: msg.sender });
    }
  });

  window.socket.on('typing', ({ senderId }) => {
    if (senderId === document.getElementById('targetId').value) {
      document.getElementById('typingIndicator').innerText = 'User is typing...';
    }
  });

  window.socket.on('stop_typing', ({ senderId }) => {
    if (senderId === document.getElementById('targetId').value) {
      document.getElementById('typingIndicator').innerText = '';
    }
  });

  window.socket.on('message_seen', ({ messageId }) => {
    // Find message element and update checkmark
    const tick = document.getElementById(`tick-${messageId}`);
    if (tick) {
      tick.className = 'seen-tick';
      tick.innerText = '✓✓'; // Double blue tick
    }
  });
  
  // WebRTC Socket Listeners
  window.socket.on('incoming_call', (data) => {
    window.incomingCallData = data;
    const caller = window.allUsers.find(u => u._id === data.senderId);
    const callerName = caller ? caller.name : data.senderId;
    
    document.getElementById('incomingCallText').innerText = callerName;
    document.getElementById('incomingCallType').innerText = data.isVideoCall ? 'Incoming Video Call...' : 'Incoming Audio Call...';
    document.getElementById('incomingAvatar').innerText = (callerName || 'U').charAt(0);
    document.getElementById('incomingCallOverlay').classList.remove('hidden');
    
    window.socket.emit('call_ringing', { receiverId: data.senderId });
    if (typeof window.playRingtone === 'function') {
      window.playRingtone(false);
    }
    if (typeof window.showCallNotification === 'function') {
      window.showCallNotification(callerName, data.isVideoCall);
    }
  });

  window.socket.on('call_answered', async (data) => {
    if (typeof window.stopRingtone === 'function') {
      window.stopRingtone();
    }
    document.getElementById('callStatusText').innerText = 'Connected... Establishing connection';
    if (typeof window.createOffer === 'function') {
      await window.createOffer();
    }
  });

  window.socket.on('call_ringing', (data) => {
    document.getElementById('callStatusText').innerText = 'Ringing...';
  });

  window.socket.on('webrtc_offer', async (data) => {
    if (typeof window.handleOffer === 'function') {
      await window.handleOffer(data.offer);
    }
  });

  window.socket.on('webrtc_answer', async (data) => {
    if (typeof window.handleAnswer === 'function') {
      await window.handleAnswer(data.answer);
    }
  });

  window.socket.on('webrtc_ice_candidate', async (data) => {
    if (window.peerConnection && window.peerConnection.remoteDescription) {
      try { 
        await window.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate)); 
      } catch (e) {
        console.error('ICE err', e);
      }
    } else {
      window.iceCandidateQueue.push(data.candidate);
    }
  });

  window.socket.on('end_call', () => {
    if (typeof window.stopRingtone === 'function') {
      window.stopRingtone();
    }
    if (window.activeCallNotification) {
      window.activeCallNotification.close();
      window.activeCallNotification = null;
    }
    if (typeof window.endCall === 'function') {
      window.endCall();
    }
  });
}
