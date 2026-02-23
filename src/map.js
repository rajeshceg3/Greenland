import { state } from './state.js';
import { locations } from './data.js';
import { updateGlassPanel, showGlassPanel, hideGlassPanel } from './ui.js';

let map;
let insightLayer;

export function resetMapState() {
    map = null;
    insightLayer = null;
}

export function initMap() {
    const mapContainer = document.getElementById('map');
    const insightToggle = document.getElementById('insight-toggle');

    mapContainer.classList.add('visible');
    insightToggle.classList.remove('hidden');

    // Initialize Leaflet Map
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false,
        minZoom: 3
    }).setView([68.0, -40.0], 4);

    // Custom Tile Layer
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

    // Add map click listener to close panel
    map.on('click', handleMapClick);
}

function handleMapClick() {
     hideGlassPanel();
     map.off('click', handleMapClick);
     state.selectedLocation = null;
}

export function activateInsightMode() {
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

export function deactivateInsightMode() {
    if (insightLayer) {
        map.removeLayer(insightLayer);
    }

    // Reset map filter
    gsap.to('#map', { filter: 'saturate(0.8) brightness(0.9)', duration: 1 });
}
