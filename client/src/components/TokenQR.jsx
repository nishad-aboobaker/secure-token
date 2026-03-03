import { QRCodeSVG } from 'qrcode.react';
import { Download, CheckCircle, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TokenQR({ tokenData }) {
    const qrValue = `${tokenData.tokenId}.${tokenData.signature}`;

    const downloadQR = () => {
        const svg = document.getElementById('token-qr');
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width + 40;
            canvas.height = img.height + 100;
            if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 20, 20);
                ctx.fillStyle = 'black';
                ctx.font = 'bold 16px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(`TOKEN: ${tokenData.tokenId.slice(0, 8)}...`, canvas.width / 2, img.height + 60);
            }
            const pngFile = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.download = `token-${tokenData.tokenId.slice(0, 8)}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-8 rounded-3xl flex flex-col items-center gap-6 max-w-md w-full relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

            <div className="p-4 bg-green-500/10 rounded-full mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
            </div>

            <div className="text-center">
                <h2 className="text-2xl font-bold mb-1 text-black">Token Generated!</h2>
                <p className="text-black/50 text-sm">Valid until {new Date(tokenData.expiresAt).toLocaleDateString()}</p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-xl shadow-indigo-500/5">
                <QRCodeSVG
                    id="token-qr"
                    value={qrValue}
                    size={200}
                    level="H"
                    includeMargin={false}
                />
            </div>

            <div className="flex flex-col gap-3 w-full">
                <button
                    onClick={downloadQR}
                    className="premium-btn w-full flex items-center justify-center gap-2"
                >
                    <Download className="w-5 h-5" />
                    Download QR Code
                </button>

                <div className="flex items-center justify-center gap-2 text-black/30 text-xs py-2">
                    <Smartphone className="w-4 h-4" />
                    Present this QR at the venue
                </div>
            </div>
        </motion.div>
    );
}
