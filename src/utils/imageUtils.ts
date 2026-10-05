/**
 * Converts any image Data URL (including SVG data URLs) to a standard JPEG Base64 Data URL
 * suitable for Gemini multimodal input.
 */
export async function ensureJpegBase64(imageUrl: string): Promise<{ dataUrl: string; mimeType: string }> {
  // If it's already a standard JPEG, PNG or WebP base64, return as is
  if (imageUrl.startsWith('data:image/jpeg;base64,') ||
      imageUrl.startsWith('data:image/png;base64,') ||
      imageUrl.startsWith('data:image/webp;base64,')) {
    const mime = imageUrl.split(';')[0].replace('data:', '');
    return { dataUrl: imageUrl, mimeType: mime };
  }

  // Otherwise, load into an Image and render onto an HTML5 Canvas to produce image/jpeg
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 600;
        canvas.height = img.naturalHeight || 800;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('No se pudo inicializar el contexto de canvas.');
        }

        // Draw solid background in case image has transparent areas
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const jpegData = canvas.toDataURL('image/jpeg', 0.92);
        resolve({ dataUrl: jpegData, mimeType: 'image/jpeg' });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new Error('No se pudo cargar la imagen para su procesamiento.'));
    };

    img.src = imageUrl;
  });
}
