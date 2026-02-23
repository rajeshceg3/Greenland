// app.js

// State
const state = {
    isMapVisible: false,
    selectedLocation: null,
    isDetailModalOpen: false,
    isInsightActive: false
};

// Elements
const landingScreen = document.getElementById('landing-screen');
const enterBtn = document.getElementById('enter-btn');
const snowCanvas = document.getElementById('snow-canvas');
const mapContainer = document.getElementById('map');
const glassPanel = document.getElementById('glass-panel');
const detailModal = document.getElementById('detail-modal');
const insightToggle = document.getElementById('insight-toggle');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initLanding();
});

// Landing Page Logic
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
            }
        });
    });
}

// Snow Animation
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

// Map Initialization
let map;
const locations = [
    {
        id: 'nuuk',
        name: "Nuuk",
        coords: [64.1835, -51.7216],
        desc: "The vibrant heart of Greenland, where ancient tradition meets modern Arctic living.",
        details: {
            overview: "Nuuk is the capital and largest city of Greenland. It is the seat of government and the country's largest cultural and economic center.",
            history: "Founded in 1728 by the Dano-Norwegian missionary Hans Egede, Nuuk has a rich history as a trading post and administrative center.",
            climate: "Nuuk has a maritime-influenced tundra climate with cold, snowy winters and cool summers."
        }
    },
    {
        id: 'ilulissat',
        name: "Ilulissat Icefjord",
        coords: [69.2198, -51.0986],
        desc: "Where ice breathes into the sea. A UNESCO World Heritage site of colossal icebergs.",
        details: {
            overview: "Ilulissat Icefjord is a fjord in western Greenland. It was declared a UNESCO World Heritage Site in 2004.",
            history: "The area has been inhabited for thousands of years. The town of Ilulissat was founded as Jakobshavn in 1741.",
            climate: "Ilulissat has a tundra climate. The icefjord is filled with icebergs calved from the Sermeq Kujalleq glacier."
        }
    },
    {
        id: 'scoresby',
        name: "Scoresby Sund",
        coords: [70.4833, -21.9667],
        desc: "The largest fjord system in the world, a labyrinth of ice and mountains.",
        details: {
            overview: "Scoresby Sund is a large fjord system on the eastern coast of Greenland. It is the largest and longest fjord system in the world.",
            history: "Named after William Scoresby, who mapped the area in 1822. It is very remote and sparsely populated.",
            climate: "High Arctic climate with severe winters and very short, cool summers."
        }
    }
];

function initMap() {
    mapContainer.classList.add('visible');
    insightToggle.classList.remove('hidden');

    // Initialize Leaflet Map
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false,
        minZoom: 3
    }).setView([68.0, -40.0], 4);

    // Custom Tile Layer (CartoDB Positron for desaturated look)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // Add Markers
    locations.forEach(loc => {
        const marker = L.marker(loc.coords, {
            icon: L.divIcon({
                className: 'custom-marker',
                html: `<div class="marker-pulse"></div><div class="marker-core"></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            })
        }).addTo(map);

        marker.on('click', () => {
            handleMarkerClick(loc, marker);
        });
    });

    // Add Zoom Control manually if needed, or rely on gestures
    // L.control.zoom({ position: 'bottomright' }).addTo(map);
}

function handleMarkerClick(location, marker) {
    state.selectedLocation = location;

    // Zoom to location
    map.flyTo(location.coords, 8, {
        duration: 1.5,
        easeLinearity: 0.25
    });

    // Show Glass Panel
    updateGlassPanel(location);
    showGlassPanel();
}

function updateGlassPanel(location) {
    document.getElementById('location-title').textContent = location.name;
    document.getElementById('location-desc').textContent = location.desc;
}

function showGlassPanel() {
    glassPanel.classList.remove('hidden');
    // Add map click listener to close panel
    map.on('click', hideGlassPanel);
}

function hideGlassPanel() {
    glassPanel.classList.add('hidden');
    map.off('click', hideGlassPanel);
    state.selectedLocation = null;
}

// Panel Actions
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

// Detail Modal Logic
function showDetailModal(location) {
    state.isDetailModalOpen = true;
    document.getElementById('modal-title').textContent = location.name;

    // Reset to first tab
    switchTab('overview');

    detailModal.classList.remove('hidden');
}

document.getElementById('close-modal').addEventListener('click', () => {
    state.isDetailModalOpen = false;
    detailModal.classList.add('hidden');
});

// Tab Navigation
const tabBtns = document.querySelectorAll('.tab-btn');
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        switchTab(tabName);
    });
});

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
    const tabContent = document.getElementById('tab-content');

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

// Environmental Insight Mode
let insightLayer;

insightToggle.addEventListener('click', () => {
    state.isInsightActive = !state.isInsightActive;

    if (state.isInsightActive) {
        insightToggle.classList.add('active');
        insightToggle.textContent = "❄️ Active";
        activateInsightMode();
    } else {
        insightToggle.classList.remove('active');
        insightToggle.textContent = "❄️ Insight";
        deactivateInsightMode();
    }
});

function activateInsightMode() {
    // Add a dummy heat/ice layer
    if (!insightLayer) {
        const iceCoords = [
            [75, -45],
            [70, -50],
            [65, -45],
            [65, -40],
            [70, -35],
            [75, -30]
        ];

        insightLayer = L.polygon(iceCoords, {
            color: '#66FFCC',
            fillColor: '#66FFCC',
            fillOpacity: 0.3,
            weight: 2,
            dashArray: '5, 10'
        });
    }

    insightLayer.addTo(map);

    // Animate map filter
    gsap.to('#map', { filter: 'saturate(1.2) contrast(1.1) hue-rotate(180deg)', duration: 1 });
}

function deactivateInsightMode() {
    if (insightLayer) {
        map.removeLayer(insightLayer);
    }

    // Reset map filter
    gsap.to('#map', { filter: 'saturate(0.8) brightness(0.9)', duration: 1 });
}
