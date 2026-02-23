import { state } from '../../src/state.js';

describe('State Management', () => {
    beforeEach(() => {
        state.isMapVisible = false;
        state.selectedLocation = null;
        state.isDetailModalOpen = false;
        state.isInsightActive = false;
    });

    test('Initial state is correct', () => {
        expect(state.isMapVisible).toBe(false);
        expect(state.selectedLocation).toBe(null);
        expect(state.isDetailModalOpen).toBe(false);
        expect(state.isInsightActive).toBe(false);
    });

    test('State is mutable', () => {
        state.isMapVisible = true;
        expect(state.isMapVisible).toBe(true);
    });
});
