import { initMap, resetMapState, deactivateInsightMode } from '../../src/map.js';
import { initUI, switchTab } from '../../src/ui.js';
import { state } from '../../src/state.js';
import { locations } from '../../src/data.js';

describe('Map and UI Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        resetMapState();

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

    test('Route and Save buttons trigger alerts', () => {
        global.alert = jest.fn();

        document.getElementById('route-btn').click();
        expect(global.alert).toHaveBeenCalledWith(expect.stringContaining("Route"));

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

    test('Activating insight mode twice reuses layer', () => {
        initMap();
        const toggle = document.getElementById('insight-toggle');

        toggle.click(); // Activate
        toggle.click(); // Deactivate
        toggle.click(); // Reactivate - should reuse layer

        expect(state.isInsightActive).toBe(true);
        expect(L.polygon).toHaveBeenCalledTimes(1);
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

    test('Audio toggle does nothing if no source', () => {
        const toggle = document.getElementById('sound-toggle');
        const audio = document.getElementById('ambient-audio');

        // Ensure no src
        Object.defineProperty(audio, 'currentSrc', { value: '', writable: true });
        Object.defineProperty(audio, 'src', { value: '', writable: true });

        console.log = jest.fn();

        toggle.click();

        expect(console.log).toHaveBeenCalledWith("No audio source available.");
        expect(audio.play).not.toHaveBeenCalled();
    });

    test('Audio toggle plays and pauses audio', () => {
        const toggle = document.getElementById('sound-toggle');
        const audio = document.getElementById('ambient-audio');

        // Mock src
        Object.defineProperty(audio, 'currentSrc', { value: 'http://example.com/audio.mp3', writable: true });

        // Test Play
        Object.defineProperty(audio, 'paused', { value: true, writable: true });
        toggle.click();

        expect(audio.play).toHaveBeenCalled();
        expect(toggle.classList.contains('active')).toBe(true);

        // Test Pause
        Object.defineProperty(audio, 'paused', { value: false, writable: true });
        toggle.click();

        expect(audio.pause).toHaveBeenCalled();
        expect(toggle.classList.contains('active')).toBe(false);
    });

    test('Slider input updates display', () => {
        const slider = document.getElementById('year-slider');
        const display = document.getElementById('year-display');

        console.log = jest.fn();

        slider.value = 2050;
        slider.dispatchEvent(new Event('input'));

        expect(display.textContent).toBe('2050');
        expect(console.log).toHaveBeenCalledWith("Year changed to:", "2050");
    });
});
