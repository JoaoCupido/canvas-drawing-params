// CameraCanvasManager.js

class CameraCanvasManager {
    constructor() {
        this.urlParams = new URLSearchParams(window.location.search);
        this.video = document.getElementById('cameraFeed');

        // Parameters
        this.gamemode = this.urlParams.get('gamemode') || 'detectObject'; // detectObject or detectFaceEmotion
        this.cameraFacing = this.urlParams.get('cameraFacing') || 'user'; // user or environment
        this.debug = this.urlParams.get('debug') === 'true';
        this.sensitivity = parseFloat(this.urlParams.get('sensitivity')) || 0.5;

        this.init();
    }

    async init() {
        this.setupCanvas();
        await this.setupCamera();
        this.setupEventListeners();
        this.startRendering();
    }

    setupCanvas() {
        this.canvas = document.getElementById('overlayCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    async setupCamera() {
        try {
            console.log(navigator.mediaDevices)
            console.log(navigator.mediaDevices.getUserMedia)
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: { facingMode: this.cameraFacing }
            })

            console.log("2")
            this.video.srcObject = mediaStream
        } catch (err) {
            console.error("Camera access failed:", err);
        }
    }

    setupEventListeners() {
        // Optional: click or touch events if gamemode supports interactions
        this.canvas.addEventListener('click', (e) => {
            if (this.debug) console.log('Canvas clicked:', e.clientX, e.clientY);
        });
    }

    startRendering() {
        const renderLoop = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            if (this.video && this.video.readyState >= 2) {
                // Draw video frame
                this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

                // Example: overlay based on gamemode
                if (this.gamemode === 'detectObject') {
                    this.renderObjectDetectionOverlay();
                } else if (this.gamemode === 'detectFaceEmotion') {
                    this.renderFaceEmotionOverlay();
                }
            }

            requestAnimationFrame(renderLoop);
        };

        renderLoop();
    }

    renderObjectDetectionOverlay() {
        // Placeholder: simple box for debug
        if (this.debug) {
            this.ctx.strokeStyle = 'red';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(50, 50, 100, 100);
        }
    }

    renderFaceEmotionOverlay() {
        // Placeholder: simple circle for debug
        if (this.debug) {
            this.ctx.strokeStyle = 'green';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, 50, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CameraCanvasManager();
});
