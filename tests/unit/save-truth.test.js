const fs = require('fs');
test('save action never claims a record was stored before persistence exists', () => {
 const html=fs.readFileSync('index.html','utf8');const js=fs.readFileSync('src/ui.js','utf8');
 expect(html).toContain('id="save-status" role="status"');
 expect(html).toContain('Favorites are not saved here yet.');
 expect(js).toContain('Nothing was saved. Favorites are not available here yet.');
 expect(js).not.toContain('alert("Location saved to favorites.")');
});
