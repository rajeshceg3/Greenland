import { state } from './state.js';
import { locations } from './data.js';

let map;
let insightLayer;
let routeLayer;
let onLocationSelectCallback;

export function resetMapState() {
    map = null;
    insightLayer = null;
    routeLayer = null;
    onLocationSelectCallback = null;
}

export function initMap(onLocationSelect) {
    onLocationSelectCallback = onLocationSelect;
    const mapContainer = document.getElementById('map');
    const insightToggle = document.getElementById('insight-toggle');

    if (mapContainer) mapContainer.classList.add('visible');
    if (insightToggle) insightToggle.classList.remove('hidden');

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
    const markerElements = [];
    locations.forEach(loc => {
        const marker = L.marker(loc.coords, {
            icon: L.divIcon({
                className: 'custom-marker',
                html: `<div class="marker-pulse"></div><div class="marker-core"></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            }),
            opacity: 0 // Start hidden
        }).addTo(map);

        const el = marker.getElement();
        if (el) {
            markerElements.push(el);
        }

        marker.on('click', () => {
            handleMarkerClick(loc, marker);
        });
    });

    // Stagger fade-in animation
    if (markerElements.length > 0) {
        gsap.to(markerElements, {
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out"
        });
    }
}

function handleMarkerClick(location, marker) {
    state.selectedLocation = location;

    // Zoom to location
    map.flyTo(location.coords, 8, {
        duration: 1.5,
        easeLinearity: 0.25
    });

    // Notify UI
    if (onLocationSelectCallback) {
        onLocationSelectCallback(location);
    }

    // Add map click listener to close panel
    map.on('click', handleMapClick);
}

function handleMapClick() {
     // Notify UI to close
     if (onLocationSelectCallback) {
        onLocationSelectCallback(null);
     }

     map.off('click', handleMapClick);
     state.selectedLocation = null;
}

const baseIceCoords = [
    [78, -50], [75, -55], [72, -58], [69, -55], [66, -50],
    [63, -45], [63, -40], [66, -35], [69, -30], [72, -25],
    [75, -20], [78, -25]
];

export function activateInsightMode() {
    updateInsightLayer(2023); // Default to current year

    // Animate map filter
    gsap.to('#map', { filter: 'saturate(1.2) contrast(1.1) hue-rotate(180deg)', duration: 1 });
}

export function deactivateInsightMode() {
    if (insightLayer) {
        map.removeLayer(insightLayer);
        insightLayer = null;
    }

    // Reset map filter
    gsap.to('#map', { filter: 'saturate(0.8) brightness(0.9)', duration: 1 });
}

export function updateInsightLayer(year) {
    if (!map) return;

    // Calculate shrinkage factor based on year (1900-2100)
    // 1900: 1.15 (larger)
    // 2023: 1.0 (base)
    // 2100: 0.8 (smaller)
    const factor = 1.15 - ((year - 1900) / 200) * 0.45;

    // Center of the ice sheet approx [72, -40]
    const center = [72, -40];

    const currentCoords = baseIceCoords.map(coord => {
        const lat = center[0] + (coord[0] - center[0]) * factor;
        const lng = center[1] + (coord[1] - center[1]) * factor;
        return [lat, lng];
    });

    if (!insightLayer) {
        insightLayer = L.polygon(currentCoords, {
            color: '#66FFCC',
            fillColor: '#66FFCC',
            fillOpacity: 0.3,
            weight: 2,
            dashArray: '5, 10'
        }).addTo(map);
    } else {
        insightLayer.setLatLngs(currentCoords);
        if (!map.hasLayer(insightLayer)) {
            insightLayer.addTo(map);
        }
    }
}

const startLocation = [67.0086, -50.6892]; // Kangerlussuaq

export function drawRoute(destinationCoords) {
    if (!map) {
        return;
    }

    if (routeLayer) {
        map.removeLayer(routeLayer);
    }

    // Simple midpoint offset for curve
    const lat1 = startLocation[0];
    const lng1 = startLocation[1];
    const lat2 = destinationCoords[0];
    const lng2 = destinationCoords[1];

    const midLat = (lat1 + lat2) / 2 + (Math.abs(lng1 - lng2) * 0.1); // Arc relative to distance
    const midLng = (lng1 + lng2) / 2;

    // Use more points for smoother curve
    const curvePoints = [];
    for(let t = 0; t <= 1; t += 0.1) {
        // Quadratic Bezier
        const lat = (1-t)*(1-t)*lat1 + 2*(1-t)*t*midLat + t*t*lat2;
        const lng = (1-t)*(1-t)*lng1 + 2*(1-t)*t*midLng + t*t*lng2;
        curvePoints.push([lat, lng]);
    }

    routeLayer = L.polyline(curvePoints, {
        color: '#66FFCC', // Aurora accent
        weight: 3,
        opacity: 0.8,
        dashArray: '10, 10',
        lineCap: 'round',
        className: 'animated-route'
    }).addTo(map);

    map.fitBounds(routeLayer.getBounds(), { padding: [100, 100] });
}

export function clearRoute() {
    if (routeLayer && map) {
        map.removeLayer(routeLayer);
        routeLayer = null;
    }
}
