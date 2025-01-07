import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const MODELS_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
const MODELS_DIR = path.join(process.cwd(), 'public', 'models');

const MODELS = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_landmark_68_tiny_model-weights_manifest.json',
  'face_landmark_68_tiny_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1',
  'age_gender_model-weights_manifest.json',
  'age_gender_model-shard1'
];

// Create models directory if it doesn't exist
if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', err => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

const downloadModels = async () => {
  console.log('Downloading face-api.js models...');
  
  for (const model of MODELS) {
    const url = `${MODELS_URL}/${model}`;
    const dest = path.join(MODELS_DIR, model);
    
    console.log(`Downloading ${model}...`);
    try {
      await downloadFile(url, dest);
      console.log(`✓ Downloaded ${model}`);
    } catch (err) {
      console.error(`✗ Failed to download ${model}:`, err.message);
      process.exit(1);
    }
  }
  
  console.log('All models downloaded successfully!');
};

downloadModels(); 