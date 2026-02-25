import { playWind, pauseWind, _resetAudioState } from '../../src/audio.js';
import { updateInsightLayer, drawRoute, initMap, resetMapState } from '../../src/map.js';
import { initUI } from '../../src/ui.js';

jest.mock('../../src/state.js', () => ({
    state: {
        selectedLocation: null
    }
}));

describe('Coverage Improvements', () => {

    describe('Audio.js', () => {
        let audioCtxMock;
        let gainNodeMock;
        let noiseNodeMock;
        let lfoMock;

        beforeEach(() => {
            jest.useFakeTimers();
            _resetAudioState();

            gainNodeMock = {
                gain: {
                    value: 0,
                    linearRampToValueAtTime: jest.fn()
                },
                connect: jest.fn()
            };

            lfoMock = {
                frequency: { value: 0 },
                connect: jest.fn(),
                start: jest.fn(),
                stop: jest.fn()
            };

            noiseNodeMock = {
                buffer: null,
                loop: false,
                connect: jest.fn(),
                start: jest.fn(),
                stop: jest.fn(),
                disconnect: jest.fn(),
                stopLFO: null
            };

            audioCtxMock = {
                state: 'running', // Default running
                resume: jest.fn(),
                createBuffer: jest.fn().mockReturnValue({
                    getChannelData: jest.fn().mockReturnValue(new Float32Array(100))
                }),
                createBufferSource: jest.fn().mockReturnValue(noiseNodeMock),
                createBiquadFilter: jest.fn().mockReturnValue({
                    frequency: { value: 0 },
                    Q: { value: 0 },
                    connect: jest.fn()
                }),
                createOscillator: jest.fn().mockReturnValue(lfoMock),
                createGain: jest.fn().mockReturnValue(gainNodeMock),
                destination: {},
                sampleRate: 44100,
                currentTime: 0
            };

            window.AudioContext = jest.fn().mockImplementation(() => audioCtxMock);
            window.webkitAudioContext = jest.fn().mockImplementation(() => audioCtxMock);
        });

        afterEach(() => {
            jest.runAllTimers();
            jest.useRealTimers();
        });

        test('playWind creates context if missing', () => {
            // Context is missing initially (handled by _resetAudioState)
            playWind();
            expect(window.AudioContext).toHaveBeenCalled();
            expect(audioCtxMock.createBufferSource).toHaveBeenCalled();
        });

        test('playWind resumes context if suspended', () => {
            audioCtxMock.state = 'suspended';
            playWind();
            expect(audioCtxMock.resume).toHaveBeenCalled();
        });

        test('pauseWind cleans up after timeout', () => {
            playWind();
            pauseWind();

            expect(gainNodeMock.gain.linearRampToValueAtTime).toHaveBeenCalled();

            jest.runAllTimers();

            expect(noiseNodeMock.stop).toHaveBeenCalled();
            expect(noiseNodeMock.disconnect).toHaveBeenCalled();
            expect(lfoMock.stop).toHaveBeenCalled();
        });
    });

    describe('Map.js', () => {
        beforeEach(() => {
            jest.clearAllMocks(); // Clear mocks to ensure L.map results are fresh
            document.body.innerHTML = `
                <div id="map"></div>
                <button id="insight-toggle" class="hidden"></button>
            `;
            resetMapState();
            initMap();
        });

        test('updateInsightLayer updates existing layer', () => {
            const mapMock = L.map.mock.results[0].value;
            mapMock.hasLayer = jest.fn().mockReturnValue(false);

            updateInsightLayer(2023);
            const initialLayer = L.polygon.mock.results[0].value;
            expect(initialLayer.addTo).toHaveBeenCalledWith(mapMock);

            mapMock.hasLayer = jest.fn().mockReturnValue(true);
            updateInsightLayer(2050);
            expect(initialLayer.setLatLngs).toHaveBeenCalled();

            mapMock.hasLayer = jest.fn().mockReturnValue(false);
            updateInsightLayer(2080);
            expect(initialLayer.addTo).toHaveBeenCalledWith(mapMock);
        });

        test('drawRoute removes existing layer', () => {
            const mapMock = L.map.mock.results[0].value;
            L.polyline.mockClear();

            // 1. Draw first route
            drawRoute([70, -40]);

            expect(L.polyline).toHaveBeenCalledTimes(1);
            // Capture the exact object returned by the mock
            const firstRouteLayer = L.polyline.mock.results[0].value;

            // 2. Draw second route
            drawRoute([75, -45]);

            expect(L.polyline).toHaveBeenCalledTimes(2);
            expect(mapMock.removeLayer).toHaveBeenCalledWith(firstRouteLayer);
        });
    });

    describe('UI.js', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <div id="landing-screen"></div>
                <button id="enter-btn"></button>
                <canvas id="snow-canvas"></canvas>
                <div id="glass-panel" class="hidden"></div>
                <div id="detail-modal" class="hidden"><button id="close-modal"></button></div>
                <button id="insight-toggle"></button>
                <button id="sound-toggle"></button>
                <div id="insight-slider-container">
                    <input type="range" id="year-slider">
                    <span id="year-display"></span>
                </div>
                <div class="panel-actions">
                     <button id="explore-btn"></button>
                     <button id="route-btn"></button>
                     <button id="save-btn"></button>
                </div>
                <div class="tabs">
                    <button class="tab-btn" data-tab="overview"></button>
                </div>
                <div id="tab-content"></div>
            `;
        });

        test('initGestures handles touch events correctly', () => {
            initUI();
            const glassPanel = document.getElementById('glass-panel');
            glassPanel.style.transform = '';
            glassPanel.style.transition = '';

            const touchStartEvent = new Event('touchstart');
            touchStartEvent.touches = [{ clientY: 100 }];
            glassPanel.dispatchEvent(touchStartEvent);
            expect(glassPanel.style.transition).toBe('none');

            const touchMoveEvent = new Event('touchmove');
            touchMoveEvent.touches = [{ clientY: 150 }];
            glassPanel.dispatchEvent(touchMoveEvent);
            expect(glassPanel.style.transform).toBe('translateY(50px)');

            const touchEndEvent = new Event('touchend');
            glassPanel.dispatchEvent(touchEndEvent);
            expect(glassPanel.style.transform).toBe('');

            glassPanel.dispatchEvent(touchStartEvent);
            const touchMoveEventBig = new Event('touchmove');
            touchMoveEventBig.touches = [{ clientY: 250 }];
            glassPanel.dispatchEvent(touchMoveEventBig);

            const touchEndEventBig = new Event('touchend');
            glassPanel.dispatchEvent(touchEndEventBig);

            expect(glassPanel.classList.contains('hidden')).toBe(true);
        });

        test('initSlider handles missing elements gracefully', () => {
             document.getElementById('insight-slider-container').innerHTML = '';
             expect(() => initUI()).not.toThrow();
        });
    });
});
