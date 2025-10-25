import { getUserByUuid, database, ref, update } from './firebase-config.js';

let currentStream = null;
let scanning = false;
let currentUser = null;
let photoCount = 0;

// DOM Elements
const video = document.getElementById('video');
const qrCanvas = document.getElementById('qr-canvas');
const startButton = document.getElementById('start-camera');
const switchButton = document.getElementById('switch-camera');
const captureButton = document.getElementById('capture-photo');
const cameraSelect = document.getElementById('camera-select');
const scanStatus = document.getElementById('scan-status');
const userInfo = document.getElementById('user-info');
const previewContainer = document.getElementById('preview-container');
const preview = document.getElementById('preview');
const retakeButton = document.getElementById('retake-photo');
const saveButton = document.getElementById('save-photo');

// Initialize camera handling
async function initializeCamera() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length > 1) {
            document.getElementById('device-selector').classList.remove('hidden');
            videoDevices.forEach((device, index) => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `Camera ${index + 1}`;
                cameraSelect.appendChild(option);
            });
            switchButton.disabled = false;
        }
    } catch (error) {
        console.error('Error getting cameras:', error);
    }
}

// Start camera with QR scanning
async function startCamera() {
    try {
        const constraints = {
            video: {
                deviceId: cameraSelect.value ? { exact: cameraSelect.value } : undefined,
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };

        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }

        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = currentStream;
        
        scanning = true;
        scanQRCode();
        
        startButton.textContent = 'Stop Camera';
        captureButton.disabled = true;
    } catch (error) {
        console.error('Error starting camera:', error);
        scanStatus.textContent = 'Failed to start camera: ' + error.message;
        scanStatus.className = 'status error';
    }
}

// Scan for QR codes
function scanQRCode() {
    if (!scanning) return;

    const context = qrCanvas.getContext('2d');
    qrCanvas.width = video.videoWidth;
    qrCanvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0, qrCanvas.width, qrCanvas.height);
    const imageData = context.getImageData(0, 0, qrCanvas.width, qrCanvas.height);
    
    try {
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
            handleQRCode(code.data);
        }
    } catch (error) {
        console.error('QR scanning error:', error);
    }

    if (scanning) {
        requestAnimationFrame(scanQRCode);
    }
}

// Handle QR code data
async function handleQRCode(data) {
    try {
        const uuid = data.split('/').pop();
        const result = await getUserByUuid(uuid);
        
        if (result.ok && result.record) {
            currentUser = result.record;
            displayUserInfo(currentUser);
            scanning = false;
            captureButton.disabled = false;
            startButton.textContent = 'Restart Scanning';
            scanStatus.textContent = 'User verified! Ready to take photos.';
            scanStatus.className = 'status success';
        }
    } catch (error) {
        console.error('Error processing QR code:', error);
        scanStatus.textContent = 'Invalid QR code';
        scanStatus.className = 'status error';
    }
}

// Display user information
function displayUserInfo(user) {
    document.getElementById('user-name').textContent = `${user.parentFirst} ${user.parentLast}`;
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-children').textContent = user.children || 'Not specified';
    document.getElementById('photos-remaining').textContent = 
        (user.numPhotos || 1) - (user.photosTaken || 0);
    userInfo.classList.remove('hidden');
}

// Capture photo
function capturePhoto() {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    preview.src = canvas.toDataURL('image/png');
    previewContainer.classList.remove('hidden');
    captureButton.disabled = true;
}

// Save photo to Firebase
async function savePhoto() {
    try {
        if (!currentUser) return;
        
        const photosTaken = (currentUser.photosTaken || 0) + 1;
        const db = getDatabase();
        await update(ref(db, `registrations/${currentUser.uuid}`), {
            photosTaken,
            lastPhotoAt: new Date().toISOString()
        });

        // Reset UI for next photo
        previewContainer.classList.add('hidden');
        if (photosTaken < (currentUser.numPhotos || 1)) {
            captureButton.disabled = false;
            document.getElementById('photos-remaining').textContent = 
                (currentUser.numPhotos || 1) - photosTaken;
        } else {
            scanStatus.textContent = 'All photos taken! Scan new QR code.';
            currentUser = null;
            scanning = true;
            scanQRCode();
        }
    } catch (error) {
        console.error('Error saving photo:', error);
        scanStatus.textContent = 'Error saving photo: ' + error.message;
        scanStatus.className = 'status error';
    }
}

// Event Listeners
startButton.addEventListener('click', () => {
    if (currentStream) {
        scanning = false;
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
        startButton.textContent = 'Start Camera';
        captureButton.disabled = true;
    } else {
        startCamera();
    }
});

cameraSelect.addEventListener('change', startCamera);
captureButton.addEventListener('click', capturePhoto);
retakeButton.addEventListener('click', () => {
    previewContainer.classList.add('hidden');
    captureButton.disabled = false;
});
saveButton.addEventListener('click', savePhoto);

// Initialize on page load
initializeCamera();