import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';
import apiService from '@/app/untils/api';
import * as mammoth from 'mammoth';

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

const ReadWordPage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState<{
    publicKey: string;
    privateKey: string;
    privateKeyRaw: CryptoKey;
  } | null>(null);
  const [docxHtml, setDocxHtml] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');

  useEffect(() => {
    const initKeys = async () => {
      console.log('🔑 Bắt đầu khởi tạo RSA keys...');
      try {
        const generatedKeys = await generateRSAKeysInBrowser();
        console.log('✅ Đã tạo RSA keys thành công:', {
          publicKeyLength: generatedKeys.publicKey.length,
          privateKeyLength: generatedKeys.privateKey.length
        });
        setKeys(generatedKeys);
      } catch (error) {
        console.error('❌ Lỗi khi tạo RSA keys:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      console.log('📚 ID sách:', id);
      initKeys();
    }
  }, [id]);

  useEffect(() => {
    const fetchLicense = async () => {
      if (!keys || !id) {
        console.log('⚠️ Chưa có keys hoặc id:', { hasKeys: !!keys, id });
        return;
      }
      console.log('🔑 Bắt đầu lấy license...');
      try {
        console.log('📤 Gửi request lấy license với:', {
          uploadId: id,
          publicKeyLength: keys.publicKey.length
        });
        const licenseResponse = await apiService.post<LicenseResponse>('/api/v1/drm/license', {
          uploadId: id,
          deviceId: '123',
          publicKey: keys.publicKey,
        });

        console.log('📥 Nhận được license response:', {
          success: !!licenseResponse.data,
          hasEncryptedKey: !!licenseResponse.data.data.encryptedContentKey
        });

        const encryptedContentKey = licenseResponse.data.data.encryptedContentKey;
        console.log('🔐 Bắt đầu giải mã content key...');
        const decryptedKeyBuffer = await window.crypto.subtle.decrypt(
          { name: 'RSA-OAEP' },
          keys.privateKeyRaw,
          base64ToArrayBuffer(encryptedContentKey)
        );
        const contentKey = new TextDecoder().decode(decryptedKeyBuffer);
        console.log('✅ Đã giải mã content key thành công');

        console.log('📥 Bắt đầu tải nội dung file...');
        const contentResponse = await apiService.get(`/api/v1/drm/content/${id}`, {
          responseType: 'arraybuffer',
        });

        const contentType = contentResponse.headers['content-type'];
        console.log('📄 Content-Type:', contentType);
        
        const encryptedContentBuffer = contentResponse.data as ArrayBuffer;
        console.log('🔐 Bắt đầu giải mã nội dung file...');
        const decryptedContentBuffer = await decryptContentBufferToBuffer(encryptedContentBuffer, contentKey);
        console.log('✅ Đã giải mã nội dung file thành công');

        setFileType(contentType);
        if (contentType.includes('word') || contentType === 'application/octet-stream') {
          console.log('📝 Bắt đầu chuyển đổi Word sang HTML...');
          console.log('🔍 Kiểm tra buffer:', {
            bufferSize: decryptedContentBuffer.byteLength,
            firstBytes: new Uint8Array(decryptedContentBuffer.slice(0, 4)),
            contentType: contentType
          });
          
          // Kiểm tra signature của file
          const firstBytes = new Uint8Array(decryptedContentBuffer.slice(0, 4));
          const isDocx = firstBytes[0] === 0x50 && firstBytes[1] === 0x4B && firstBytes[2] === 0x03 && firstBytes[3] === 0x04;
          const isDoc = firstBytes[0] === 0xD0 && firstBytes[1] === 0xCF && firstBytes[2] === 0x11 && firstBytes[3] === 0xE0;
          
          console.log('📄 Kiểm tra signature:', {
            isDocx,
            isDoc,
            firstBytes: Array.from(firstBytes).map(b => b.toString(16).padStart(2, '0')).join(' ')
          });

          if (!isDocx && !isDoc) {
            console.error('❌ File không phải định dạng Word hợp lệ');
            return;
          }

          try {
            // Tạo blob từ buffer với type phù hợp
            const blob = new Blob([decryptedContentBuffer], { 
              type: isDoc ? 'application/msword' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            });

            // Sử dụng mammoth.js để chuyển đổi
            const result = await mammoth.convertToHtml({ arrayBuffer: decryptedContentBuffer });
            console.log('✅ Đã chuyển đổi Word sang HTML thành công');
            
            // Thêm CSS để cải thiện hiển thị
            const htmlWithStyles = `
              <style>
                body { 
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #fff;
                }
                p { margin: 1em 0; }
                table { 
                  border-collapse: collapse;
                  width: 100%;
                  margin: 1em 0;
                }
                td, th {
                  border: 1px solid #444;
                  padding: 8px;
                }
                img { max-width: 100%; }
              </style>
              ${result.value}
            `;
            
            setDocxHtml(htmlWithStyles);
          } catch (error) {
            console.error('❌ Lỗi khi chuyển đổi Word sang HTML:', error);
            setDocxHtml(`
              <div style="color: red; padding: 20px;">
                ❌ Lỗi khi đọc file Word. 
                ${isDoc ? 'File DOC (Word 97-2003) có thể không được hỗ trợ đầy đủ. Vui lòng chuyển đổi sang định dạng DOCX.' : 'Vui lòng kiểm tra lại định dạng file.'}
              </div>
            `);
          }
        } else {
          console.warn('⚠️ Không phải file Word:', contentType);
        }
      } catch (error) {
        console.error('❌ Lỗi trong quá trình xử lý:', error);
      }
    };
    fetchLicense();
  }, [keys, id]);

  if (loading || !docxHtml) {
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
          Đọc tài liệu Word
        </Typography>
        {/* <Typography variant="body1" color="#b0b0b0" sx={{ textAlign: 'center' }}>
          ID: {id}
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
          p: 2, 
          backgroundColor: '#232323', 
          borderRadius: '8px', 
          color: '#fff',
          '& *': {
            color: '#fff !important',
          },
          '& h1, & h2, & h3, & h4, & h5, & h6': {
            color: '#fff !important',
            marginTop: '1.5em',
            marginBottom: '0.5em',
            fontWeight: 'bold'
          },
          '& p': {
            marginBottom: '1em',
            lineHeight: '1.6'
          },
          '& table': {
            borderCollapse: 'collapse',
            width: '100%',
            margin: '1em 0',
            backgroundColor: '#2d2d2d'
          },
          '& th, & td': {
            border: '1px solid #444',
            padding: '12px',
            textAlign: 'left'
          },
          '& th': {
            backgroundColor: '#333',
            fontWeight: 'bold'
          },
          '& img': {
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '4px',
            margin: '1em 0'
          },
          '& ul, & ol': {
            paddingLeft: '2em',
            margin: '1em 0'
          },
          '& li': {
            marginBottom: '0.5em'
          },
          '& blockquote': {
            borderLeft: '4px solid #666',
            paddingLeft: '1em',
            margin: '1em 0',
            fontStyle: 'italic',
            color: '#b0b0b0'
          },
          '& code': {
            backgroundColor: '#333',
            padding: '0.2em 0.4em',
            borderRadius: '3px',
            fontFamily: 'monospace'
          },
          '& pre': {
            backgroundColor: '#333',
            padding: '1em',
            borderRadius: '4px',
            overflowX: 'auto',
            margin: '1em 0'
          }
        }}>
          <div dangerouslySetInnerHTML={{ __html: docxHtml }} />
        </Box>
      </Paper>
    </Box>
  );
};

export default ReadWordPage; 