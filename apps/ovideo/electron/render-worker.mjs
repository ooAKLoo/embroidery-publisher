import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';

const args = process.argv.slice(2);
const payloadIndex = args.indexOf('--payload');

if (payloadIndex === -1 || !args[payloadIndex + 1]) {
  console.error('error:missing payload');
  process.exit(1);
}

const payloadPath = path.resolve(args[payloadIndex + 1]);
const payloadRaw = await fs.readFile(payloadPath, 'utf-8');
const payload = JSON.parse(payloadRaw);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const entry = path.resolve(projectRoot, 'src/remotion/index.jsx');

try {
  const bundleLocation = await bundle({
    entryPoint: entry,
    outDir: path.resolve(projectRoot, 'node_modules/.cache/remotion-bundle'),
    onProgress: () => {}
  });

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'MemoryTunnelVideo',
    inputProps: payload.inputProps
  });

  const outputLocation = payload.outputPath
    ? path.resolve(payload.outputPath)
    : path.resolve(projectRoot, 'renders', `memory-tunnel-${Date.now()}.mp4`);

  await fs.mkdir(path.dirname(outputLocation), { recursive: true });

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation,
    inputProps: payload.inputProps,
    chromiumOptions: {
      disableWebSecurity: true,
      gl: 'swangle'
    },
    onProgress: ({ progress }) => {
      if (typeof progress === 'number') {
        process.stdout.write(`progress:${progress}\n`);
      }
    }
  });

  process.stdout.write(`done:${outputLocation}\n`);
} catch (error) {
  process.stdout.write(`error:${error?.message || String(error)}\n`);
  process.exit(1);
}
