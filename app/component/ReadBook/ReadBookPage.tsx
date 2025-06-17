'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { Box, CircularProgress, Typography, IconButton, Slider, Paper } from '@mui/material';
import { NavigateNext, NavigateBefore, ZoomIn, ZoomOut } from '@mui/icons-material';
import apiService from '@/app/untils/api';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

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

async function deriveAesKey(contentKey: string, salt: ArrayBuffer | Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(contentKey),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const saltUint8 = new Uint8Array(salt as ArrayBuffer);

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

const DEFAULT_PDF_WIDTH = 800;

const ReadPdfPage = () => {
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
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [maxScale, setMaxScale] = useState(2);
  const [minScale, setMinScale] = useState(0.5);
  const [pdfVersion, setPdfVersion] = useState<string>('');
  const [decryptedBuffer, setDecryptedBuffer] = useState<ArrayBuffer | null>(null);
  const [fileType, setFileType] = useState<string>('');
  const [pdfPageWidth, setPdfPageWidth] = useState(DEFAULT_PDF_WIDTH);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('PDF.js version:', pdfjs.version);
    setPdfVersion(pdfjs.version);
  }, []);

  useEffect(() => {
    const initKeys = async () => {
      try {
        const generatedKeys = await generateRSAKeysInBrowser();
        setKeys(generatedKeys);
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
        const licenseResponse = await apiService.post<LicenseResponse>('/api/v1/drm/license', {
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

        const contentResponse = await apiService.get(`/api/v1/drm/content/${id}`, {
          responseType: 'arraybuffer',
        });

        const contentType = contentResponse.headers['content-type'];
        const encryptedContentBuffer = contentResponse.data as ArrayBuffer;
        const decryptedContentBuffer = await decryptContentBufferToBuffer(encryptedContentBuffer, contentKey);

        setFileType(contentType);
        console.log(contentType);
        console.log('174',decryptedContentBuffer);
        setDecryptedBuffer(decryptedContentBuffer);
      } catch (error) {
        console.error('❌ Error in fetchLicense:', error);
      }
    };
    fetchLicense();
  }, [keys, id]);

  useEffect(() => {
    if (!(decryptedBuffer instanceof ArrayBuffer) || decryptedBuffer.byteLength === 0 || !fileType) {
      console.error('❌ Missing or invalid decryptedBuffer or fileType');
      console.log('decryptedBuffer:', decryptedBuffer);
      console.log('fileType:', fileType);
      return;
    }
    

    console.log('🔍 File type:', fileType);

    if (fileType === 'application/octet-stream') {
      console.log('🔍 Received application/octet-stream, attempting to detect file type...');
      const fileBytes = new Uint8Array(decryptedBuffer);
      const isPDF = fileBytes[0] === 0x25 && fileBytes[1] === 0x50;
      const isWord = fileBytes[0] === 0x50 && fileBytes[1] === 0x4B;

      if (isPDF) {
        console.log('✅ PDF detected');
        const blob = new Blob([decryptedBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setBookContentUrl(url);
      } else if (isWord) {
        console.log('✅ Word detected');
        // mammoth.convertToHtml({ arrayBuffer: decryptedBuffer })
        //   .then((result) => {
        //     setDocxHtml(result.value);
        //   })
        //   .catch((err) => {
        //     console.error('❌ mammoth error:', err);
        //   });
      } else {
        console.error('❌ Unable to detect file type for application/octet-stream');
      }
      return;
    }

    if (fileType.includes('pdf')) {
      console.log('🔍 Processing PDF document...');
      const blob = new Blob([decryptedBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      console.log('✅ PDF URL created:', url);
      setBookContentUrl(url);
    } 
    else {
      console.error('❌ Unsupported file type:', fileType);
    }
  }, [decryptedBuffer, fileType]);

  // Dynamically calculate maxScale based on container width and PDF page width
  useLayoutEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const newMaxScale = Math.max(minScale, containerWidth / pdfPageWidth);
      setMaxScale(newMaxScale);
      // If current scale is above new max, clamp it
      setScale((prev) => Math.min(prev, newMaxScale));
    }
  }, [pdfPageWidth, minScale]);

  // When PDF loads, get its natural width
  const handlePageLoadSuccess = (page: any) => {
    if (page && page.originalWidth) {
      setPdfPageWidth(page.originalWidth);
    } else {
      setPdfPageWidth(DEFAULT_PDF_WIDTH);
    }
  };

  const handleZoomIn = () => {
    setScale(prev => {
      const next = Math.min(prev + 0.1, maxScale);
      return parseFloat(next.toFixed(2));
    });
  };

  const handleZoomOut = () => {
    setScale(prev => {
      const next = Math.max(prev - 0.1, minScale);
      return parseFloat(next.toFixed(2));
    });
  };

  const handleScaleChange = (event: Event, value: number | number[]) => {
    const newValue = Math.max(minScale, Math.min(maxScale, value as number));
    setScale(parseFloat(newValue.toFixed(2)));
  };
  

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (numPages || 1)) {
      setCurrentPage(newPage);
    }
  };

  if (loading || !bookContentUrl) {
    return (
      <Box sx={{
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center', 
        minHeight: '100vh', 
        gap: 2, 
        backgroundColor: '#232323',
      }}>
        <CircularProgress size={60} thickness={4} sx={{ color: '#fff' }} />
        <Typography variant="h6" color="#fff">
          {loading ? 'Initializing secure reading environment...' : 'Loading document...'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      p: 3,
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: '100vh',
      position: 'relative',
      backgroundColor: '#1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      '&::before': {
        content: '""',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        pointerEvents: 'none',
      },
    }}>
      <Paper elevation={3} sx={{ 
        p: 3, 
        mb: 3, 
        backgroundColor: '#2d2d2d', 
        color: '#fff', 
        zIndex: 1, 
        width: '100%', 
        maxWidth: 900,
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <Typography variant="h4" gutterBottom sx={{ 
          fontWeight: 'bold',
          color: '#fff',
          textAlign: 'center',
          mb: 2
        }}>
          Đọc tài liệu PDF
        </Typography>
        {/* <Typography variant="body1" color="#b0b0b0" sx={{ textAlign: 'center' }}>
          ID: {id}
        </Typography> */}
        {/* <Typography variant="body2" color="#b0b0b0" sx={{ textAlign: 'center', mt: 1 }}>
          Sử dụng PDF.js version: {pdfVersion}
        </Typography> */}
      </Paper>

      <Paper elevation={3} sx={{ 
        p: 3, 
        backgroundColor: '#2d2d2d', 
        color: '#fff', 
        zIndex: 1, 
        width: '100%', 
        maxWidth: 900,
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 2,
          gap: 2,
          flexWrap: 'wrap',
          backgroundColor: '#232323',
          p: 2,
          borderRadius: '8px'
        }}>
          <IconButton
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            sx={{ 
              color: '#fff',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
              '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)' }
            }}
          >
            <NavigateBefore />
          </IconButton>
          <Typography sx={{ 
            minWidth: '100px',
            textAlign: 'center',
            fontWeight: 'medium'
          }}>
            Trang {currentPage} / {numPages}
          </Typography>
          <IconButton
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= (numPages || 1)}
            sx={{ 
              color: '#fff',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
              '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)' }
            }}
          >
            <NavigateNext />
          </IconButton>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            ml: 2,
            minWidth: 200,
            backgroundColor: '#2d2d2d',
            p: 1,
            borderRadius: '8px'
          }}>
            <IconButton
              onClick={handleZoomOut}
              disabled={parseFloat(scale.toFixed(2)) <= minScale}
              sx={{ 
                color: '#fff',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)' }
              }}
            >
              <ZoomOut />
            </IconButton>
            <Slider
              value={scale}
              min={minScale}
              max={maxScale}
              step={0.05}
              onChange={handleScaleChange}
              sx={{
                width: 100,
                color: '#fff',
                '& .MuiSlider-thumb': {
                  backgroundColor: '#fff',
                  '&:hover': { boxShadow: '0 0 0 8px rgba(255,255,255,0.16)' }
                },
                '& .MuiSlider-track': {
                  backgroundColor: '#fff',
                },
                '& .MuiSlider-rail': {
                  backgroundColor: '#555',
                },
              }}
              aria-labelledby="zoom-slider"
            />
            <IconButton
              onClick={handleZoomIn}
              disabled={parseFloat(scale.toFixed(2)) >= maxScale}
              sx={{ 
                color: '#fff',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)' }
              }}
            >
              <ZoomIn />
            </IconButton>
          </Box>
        </Box>
        <Box
          ref={containerRef}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: '#232323',
            borderRadius: '8px',
            p: 2,
            overflow: 'hidden',
            position: 'relative',
            zIndex: 1,
            '& .react-pdf__Document': {
              maxWidth: '100%',
              overflow: 'hidden',
              backgroundColor: '#232323',
            },
            '& .react-pdf__Page': {
              maxWidth: '100%',
              backgroundColor: '#232323',
              '& canvas': {
                maxWidth: '100%',
                height: 'auto !important',
                backgroundColor: '#232323',
                borderRadius: '4px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
              },
            },
          }}
        >
          <Document
            file={bookContentUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            onLoadError={(err) => console.error('PDF load error:', err)}
            loading={
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                py: 4,
                backgroundColor: '#232323',
              }}>
                <CircularProgress sx={{ color: '#fff' }} />
              </Box>
            }
          >
            <Page
              pageNumber={currentPage}
              scale={scale}
              width={pdfPageWidth}
              onLoadSuccess={handlePageLoadSuccess}
              loading={
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  py: 4,
                  backgroundColor: '#232323',
                }}>
                  <CircularProgress size={24} sx={{ color: '#fff' }} />
                </Box>
              }
            />
          </Document>
        </Box>
      </Paper>
    </Box>
  );
};

export default ReadPdfPage;