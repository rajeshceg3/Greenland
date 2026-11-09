import fs from 'fs';
test('OSM normal endpoint, visible licence credit, no old keyless provider',()=>{
 const map=fs.readFileSync('src/map.js','utf8');const html=fs.readFileSync('index.html','utf8');const css=fs.readFileSync('styles.css','utf8');const sw=fs.readFileSync('service-worker.js','utf8');
 expect(map).toContain('https://tile.openstreetmap.org/{z}/{x}/{y}.png');expect(map).not.toContain('cartocdn.com');expect(html).toContain('id="map-credit"');expect(html).toContain('https://www.openstreetmap.org/copyright');expect(css).toContain('.map-credit');expect(sw).toContain('kalaallit-map-v2');expect(sw).not.toContain('tile.openstreetmap.org');expect(sw).not.toContain('no-cache');
});
test('marker effects leave Leaflet root translation alone',()=>{
 const map=fs.readFileSync('src/map.js','utf8');const css=fs.readFileSync('styles.css','utf8');expect(map).toContain("el.querySelector('.marker-core')");expect(map).not.toContain('markerElements.push(el)');expect(css).not.toMatch(/\.custom-marker:hover\s*\{[^}]*transform:/);
});
