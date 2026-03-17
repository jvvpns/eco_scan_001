/**
 * cameraService.ts
 * ─────────────────
 * Encapsulates all camera initialisation and frame capture logic,
 * extracted from ScanPage.tsx to keep it as a thin UI layer.
 */

export type CameraError = 'permission_denied' | 'unavailable' | 'unknown';

export type CameraStartResult =
  | { success: true;  stream: MediaStream }
  | { success: false; errorType: CameraError; message: string };

/**
 * Attempts to start the rear-facing camera, falling back to any camera.
 * Returns the MediaStream on success, or a typed error on failure.
 */
export async function startCamera(videoEl: HTMLVideoElement): Promise<CameraStartResult> {
  // Try environment-facing (rear) camera first
  for (const constraints of [
    { video: { facingMode: 'environment' } },
    { video: true },
  ]) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoEl.srcObject = stream;
      return { success: true, stream };
    } catch (err: unknown) {
      const isDenied =
        err instanceof DOMException &&
        (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError');
      if (isDenied) {
        return {
          success: false,
          errorType: 'permission_denied',
          message: 'Could not access camera. Please ensure permissions are granted.',
        };
      }
      // Any other error — keep trying the next constraint set
    }
  }

  return {
    success: false,
    errorType: 'unavailable',
    message: 'No camera found on this device.',
  };
}

/**
 * Stops all tracks on a media stream and clears the video element src.
 */
export function stopCamera(stream: MediaStream | null, videoEl?: HTMLVideoElement): void {
  if (!stream) return;
  stream.getTracks().forEach((t) => t.stop());
  if (videoEl) videoEl.srcObject = null;
}

/**
 * Draws the current video frame to a canvas and returns a JPEG data URL.
 * Returns null if the canvas context is unavailable.
 */
export function captureFrame(
  videoEl: HTMLVideoElement,
  canvasEl: HTMLCanvasElement
): string | null {
  canvasEl.width  = videoEl.videoWidth;
  canvasEl.height = videoEl.videoHeight;
  const ctx = canvasEl.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
  return canvasEl.toDataURL('image/jpeg');
}
