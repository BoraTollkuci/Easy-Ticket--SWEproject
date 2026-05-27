import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QRCodeDisplayProps {
  qrCodeImage: string;
  ticketId: string;
  seatNumber: string;
  passengerName: string;
  className?: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  qrCodeImage,
  ticketId,
  seatNumber,
  passengerName,
  className = ''
}) => {
  const handleDownloadQR = () => {
    if (!qrCodeImage) return;
    
    // Create a temporary link to download the QR code
    const link = document.createElement('a');
    link.href = qrCodeImage;
    link.download = `ticket-${ticketId.slice(-8)}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!qrCodeImage) {
    return (
      <Card className={`p-4 ${className}`}>
        <CardContent className="text-center">
          <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">QR Code not available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className} border-2 border-[#002c2b]/20 bg-gradient-to-br from-[#002c2b]/5 to-white`}>
      <CardContent className="text-center">
        <div className="mb-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <QrCode className="h-5 w-5 text-[#002c2b]" />
            <h3 className="font-bold text-lg text-[#002c2b]">Your QR Code</h3>
          </div>
          
          <div className="bg-white p-4 rounded-xl border-2 border-[#002c2b]/30 inline-block shadow-lg">
            <img 
              src={qrCodeImage} 
              alt={`QR Code for ticket ${ticketId}`}
              className="w-40 h-40 mx-auto"
            />
          </div>
          
          <p className="text-xs text-gray-600 mt-2">
            Show this QR code at boarding
          </p>
        </div>
        
        <div className="space-y-3 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">Seat:</span>
            <Badge variant="outline" className="text-sm font-semibold px-2 py-1">
              {seatNumber}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">Passenger:</span>
            <span className="font-semibold text-[#002c2b] truncate max-w-32">{passengerName}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">Ticket ID:</span>
            <span className="font-mono text-xs text-gray-700">{ticketId.slice(-8).toUpperCase()}</span>
          </div>
        </div>
        
        <Button
          onClick={handleDownloadQR}
          size="sm"
          variant="outline"
          className="w-full text-sm font-medium border-[#002c2b] text-[#002c2b] hover:bg-[#002c2b] hover:text-white"
        >
          <Download className="h-4 w-4 mr-2" />
          Download QR Code
        </Button>
      </CardContent>
    </Card>
  );
};

export default QRCodeDisplay;
