'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import apiService from '@/app/untils/api';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Cấu hình worker của react-pdf với phiên bản chính xác
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// ArrayBuffer -> Base64
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Base64 -> ArrayBuffer
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Tạo cặp khóa RSA
const generateRSAKeysInBrowser = async (): Promise<{
  publicKey: string;
  privateKey: string;
  privateKeyRaw: CryptoKey;
}> => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );

  const publicKeyBuffer = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
  const privateKeyBuffer = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

  return {
    publicKey: arrayBufferToBase64(publicKeyBuffer),
    privateKey: arrayBufferToBase64(privateKeyBuffer),
    privateKeyRaw: keyPair.privateKey,
  };
};

interface LicenseResponse {
  data: {
    encryptedContentKey: string;
  };
}

// Tạo key AES từ content key và salt
async function deriveAesKey(contentKey: string, salt: ArrayBuffer | Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(contentKey),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const saltUint8 = salt instanceof Uint8Array ? salt : new Uint8Array(salt);

  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltUint8,
      iterations: 10000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
}

// Giải mã nội dung PDF
async function decryptContentBufferToBuffer(encryptedBuffer: ArrayBuffer, contentKey: string): Promise<ArrayBuffer> {
  const salt = new Uint8Array(encryptedBuffer.slice(0, 16));
  const iv = new Uint8Array(encryptedBuffer.slice(16, 28));
  const ciphertext = encryptedBuffer.slice(28);

  const aesKey = await deriveAesKey(contentKey, salt);
  return await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    ciphertext
  );
}

const ReadBookPage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState<{
    publicKey: string;
    privateKey: string;
    privateKeyRaw: CryptoKey;
  } | null>(null);
  const [bookContentUrl, setBookContentUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfVersion, setPdfVersion] = useState<string>('');

  // Log version khi component mount
  useEffect(() => {
    console.log('PDF.js version:', pdfjs.version);
    setPdfVersion(pdfjs.version);
  }, []);

  useEffect(() => {
    const initKeys = async () => {
      try {
        const generatedKeys = await generateRSAKeysInBrowser();
        setKeys(generatedKeys);
        console.log('✅ Generated RSA Keys:', generatedKeys);
      } catch (error) {
        console.error('❌ Error generating RSA keys:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) initKeys();
  }, [id]);

  useEffect(() => {
    const fetchLicense = async () => {
      if (!keys || !id) return;

      try {
        const licenseResponse = await apiService.post<LicenseResponse>('/api/drm/license', {
          uploadId: id,
          deviceId: '123',
          publicKey: keys.publicKey,
        });

        const encryptedContentKey = licenseResponse.data.data.encryptedContentKey;

        const decryptedKeyBuffer = await window.crypto.subtle.decrypt(
          { name: 'RSA-OAEP' },
          keys.privateKeyRaw,
          base64ToArrayBuffer(encryptedContentKey)
        );
        const contentKey = new TextDecoder().decode(decryptedKeyBuffer);

        const contentResponse = await apiService.get(`/api/drm/content/${id}`, { responseType: 'arraybuffer' });
        const encryptedContentBuffer = contentResponse.data as ArrayBuffer;

        const decryptedContentBuffer = await decryptContentBufferToBuffer(encryptedContentBuffer, contentKey);

        const blob = new Blob([decryptedContentBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setBookContentUrl(url);
      } catch (error) {
        console.error('❌ Error in fetchLicense:', { error, keys, id });
      }
    };

    fetchLicense();
  }, [keys, id]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
          backgroundColor: '#f5f5f5',
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          Initializing secure reading environment...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Reading book with ID: {id}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Using PDF.js version: {pdfVersion}
      </Typography>

      {bookContentUrl ? (
        <Box sx={{ mt: 3 }}>
          <Document
            file={bookContentUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            onLoadError={(err) => console.error('PDF load error:', err)}
            loading={
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            }
          >
            {Array.from(new Array(numPages), (_, index) => (
              <Box key={`page_${index + 1}`} sx={{ mb: 2 }}>
                <Page 
                  pageNumber={index + 1} 
                  width={800}
                  loading={
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress size={24} />
                    </Box>
                  }
                />
              </Box>
            ))}
          </Document>
        </Box>
      ) : (
        <Typography variant="body1" color="error">
          Failed to load or decrypt book content
        </Typography>
      )}
    </Box>
  );
};

export default ReadBookPage;