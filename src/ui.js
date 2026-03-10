import { state } from './state.js';
import { initMap, activateInsightMode, deactivateInsightMode, updateInsightLayer, drawRoute } from './map.js';
import { playWind, pauseWind } from './audio.js';

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
    initAuroraToggle();
    initAudioToggle();
    initSlider();
    initGestures();
}

function initLanding() {
    initSnow();

    enterBtn.addEventListener('click', () => {
        // Parallax and fade out landing, while fading in map
        gsap.to(landingScreen, {
            opacity: 0,
            scale: 1.1,
            duration: 2.5,
            ease: "power3.inOut",
            onComplete: () => {
                landingScreen.style.display = 'none';
            }
        });

        const mapElement = document.getElementById('map');
        gsap.fromTo(mapElement,
            { scale: 0.95, opacity: 0 },
            { scale: 1, opacity: 1, duration: 1.5, ease: "power2.out", delay: 0.2 }
        );

        setTimeout(() => {
            initMap(handleLocationSelect);

            // Show toggles smoothly
            const controlsContainer = document.getElementById('controls-container');
            if (controlsContainer) {
                controlsContainer.classList.remove('hidden');
                gsap.fromTo(controlsContainer, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.5 });
            }

            const toggles = [
                document.getElementById('insight-toggle'),
                document.getElementById('aurora-toggle'),
                document.getElementById('sound-toggle')
            ];

            toggles.forEach((t) => {
                if(t) {
                    t.classList.remove('hidden');
                }
            });

            // Automatically start sound
            const soundToggle = document.getElementById('sound-toggle');
            if (soundToggle) {
                playWind();
                soundToggle.textContent = "🔊 On";
                soundToggle.classList.add('active');
            }

        }, 500); // Wait a bit for the transition to feel right
    });
}

function handleLocationSelect(location) {
    if (location) {
        updateGlassPanel(location);
        showGlassPanel();
    } else {
        hideGlassPanel();
    }
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

    const imageEl = document.querySelector('.panel-image');
    if (imageEl && location.image) {
        imageEl.style.backgroundImage = `url('${location.image}')`;
    }
}

export function showGlassPanel() {
    const panelImage = document.querySelector('.panel-image');
    if (panelImage) {
        gsap.fromTo(panelImage,
            { scale: 1.05, opacity: 0 },
            { scale: 1, opacity: 1, duration: 1.5, ease: "power2.out" }
        );
    }
    glassPanel.classList.remove('hidden');
}

export function hideGlassPanel() {
    glassPanel.classList.add('hidden');
}

function initPanelActions() {
    document.getElementById('explore-btn').addEventListener('click', () => {
        if (navigator.vibrate) navigator.vibrate(20);
        if (state.selectedLocation) {
            showDetailModal(state.selectedLocation);
        }
    });

    document.getElementById('route-btn').addEventListener('click', () => {
        if (navigator.vibrate) navigator.vibrate(20);
        if (state.selectedLocation) {
            drawRoute(state.selectedLocation.coords);
        }
    });

    document.getElementById('save-btn').addEventListener('click', () => {
        if (navigator.vibrate) navigator.vibrate(50);
        alert("Location saved to favorites.");
    });
}

function initModalActions() {
    document.getElementById('close-modal').addEventListener('click', () => {
        if (navigator.vibrate) navigator.vibrate(20);
        state.isDetailModalOpen = false;
        detailModal.classList.add('hidden');
    });

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (navigator.vibrate) navigator.vibrate(10);
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
            gsap.fromTo(sliderContainer, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 });
        } else {
            insightToggle.classList.remove('active');
            insightToggle.textContent = "❄️ Insight";
            deactivateInsightMode();
            gsap.to(sliderContainer, { opacity: 0, y: 20, duration: 0.3, onComplete: () => sliderContainer.classList.add('hidden') });
        }
    });
}

function initAuroraToggle() {
    const auroraToggle = document.getElementById('aurora-toggle');
    const auroraPanel = document.getElementById('aurora-panel');
    let isAuroraActive = false;

    if (auroraToggle && auroraPanel) {
        auroraToggle.addEventListener('click', () => {
            isAuroraActive = !isAuroraActive;

            if (isAuroraActive) {
                auroraToggle.classList.add('active');
                auroraToggle.textContent = "✨ Active";
                auroraPanel.classList.remove('hidden');
                setTimeout(() => auroraPanel.classList.add('visible'), 10);

                // Fetch mock or real data
                updateAuroraData();
            } else {
                auroraToggle.classList.remove('active');
                auroraToggle.textContent = "✨ Aurora";
                auroraPanel.classList.remove('visible');
                setTimeout(() => auroraPanel.classList.add('hidden'), 500); // match CSS transition
            }
        });
    }
}

async function updateAuroraData() {
    const kpElement = document.getElementById('aurora-kp');
    const statusElement = document.getElementById('aurora-status');
    const timeElement = document.getElementById('aurora-time');

    // Simulating a fetch with a slight delay for realistic UX
    kpElement.textContent = "Kp ...";
    statusElement.textContent = "Scanning...";

    setTimeout(() => {
        const mockKp = (Math.random() * 4 + 2).toFixed(1); // Random Kp between 2.0 and 6.0
        kpElement.textContent = `Kp ${mockKp}`;

        if (mockKp > 5) {
            statusElement.textContent = "Storming";
            statusElement.style.color = "#FF6666";
        } else if (mockKp > 3) {
            statusElement.textContent = "Active";
            statusElement.style.color = "#66FFCC";
        } else {
            statusElement.textContent = "Quiet";
            statusElement.style.color = "#9BBED2";
        }

        timeElement.textContent = `Updated: ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    }, 800);
}

function initAudioToggle() {
    const toggle = document.getElementById('sound-toggle');

    toggle.addEventListener('click', () => {
        if (!toggle.classList.contains('active')) {
            playWind();
            toggle.textContent = "🔊 On";
            toggle.classList.add('active');
        } else {
            pauseWind();
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
            const year = parseInt(e.target.value);
            display.textContent = year;
            updateInsightLayer(year);
        });
    }
}

function initGestures() {
    let startY = 0;
    let currentY = 0;

    glassPanel.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        glassPanel.style.transition = 'none';
    }, { passive: true });

    glassPanel.addEventListener('touchmove', (e) => {
        currentY = e.touches[0].clientY;
        const diff = currentY - startY;

        if (diff > 0) {
            glassPanel.style.transform = `translateY(${diff}px)`;
        }
    }, { passive: true });

    glassPanel.addEventListener('touchend', (e) => {
        glassPanel.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        const diff = currentY - startY;

        if (diff > 100) {
            hideGlassPanel();
            glassPanel.style.transform = '';
        } else {
            glassPanel.style.transform = '';
        }
        startY = 0;
        currentY = 0;
    });

    // Pinch to close modal
    let initialPinchDistance = 0;

    detailModal.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            initialPinchDistance = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
        }
    }, { passive: true });

    detailModal.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && initialPinchDistance > 0) {
            const currentDistance = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );

            if (currentDistance < initialPinchDistance * 0.7) { // 30% pinch
                // Close modal
                document.getElementById('close-modal').click();
                initialPinchDistance = 0; // Reset
            }
        }
    }, { passive: true });
}
