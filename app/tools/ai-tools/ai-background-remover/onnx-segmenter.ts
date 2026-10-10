/**
 * ONNX-based background remover using RMBG-1.4 ONNX model.
 * Replaces transformers.js pipeline which doesn't support SegformerForSemanticSegmentation.
 */

const MODEL_URL = 'https://huggingface.co/imgdesignart/rmbg-1-4-onnx/resolve/main/onnx/model_quantized.onnx';
const MODEL_SIZE = 1024;

let sessionCache: any = null;

async function getSession(onProgress: (fraction: number, status: string) => void) {
  if (sessionCache) return sessionCache;
  
  const ort = await import('onnxruntime-web');
  
  onProgress(0, 'Downloading AI model…');
  
  // Fetch with progress
  const response = await fetch(MODEL_URL);
  if (!response.ok) throw new Error('Could not load the AI model. Check your connection and try again.');
  
  const contentLength = parseInt(response.headers.get('content-length') || '0');
  const reader = response.body!.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (contentLength > 0) {
      onProgress(received / contentLength * 0.8, `Downloading AI model… ${Math.round(received/1024/1024)}MB`);
    }
  }
  
  const modelData = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    modelData.set(chunk, offset);
    offset += chunk.length;
  }
  
  onProgress(0.85, 'Starting AI model…');
  const session = await ort.InferenceSession.create(modelData.buffer, {
    executionProviders: ['wasm'],
  });
  
  onProgress(1, 'Model ready');
  sessionCache = session;
  return session;
}

function preprocess(img: HTMLImageElement): { tensor: any, width: number, height: number } {
  // Create canvas at model size
  const canvas = document.createElement('canvas');
  canvas.width = MODEL_SIZE;
  canvas.height = MODEL_SIZE;
  const ctx = canvas.getContext('2d')!;
  
  // Draw image scaled to model size (keep aspect, pad if needed)
  const scale = Math.min(MODEL_SIZE / img.naturalWidth, MODEL_SIZE / img.naturalHeight);
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  const x = Math.round((MODEL_SIZE - w) / 2);
  const y = Math.round((MODEL_SIZE - h) / 2);
  
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, MODEL_SIZE, MODEL_SIZE);
  ctx.drawImage(img, x, y, w, h);
  
  const imageData = ctx.getImageData(0, 0, MODEL_SIZE, MODEL_SIZE);
  const data = imageData.data;
  
  // Convert to NCHW float32, normalized [0,1], ImageNet mean/std
  // RMBG expects: (x - mean) / std, mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225]
  const floatData = new Float32Array(3 * MODEL_SIZE * MODEL_SIZE);
  const mean = [0.485, 0.456, 0.406];
  const std = [0.229, 0.224, 0.225];
  
  for (let i = 0; i < MODEL_SIZE * MODEL_SIZE; i++) {
    const r = data[i * 4] / 255;
    const g = data[i * 4 + 1] / 255;
    const b = data[i * 4 + 2] / 255;
    floatData[i] = (r - mean[0]) / std[0];
    floatData[i + MODEL_SIZE * MODEL_SIZE] = (g - mean[1]) / std[1];
    floatData[i + 2 * MODEL_SIZE * MODEL_SIZE] = (b - mean[2]) / std[2];
  }
  
  return { tensor: floatData, width: w, height: h };
}

export async function removeBackground(
  img: HTMLImageElement,
  onProgress: (fraction: number, status: string) => void,
): Promise<HTMLCanvasElement> {
  const ort = await import('onnxruntime-web');
  const session = await getSession(onProgress);
  
  onProgress(0.05, 'Analyzing image…');
  const { tensor } = preprocess(img);
  
  const inputTensor = new ort.Tensor('float32', tensor, [1, 3, MODEL_SIZE, MODEL_SIZE]);
  const feeds = { [session.inputNames[0]]: inputTensor };
  
  const results = await session.run(feeds);
  const outputName = session.outputNames[0];
  const output = results[outputName];
  const maskData = output.data as Float32Array;
  
  // Output is [1, 1, 1024, 1024] - foreground logits/probabilities
  // Convert to mask canvas at original image size
  onProgress(0.85, 'Compositing transparent PNG…');
  
  const origW = img.naturalWidth;
  const origH = img.naturalHeight;
  
  // Create mask canvas at model size first
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = MODEL_SIZE;
  maskCanvas.height = MODEL_SIZE;
  const maskCtx = maskCanvas.getContext('2d')!;
  const maskImageData = maskCtx.createImageData(MODEL_SIZE, MODEL_SIZE);
  
  for (let i = 0; i < MODEL_SIZE * MODEL_SIZE; i++) {
    // Sigmoid if needed (model may output logits)
    let v = maskData[i];
    if (v < 0 || v > 1) {
      v = 1 / (1 + Math.exp(-v));
    }
    const alpha = Math.round(Math.max(0, Math.min(1, v)) * 255);
    maskImageData.data[i * 4] = alpha;
    maskImageData.data[i * 4 + 1] = alpha;
    maskImageData.data[i * 4 + 2] = alpha;
    maskImageData.data[i * 4 + 3] = 255;
  }
  maskCtx.putImageData(maskImageData, 0, 0);
  
  // Composite: original image + mask as alpha, at original resolution
  const outCanvas = document.createElement('canvas');
  outCanvas.width = origW;
  outCanvas.height = origH;
  const outCtx = outCanvas.getContext('2d')!;
  
  // Draw original
  outCtx.drawImage(img, 0, 0, origW, origH);
  
  // Apply mask as alpha using globalCompositeOperation
  // First, get the mask scaled to original size
  const scaledMask = document.createElement('canvas');
  scaledMask.width = origW;
  scaledMask.height = origH;
  const scaledCtx = scaledMask.getContext('2d')!;
  
  // Calculate the same scaling as preprocess (to undo padding)
  const scale = Math.min(MODEL_SIZE / origW, MODEL_SIZE / origH);
  const w = Math.round(origW * scale);
  const h = Math.round(origH * scale);
  const x = Math.round((MODEL_SIZE - w) / 2);
  const y = Math.round((MODEL_SIZE - h) / 2);
  
  // Extract the non-padded region and scale to original
  scaledCtx.drawImage(maskCanvas, x, y, w, h, 0, 0, origW, origH);
  const scaledMaskData = scaledCtx.getImageData(0, 0, origW, origH);
  
  // Apply as alpha channel
  const outImageData = outCtx.getImageData(0, 0, origW, origH);
  for (let i = 0; i < origW * origH; i++) {
    outImageData.data[i * 4 + 3] = scaledMaskData.data[i * 4]; // use red channel as alpha
  }
  outCtx.putImageData(outImageData, 0, 0);
  
  return outCanvas;
}
