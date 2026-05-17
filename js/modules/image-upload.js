import { storage, storageRef, uploadBytes, getDownloadURL } from '../firebase-config.js';
import { toast } from './utils.js';

const MAX_WIDTH = 1200;
const MAX_SIZE_KB = 500;

export async function compressImage(file, maxWidth = MAX_WIDTH, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => {
        if (!blob) { reject(new Error('Kompresja nieudana')); return; }
        resolve(new File([blob], file.name, { type: 'image/jpeg' }));
      }, 'image/jpeg', quality);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function uploadToStorage(file, path) {
  const compressed = await compressImage(file);
  const ref = storageRef(storage, path);
  await uploadBytes(ref, compressed);
  return getDownloadURL(ref);
}

export function showPreview(file, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const url = URL.createObjectURL(file);
  el.innerHTML = `<img src="${url}" alt="Podgląd" class="img-preview">`;
}

export async function deleteImage(path) {
  const { deleteObject } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js');
  try {
    await deleteObject(storageRef(storage, path));
    return true;
  } catch {
    return false;
  }
}

export function bindImageInput(inputId, previewId, onUpload) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE_KB * 1024 * 2) {
      toast('Plik za duży (max ~1MB po kompresji)', 'error');
      return;
    }
    showPreview(file, previewId);
    try {
      await onUpload?.(file);
    } catch (e) {
      toast('Błąd uploadu: ' + e.message, 'error');
    }
  });
}
