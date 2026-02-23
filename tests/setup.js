// Mock Canvas
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    fillStyle: '',
}));

// Mock requestAnimationFrame to avoid infinite loops in tests
global.requestAnimationFrame = jest.fn();

global.L = {
    map: jest.fn(() => ({
        setView: jest.fn().mockReturnThis(),
        addLayer: jest.fn().mockReturnThis(),
        removeLayer: jest.fn().mockReturnThis(),
        flyTo: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
    })),
    tileLayer: jest.fn(() => ({
        addTo: jest.fn().mockReturnThis(),
    })),
    marker: jest.fn(() => ({
        addTo: jest.fn().mockReturnThis(),
        bindPopup: jest.fn().mockReturnThis(),
        on: jest.fn(),
    })),
    divIcon: jest.fn(),
    polygon: jest.fn(() => ({
        addTo: jest.fn().mockReturnThis(),
    })),
};

global.gsap = {
    to: jest.fn((target, config) => {
        if (config.onComplete) config.onComplete();
    }),
};
