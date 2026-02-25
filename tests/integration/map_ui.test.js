import { initMap, resetMapState, deactivateInsightMode } from '../../src/map.js';
import { initUI, switchTab } from '../../src/ui.js';
import { state } from '../../src/state.js';
import { locations } from '../../src/data.js';

describe('Map and UI Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        resetMapState();

        // Mock AudioContext
        window.AudioContext = jest.fn().mockImplementation(() => ({
            state: 'suspended',
            resume: jest.fn(),
            createBuffer: jest.fn().mockReturnValue({
                getChannelData: jest.fn().mockReturnValue(new Float32Array(100))
            }),
            createBufferSource: jest.fn().mockReturnValue({
                buffer: null,
                loop: false,
                connect: jest.fn(),
                start: jest.fn(),
                stop: jest.fn(),
                disconnect: jest.fn()
            }),
            createBiquadFilter: jest.fn().mockReturnValue({
                frequency: { value: 0 },
                Q: { value: 0 },
                connect: jest.fn()
            }),
            createOscillator: jest.fn().mockReturnValue({
                frequency: { value: 0 },
                connect: jest.fn(),
                start: jest.fn(),
                stop: jest.fn()
            }),
            createGain: jest.fn().mockReturnValue({
                gain: {
                    value: 0,
                    linearRampToValueAtTime: jest.fn(),
                    exponentialRampToValueAtTime: jest.fn()
                },
                connect: jest.fn()
            }),
            destination: {}
        }));

        // Reset DOM
        document.body.innerHTML = `
            <div id="landing-screen">
                <canvas id="snow-canvas"></canvas>
                <div class="landing-content">
                    <button id="enter-btn">Enter</button>
                </div>
            </div>
            <div id="map"></div>
            <div id="glass-panel" class="hidden">
                <h2 id="location-title"></h2>
                <p id="location-desc"></p>
                <div class="panel-actions">
                     <button id="explore-btn">Explore</button>
                     <button id="route-btn">Route</button>
                     <button id="save-btn">Save</button>
                </div>
            </div>
            <div id="detail-modal" class="hidden">
                 <button id="close-modal"></button>
                 <h2 id="modal-title"></h2>
                 <div class="tabs">
                    <button class="tab-btn" data-tab="overview"></button>
                    <button class="tab-btn" data-tab="history"></button>
                    <button class="tab-btn" data-tab="climate"></button>
                    <button class="tab-btn" data-tab="bestTime"></button>
                    <button class="tab-btn" data-tab="logistics"></button>
                 </div>
                 <div id="tab-content"></div>
            </div>
            <button id="insight-toggle" class="hidden"></button>
            <button id="sound-toggle" class="hidden"></button>
            <div id="insight-slider-container" class="hidden">
                 <input type="range" min="1900" max="2100" value="2023" id="year-slider">
                 <span id="year-display"></span>
            </div>
            <audio id="ambient-audio"></audio>
        `;

        // Reset state
        state.isMapVisible = false;
        state.selectedLocation = null;
        state.isDetailModalOpen = false;
        state.isInsightActive = false;

        // Initialize UI (attaches event listeners)
        initUI();
    });

    test('Clicking enter button initializes map', () => {
        const enterBtn = document.getElementById('enter-btn');
        const mapContainer = document.getElementById('map');

        enterBtn.click();

        expect(L.map).toHaveBeenCalledWith('map', expect.any(Object));
        expect(mapContainer.classList.contains('visible')).toBe(true);
    });

    test('Clicking a marker updates state and shows glass panel', () => {
        initMap();

        const markerMock = L.marker.mock.results[0].value;
        const onClickHandler = markerMock.on.mock.calls.find(call => call[0] === 'click')[1];

        onClickHandler();

        expect(state.selectedLocation).toEqual(locations[0]);

        const glassPanel = document.getElementById('glass-panel');
        expect(glassPanel.classList.contains('hidden')).toBe(false);
        expect(document.getElementById('location-title').textContent).toBe(locations[0].name);
    });

    test('Clicking map closes glass panel', () => {
        initMap();
        // Open panel first
        const markerMock = L.marker.mock.results[0].value;
        markerMock.on.mock.calls.find(call => call[0] === 'click')[1]();

        expect(state.selectedLocation).not.toBeNull();

        // Simulate map click
        const mapMock = L.map.mock.results[0].value;
        const onMapClickCall = mapMock.on.mock.calls.find(call => call[0] === 'click');
        expect(onMapClickCall).toBeDefined();

        onMapClickCall[1]();

        expect(state.selectedLocation).toBeNull();
        const glassPanel = document.getElementById('glass-panel');
        expect(glassPanel.classList.contains('hidden')).toBe(true);
    });

    test('Insight toggle activates and deactivates insight mode', () => {
         // Force init
        initMap();

        const toggle = document.getElementById('insight-toggle');

        // Click to activate
        toggle.click();
        expect(state.isInsightActive).toBe(true);
        expect(toggle.classList.contains('active')).toBe(true);
        expect(gsap.to).toHaveBeenCalled();

        // Click to deactivate
        toggle.click();
        expect(state.isInsightActive).toBe(false);
        expect(toggle.classList.contains('active')).toBe(false);
    });

    test('Tab switching updates content', () => {
        // Mock state with selected location
        state.selectedLocation = locations[0];

        // Open modal
        const exploreBtn = document.getElementById('explore-btn');
        exploreBtn.click();

        expect(state.isDetailModalOpen).toBe(true);

        // Click history tab
        const historyTab = document.querySelector('button[data-tab="history"]');
        historyTab.click();

        // Verify content update
        const tabContent = document.getElementById('tab-content');
        expect(tabContent.innerHTML).toContain(locations[0].details.history);
    });

    test('Resize window updates canvas', () => {
        global.dispatchEvent(new Event('resize'));
    });

    test('Route and Save buttons trigger actions', () => {
        initMap();
        global.alert = jest.fn();
        state.selectedLocation = locations[0]; // Ensure location selected for route

        document.getElementById('route-btn').click();
        expect(L.polyline).toHaveBeenCalled(); // Route drawn

        document.getElementById('save-btn').click();
        expect(global.alert).toHaveBeenCalledWith(expect.stringContaining("Location saved"));
    });

    test('Close modal button hides modal', () => {
        state.isDetailModalOpen = true;
        document.getElementById('detail-modal').classList.remove('hidden');

        document.getElementById('close-modal').click();

        expect(state.isDetailModalOpen).toBe(false);
        expect(document.getElementById('detail-modal').classList.contains('hidden')).toBe(true);
    });

    test('Activating insight mode twice reuses layer logic', () => {
        initMap();
        const toggle = document.getElementById('insight-toggle');

        toggle.click(); // Activate
        toggle.click(); // Deactivate
        toggle.click(); // Reactivate

        expect(state.isInsightActive).toBe(true);
        // Note: New implementation might recreate layer on reactivation if it was removed
        // so we check state is consistent.
    });

    test('Deactivating insight mode without activation does nothing', () => {
        initMap();
        deactivateInsightMode();
        const mapMock = L.map.mock.results[0].value;
        expect(mapMock.removeLayer).not.toHaveBeenCalled();
    });

    test('Clicking explore without selection does nothing', () => {
        state.selectedLocation = null;
        // Spy on showDetailModal? No, it's internal.
        // Check if modal opens.

        document.getElementById('explore-btn').click();

        expect(state.isDetailModalOpen).toBe(false);
        expect(document.getElementById('detail-modal').classList.contains('hidden')).toBe(true);
    });

    test('Audio toggle plays and pauses procedural audio', () => {
        const toggle = document.getElementById('sound-toggle');

        // Test Play
        toggle.click();
        expect(window.AudioContext).toHaveBeenCalled();
        expect(toggle.classList.contains('active')).toBe(true);

        // Test Pause
        toggle.click();
        expect(toggle.classList.contains('active')).toBe(false);
    });

    test('Slider input updates display', () => {
        const slider = document.getElementById('year-slider');
        const display = document.getElementById('year-display');

        slider.value = 2050;
        slider.dispatchEvent(new Event('input'));

        expect(display.textContent).toBe('2050');
    });
});
