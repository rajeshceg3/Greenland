import { locations } from '../../src/data.js';

describe('Location Data', () => {
    test('Contains correct number of locations', () => {
        expect(locations.length).toBe(3);
    });

    test('Each location has required fields', () => {
        locations.forEach(loc => {
            expect(loc).toHaveProperty('id');
            expect(loc).toHaveProperty('name');
            expect(loc).toHaveProperty('coords');
            expect(loc).toHaveProperty('desc');
            expect(loc).toHaveProperty('details');
        });
    });

    test('Coordinates are valid', () => {
        locations.forEach(loc => {
            expect(Array.isArray(loc.coords)).toBe(true);
            expect(loc.coords.length).toBe(2);
            expect(typeof loc.coords[0]).toBe('number');
            expect(typeof loc.coords[1]).toBe('number');
        });
    });
});
