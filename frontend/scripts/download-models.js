import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

const MODELS_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
const MODELS_DIR = join(process.cwd(), 'public', 'models');

const MODELS = [
  'tiny_face_detector_model-shard1',
  'tiny_face_detector_model-weights_manifest.json',
  'face_expression_model-shard1',
  'face_expression_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
  'face_recognition_model-weights_manifest.json'
];

async function downloadFile(url, dest) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download ${url}: ${response.statusText}`);
  const buffer = await response.arrayBuffer();
  await writeFile(dest, Buffer.from(buffer));
}

async function main() {
  try {
    // Create models directory if it doesn't exist
    await mkdir(MODELS_DIR, { recursive: true });
    
    console.log('Downloading face-api.js models...');
    
    // Download each model file
    for (const model of MODELS) {
      const url = `${MODELS_URL}/${model}`;
      const dest = join(MODELS_DIR, model);
      
      console.log(`Downloading ${model}...`);
      await downloadFile(url, dest);
    }
    
    console.log('All models downloaded successfully!');
  } catch (error) {
    console.error('Error downloading models:', error);
    process.exit(1);
  }
}

main(); 