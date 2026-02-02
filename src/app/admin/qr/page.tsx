'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, ChevronLeft, QrCode as QrIcon, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function QRPage() {
  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const menuUrl = `${origin}/menu`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'restaurant-qr.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 font-sans">
      <header className="mb-12">
        <Link 
          href="/admin/dashboard" 
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <QrIcon className="w-8 h-8 text-orange-500" />
          Restaurant QR Code
        </h1>
        <p className="text-zinc-500">Print this QR and place it on tables or at the gate</p>
      </header>

      <main className="max-w-md mx-auto flex flex-col items-center">
        <div className="bg-white p-8 rounded-3xl shadow-2xl shadow-orange-500/10 mb-8">
          {origin ? (
            <QRCodeSVG
              id="qr-code-svg"
              value={menuUrl}
              size={256}
              level="H"
              includeMargin={false}
            />
          ) : (
            <div className="w-64 h-64 bg-zinc-100 animate-pulse rounded-xl" />
          )}
        </div>

        <div className="w-full space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between gap-4">
            <div className="truncate text-zinc-400 text-sm">
              {menuUrl || 'Loading...'}
            </div>
            <button 
              onClick={copyToClipboard}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-orange-500"
            >
              {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          <button
            onClick={downloadQR}
            className="w-full flex items-center justify-center gap-3 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold shadow-lg shadow-orange-600/20 transition-all active:scale-95"
          >
            <Download className="w-5 h-5" />
            Download QR Code (PNG)
          </button>
          
          <div className="text-center">
            <p className="text-xs text-zinc-600 uppercase tracking-widest font-semibold mt-8">
              Instructions
            </p>
            <ol className="text-sm text-zinc-500 mt-4 space-y-2 text-left list-decimal list-inside">
              <li>Download the QR code image</li>
              <li>Print it on a card or sticker</li>
              <li>Place it on dining tables or entrance</li>
              <li>Customers scan to open the menu instantly</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
