import { state } from './state.js';
import { initMap, activateInsightMode, deactivateInsightMode } from './map.js';

let landingScreen, enterBtn, snowCanvas, glassPanel, detailModal, insightToggle, tabBtns, tabContent;

export function initUI() {
    landingScreen = document.getElementById('landing-screen');
    enterBtn = document.getElementById('enter-btn');
    snowCanvas = document.getElementById('snow-canvas');
    glassPanel = document.getElementById('glass-panel');
    detailModal = document.getElementById('detail-modal');
    insightToggle = document.getElementById('insight-toggle');
    tabBtns = document.querySelectorAll('.tab-btn');
    tabContent = document.getElementById('tab-content');

    initLanding();
    initPanelActions();
    initModalActions();
    initInsightToggle();
    initAudioToggle();
    initSlider();
}

function initLanding() {
    initSnow();

    enterBtn.addEventListener('click', () => {
        // Fade out landing
        gsap.to(landingScreen, {
            opacity: 0,
            duration: 1,
            onComplete: () => {
                landingScreen.style.display = 'none';
                initMap();
                document.getElementById('sound-toggle').classList.remove('hidden');
            }
        });
    });
}

function initSnow() {
    const ctx = snowCanvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;

    snowCanvas.width = width;
    snowCanvas.height = height;

    const particles = [];
    const particleCount = 100;

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.radius = Math.random() * 2 + 1;
            this.speedY = Math.random() * 1 + 0.5;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.opacity = Math.random() * 0.5 + 0.3;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;

            if (this.y > height) {
                this.y = 0;
                this.x = Math.random() * width;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        snowCanvas.width = width;
        snowCanvas.height = height;
    });
}

export function updateGlassPanel(location) {
    document.getElementById('location-title').textContent = location.name;
    document.getElementById('location-desc').textContent = location.desc;
}

export function showGlassPanel() {
    glassPanel.classList.remove('hidden');
}

export function hideGlassPanel() {
    glassPanel.classList.add('hidden');
}

function initPanelActions() {
    document.getElementById('explore-btn').addEventListener('click', () => {
        if (state.selectedLocation) {
            showDetailModal(state.selectedLocation);
        }
    });

    document.getElementById('route-btn').addEventListener('click', () => {
        alert("Route generation not implemented in this demo.");
    });

    document.getElementById('save-btn').addEventListener('click', () => {
        alert("Location saved to favorites.");
    });
}

function initModalActions() {
    document.getElementById('close-modal').addEventListener('click', () => {
        state.isDetailModalOpen = false;
        detailModal.classList.add('hidden');
    });

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function showDetailModal(location) {
    state.isDetailModalOpen = true;
    document.getElementById('modal-title').textContent = location.name;

    // Reset to first tab
    switchTab('overview');

    detailModal.classList.remove('hidden');
}

function switchTab(tabName) {
    // Update active button
    tabBtns.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update content
    const content = state.selectedLocation ? state.selectedLocation.details[tabName] : "";

    // Simple fade transition for content
    gsap.to(tabContent, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
            tabContent.innerHTML = `<p>${content}</p>`;
            gsap.to(tabContent, { opacity: 1, duration: 0.2 });
        }
    });
}

function initInsightToggle() {
    insightToggle.addEventListener('click', () => {
        state.isInsightActive = !state.isInsightActive;
        const sliderContainer = document.getElementById('insight-slider-container');

        if (state.isInsightActive) {
            insightToggle.classList.add('active');
            insightToggle.textContent = "❄️ Active";
            activateInsightMode();
            sliderContainer.classList.remove('hidden');
        } else {
            insightToggle.classList.remove('active');
            insightToggle.textContent = "❄️ Insight";
            deactivateInsightMode();
            sliderContainer.classList.add('hidden');
        }
    });
}

function initAudioToggle() {
    const audio = document.getElementById('ambient-audio');
    const toggle = document.getElementById('sound-toggle');

    toggle.addEventListener('click', () => {
        if (!audio.currentSrc && !audio.src) {
            console.log("No audio source available.");
            return;
        }

        if (audio.paused) {
            audio.play().catch(e => console.log("Audio play failed:", e));
            toggle.textContent = "🔊 On";
            toggle.classList.add('active');
        } else {
            audio.pause();
            toggle.textContent = "🔇 Off";
            toggle.classList.remove('active');
        }
    });
}

function initSlider() {
    const slider = document.getElementById('year-slider');
    const display = document.getElementById('year-display');

    if (slider && display) {
        slider.addEventListener('input', (e) => {
            display.textContent = e.target.value;
            console.log("Year changed to:", e.target.value);
        });
    }
}
