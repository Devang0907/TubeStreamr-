const userVideo = document.getElementById('user-video');
const startButton = document.getElementById('start-btn');
const linkCodeInput = document.getElementById('link-code');
const submitCodeButton = document.getElementById('submit-code');

const state = { media: null, linkCode: null };
const socket = io();

startButton.addEventListener('click', () => {
    const mediaRecorder = new MediaRecorder(state.media, {
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: 2500000,
        framerate: 25
    });

    mediaRecorder.ondataavailable = ev => {
        console.log('Binary Stream Available', ev.data);
        socket.emit('binarystream', ev.data);
    };

    mediaRecorder.start(25);
});

submitCodeButton.addEventListener('click', () => {
    const linkCode = linkCodeInput.value;
    if (linkCode) {
        state.linkCode = linkCode;
        console.log('Link Code Submitted:', linkCode);
        socket.emit('linkCode', linkCode); // Send the link code to the server
    }
});

window.addEventListener('load', async () => {
    const media = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    state.media = media;
    userVideo.srcObject = media;
});
