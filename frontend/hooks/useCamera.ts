
import { useState, useRef, useCallback, useEffect } from 'react';

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const startCamera = useCallback(async () => {
    setError(null);
    if (stream) return stream;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' 
        },
        audio: false
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        setIsCameraReady(true);
      }
      return mediaStream;
    } catch (err) {
      console.error("Camera Access Error:", err);
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Camera access denied. Please enable it in your browser settings to continue.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera detected on this device.');
        } else {
          setError(`Camera Error: ${err.message}`);
        }
      } else {
        setError('Unable to initialize camera. Please try refreshing.');
      }
      throw err;
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraReady(false);
    }
  }, [stream]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return { videoRef, startCamera, stopCamera, error, isCameraReady };
};
