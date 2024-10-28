const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startCallButton = document.getElementById('startCall');
const endCallButton = document.getElementById('endCallButton');

let localStream;
let peerConnection;

const peerConnectionConfig = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

// Event listeners for buttons
startCallButton.addEventListener('click', startCall);
endCallButton.addEventListener('click', endCall);

async function startCall() {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;

    peerConnection = new RTCPeerConnection(peerConnectionConfig);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', event.candidate);
        }
    };

    peerConnection.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('video-offer', offer);

    // Show end call button and hide start call button
    endCallButton.classList.remove('hidden');
    startCallButton.classList.add('hidden');

    // Notify user that the call has started
    alert('Call started!');
}

socket.on('video-offer', async (offer) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('video-answer', answer);
});

socket.on('video-answer', (answer) => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on('ice-candidate', (candidate) => {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});

function endCall() {
    localStream.getTracks().forEach(track => track.stop());
    peerConnection.close();
    remoteVideo.srcObject = null;
    localVideo.srcObject = null;

    // Show start call button and hide end call button
    endCallButton.classList.add('hidden');
    startCallButton.classList.remove('hidden');

    alert('Call ended!');
}
