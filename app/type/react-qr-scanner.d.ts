declare module 'react-qr-scanner' {
    interface QrScannerProps {
      delay?: number;
      onError?: (error: any) => void;
      onScan?: (data: any) => void;
      style?: React.CSSProperties;
      constraints?: MediaStreamConstraints;
      facingMode?: 'user' | 'environment';
    }
  
    const QrScanner: React.FC<QrScannerProps>;
    export default QrScanner;
  }
  