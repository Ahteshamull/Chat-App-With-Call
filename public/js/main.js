// Global State & Config Variables
window.API_URL = window.location.origin + '/api/v1';
window.token = '';
window.myUserId = '';
window.socket = null;
window.typingTimeout = null;
window.selectedMediaFile = null;
window.selectedMediaType = null;
window.mediaRecorder = null;
window.audioChunks = [];
window.isRecording = false;

// WebRTC Variables
window.peerConnection = null;
window.localStream = null;
window.remoteStream = null;
window.callReceiverId = null;
window.incomingCallData = null; 
window.callStartTime = null;
window.isCallConnected = false;
window.myIsVideoCall = false; // To track if we initiated a video or audio call
window.callRecorder = null;
window.recordedChunks = [];
// Default ICE config (STUN only - will be upgraded with TURN from server)
window.iceServers = { 
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ] 
    };

// Fetch TURN credentials from server (metered.ca free API)
window.fetchTurnCredentials = async function() {
  try {
    console.log('🔑 [TURN] Fetching TURN credentials from server...');
    const res = await fetch(`${window.API_URL}/turn-credentials`);
    const data = await res.json();
    
    if (data.success && data.iceServers && data.iceServers.length > 0) {
      window.iceServers = { iceServers: data.iceServers };
      const turnCount = data.iceServers.filter(s => s.urls && s.urls.toString().includes('turn')).length;
      console.log('🔑 [TURN] ✅ Got', data.iceServers.length, 'servers (' + turnCount + ' TURN servers)');
      if (turnCount === 0) {
        console.warn('🔑 [TURN] ⚠️ No TURN servers! Calls may fail behind NAT. Add METERED_API_KEY and METERED_APP_NAME to .env');
      }
    } else {
      console.warn('🔑 [TURN] ⚠️ No ICE servers from API, using defaults');
    }
  } catch (err) {
    console.error('🔑 [TURN] ❌ Failed to fetch TURN credentials:', err.message);
  }
};
window.isScreenSharing = false;
window.screenStream = null;
window.iceCandidateQueue = [];
window.isRecordingCall = false;

window.audioCtx = null;
window.ringInterval = null;
window.activeCallNotification = null;

// Global click listener to resume AudioContext (helps bypass autoplay policies)
document.addEventListener('click', () => {
  if (window.audioCtx && window.audioCtx.state === 'suspended') {
    window.audioCtx.resume();
  }
});

// Request Notification Permission
window.requestNotificationPermission = function() {
  if ('Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission status:', permission);
      });
    }
  }
};

// Auto-login check when page loads
window.addEventListener('DOMContentLoaded', () => {
  // Request notification permission immediately on load
  window.requestNotificationPermission();

  const savedToken = localStorage.getItem('token');
  const savedUserId = localStorage.getItem('myUserId');
  if (savedToken && savedUserId) {
    window.token = savedToken;
    window.myUserId = savedUserId;
    document.getElementById('loginBlock').classList.add('hidden');
    document.getElementById('contactsBlock').classList.remove('hidden');
    
    // Check and run socket / users fetch if other files are loaded
    if (typeof window.initSocket === 'function') {
      window.initSocket();
    }
    if (typeof window.fetchUsers === 'function') {
      window.fetchUsers();
    }
  }
});
