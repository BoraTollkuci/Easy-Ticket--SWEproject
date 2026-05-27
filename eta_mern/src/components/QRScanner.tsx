import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface QRScannerProps {
  onScanSuccess: (decodedValue: string) => void;
  onClose?: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isRequesting, setIsRequesting] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef(true);

  // Load jsQR library dynamically
  const loadJsQR = async () => {
    return new Promise<void>((resolve, reject) => {
      if ((window as any).jsQR) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
      script.async = true;
      script.onload = () => ((window as any).jsQR ? resolve() : reject(new Error('jsQR failed')));
      script.onerror = () => reject(new Error('Failed to load jsQR library'));
      document.head.appendChild(script);
    });
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async () => {
    if (!isMountedRef.current) return;
    
    try {
      setError(null);
      await loadJsQR();

      // Stop any existing stream before starting a new one
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 640 }, // Using lower res for faster processing on mobile
          height: { ideal: 480 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current && isMountedRef.current) {
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        
        // Explicitly play and wait for it to start
        await videoRef.current.play();
        setIsScanning(true);
      }
    } catch (err: any) {
      console.error('Camera startup error:', err);
      if (isMountedRef.current) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('📱 Camera permission denied. Please grant access in settings.');
        } else {
          setError(`❌ Camera error: ${err.message || 'Check if another app is using the camera.'}`);
        }
        setIsScanning(false);
      }
    }
  };

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(t => t.stop());
      startCamera();
    } catch (err) {
      setError('Permission denied. Please enable camera in browser settings.');
    } finally {
      setIsRequesting(false);
    }
  };

  // Handle Lifecycle and Camera Toggle
  useEffect(() => {
    isMountedRef.current = true;
    startCamera();

    return () => {
      isMountedRef.current = false;
      stopScanning();
    };
  }, [facingMode]);

  // Scanning Logic Loop
  useEffect(() => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const jsQR = (window as any).jsQR;
    let frameId: number;

    const scanFrame = () => {
      if (!isScanning || !videoRef.current || !ctx || !jsQR) return;

      if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          setScannedData(code.data);
          onScanSuccess(code.data);
          stopScanning(); // Stop after success
          return;
        }
      }
      frameId = requestAnimationFrame(scanFrame);
    };

    frameId = requestAnimationFrame(scanFrame);
    return () => cancelAnimationFrame(frameId);
  }, [isScanning, onScanSuccess]);

  const toggleCamera = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-[#002c2b]" />
              <h2 className="text-lg font-bold text-[#002c2b]">Scan QR Code</h2>
            </div>
            <button onClick={() => { stopScanning(); onClose?.(); }} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4">
              <Alert variant="destructive" className="mb-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
              {(error.includes('permission') || error.includes('NotAllowed')) && (
                <Button onClick={handleRequestPermission} disabled={isRequesting} className="w-full bg-[#002c2b]">
                  {isRequesting ? 'Requesting...' : '📱 GRANT CAMERA PERMISSION'}
                </Button>
              )}
            </div>
          )}

          <div className="relative bg-black rounded-lg overflow-hidden mb-4 aspect-square max-h-[300px]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-2 border-green-500 w-3/4 h-3/4 rounded-lg opacity-60 animate-pulse">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-green-500 animate-scan" />
                </div>
              </div>
            )}
            
            {!isScanning && !error && (
              <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                ⏳ Starting Camera...
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={toggleCamera}
              variant="outline"
              className="w-full border-[#002c2b] text-[#002c2b]"
            >
              {facingMode === 'user' ? '📹 Use Back Camera' : '📷 Use Front Camera'}
            </Button>

            <Button onClick={() => { stopScanning(); onClose?.(); }} variant="ghost" className="w-full text-gray-500">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
      
<style>
        {`
          @keyframes scan {
            0% { top: 0%; }
            100% { top: 100%; }
          }
          .animate-scan {
            position: absolute;
            width: 100%;
            height: 2px;
            background-color: #22c55e;
            animation: scan 2s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default QRScanner;