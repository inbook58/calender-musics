
import bwipjs from 'bwip-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Since we are in an ES module, __dirname is not available.
// We can create it from import.meta.url.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths relative to the script location
const projectRoot = path.resolve(__dirname, '..');
const songsFilePath = path.resolve(projectRoot, 'src/data/songs.json');
const outputDir = path.resolve(projectRoot, 'public/qr-codes');

// 1. Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Created directory: ${outputDir}`);
}

// 2. Read the songs data
let songs;
try {
  const songsData = fs.readFileSync(songsFilePath, 'utf-8');
  songs = JSON.parse(songsData);
} catch (err) {
  console.error(`Error reading or parsing ${songsFilePath}:`, err);
  process.exit(1);
}

// 3. Generate a QR code for each song
const generationPromises = songs.map(song => {
  if (!song.shareId) {
    console.warn(`Song with id ${song.id} is missing a shareId. Skipping.`);
    return Promise.resolve(); // Resolve immediately to not block others
  }

  return new Promise((resolve, reject) => {
    bwipjs.toBuffer({
      bcid: 'azteccode',      // Barcode type
      text: song.shareId,     // Text to encode
      scale: 6,               // 5x scaling factor
      layers: 1,              // Force a fixed number of layers for uniform size
      includetext: false,     // Don't include human-readable text
      textxalign: 'center',   // Always good to set this
    }, (err, png) => {
      if (err) {
        console.error(`Error generating Aztec code for shareId ${song.shareId}:`, err);
        reject(err);
      } else {
        const outputPath = path.resolve(outputDir, `${song.id}.png`);
        fs.writeFile(outputPath, png, (writeErr) => {
          if (writeErr) {
            console.error(`Error writing file ${outputPath}:`, writeErr);
            reject(writeErr);
          } else {
            console.log(`Successfully generated ${outputPath}`);
            resolve();
          }
        });
      }
    });
  });
});

// 4. Wait for all codes to be generated
Promise.all(generationPromises)
  .then(() => {
    console.log('All Aztec codes have been generated successfully.');
  })
  .catch(() => {
    console.error('An error occurred during Aztec code generation.');
  });
