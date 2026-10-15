import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function BarcodeScanner({ open, onClose, onDetected }) {
  const videoRef = useRef(null);
  const detectedRef = useRef(onDetected);
  detectedRef.current = onDetected;
  const [manual, setManual] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    let stream, raf, stopped = false;
    setError("");
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (stopped) { stream.getTracks().forEach((t) => t.stop()); return; }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        if ("BarcodeDetector" in window) {
          const detector = new window.BarcodeDetector();
          const scan = async () => {
            if (stopped || !videoRef.current) return;
            const codes = await detector.detect(videoRef.current).catch(() => []);
            if (codes && codes.length) {
              detectedRef.current(codes[0].rawValue);
              return;
            }
            raf = requestAnimationFrame(scan);
          };
          raf = requestAnimationFrame(scan);
        } else {
          setError("Tu navegador no detecta códigos automáticamente. Ingresa el código manualmente.");
        }
      } catch {
        setError("No se pudo acceder a la cámara. Ingresa el código manualmente.");
      }
    };
    start();
    return () => {
      stopped = true;
      if (raf) cancelAnimationFrame(raf);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Escanear código de barras</DialogTitle></DialogHeader>
        <div className="rounded-2xl overflow-hidden bg-neutral-900 aspect-video">
          <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
        </div>
        {error && <p className="text-xs text-neutral-500">{error}</p>}
        <div className="flex gap-2">
          <Input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Código manual" />
          <Button onClick={() => manual && onDetected(manual)}>Usar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
