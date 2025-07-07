const fs = require('fs');
const path = require('path');

// File where uploads will be saved
const uploadsFile = path.join(__dirname, 'uploads.json');

// Load uploads from file (or start empty)
let uploads = [];
if (fs.existsSync(uploadsFile)) {
  try {
    const data = fs.readFileSync(uploadsFile, 'utf-8');
    uploads = JSON.parse(data);
  } catch (err) {
    console.error('❌ Failed to read uploads.json:', err);
  }
}

// Save uploads to file
function saveUploads() {
  try {
    fs.writeFileSync(uploadsFile, JSON.stringify(uploads, null, 2));
    console.log('✅ uploads.json updated');
  } catch (err) {
    console.error('❌ Failed to save uploads.json:', err);
  }
}

module.exports = {
  uploads,
  saveUploads
};
