import http from 'http';
import path from 'path';
import { spawn } from 'child_process';
import express from 'express';
import { Server as SocketIO } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server);

// Variable to store the current stream key
let streamKey = '';

// Default ffmpeg options
let options = [
    '-i',
    '-',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-tune', 'zerolatency',
    '-r', '25',
    '-g', '50',
    '-keyint_min', '25',
    '-crf', '25',
    '-pix_fmt', 'yuv420p',
    '-sc_threshold', '0',
    '-profile:v', 'main',
    '-level', '3.1',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', '44100',
    '-f', 'flv',
    `rtmp://a.rtmp.youtube.com/live2/${streamKey}`, // Stream URL
];

// Initialize ffmpeg process
let ffmpegProcess;

const startFFmpegProcess = () => {
    // Kill any existing ffmpeg process
    if (ffmpegProcess) {
        ffmpegProcess.kill('SIGINT');
    }

    // Spawn a new ffmpeg process
    ffmpegProcess = spawn('ffmpeg', options);

    ffmpegProcess.stdout.on('data', (data) => {
        console.log(`ffmpeg stdout: ${data}`);
    });

    ffmpegProcess.stderr.on('data', (data) => {
        console.error(`ffmpeg stderr: ${data}`);
    });

    ffmpegProcess.on('close', (code) => {
        console.log(`ffmpeg process exited with code ${code}`);
        ffmpegProcess = null; // Reset ffmpeg process
    });
};

// Serve static files from the public directory
app.use(express.static(path.resolve('./public')));

// Handle socket connections
io.on('connection', (socket) => {
    console.log('Socket Connected', socket.id);

    // Receive link code from client
    socket.on('linkCode', (code) => {
        streamKey = code; // Update the stream key
        console.log('Stream Key Received:', streamKey);
        
        // Update ffmpeg options with the new stream key
        options[options.length - 1] = `rtmp://a.rtmp.youtube.com/live2/${streamKey}`;
        console.log('Updated ffmpeg options:', options);

        // Start the ffmpeg process with new options
        startFFmpegProcess();
    });

    // Receive binary stream from client
    socket.on('binarystream', (stream) => {
        console.log('Binary Stream Incoming...');
        if (ffmpegProcess) {
            ffmpegProcess.stdin.write(stream, (err) => {
                if (err) {
                    console.error('Error writing to ffmpeg stdin:', err);
                }
            });
        } else {
            console.error('FFmpeg process is not running.');
        }
    });
});

// Start the server
server.listen(3000, () => {
    console.log(`HTTP Server is running on PORT 3000`);
});
