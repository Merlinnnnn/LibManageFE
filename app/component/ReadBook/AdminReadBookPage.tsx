import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { Box, CircularProgress, Typography, IconButton, Paper, Tooltip } from '@mui/material';
import { NavigateNext, NavigateBefore, ZoomIn, ZoomOut, Fullscreen, FullscreenExit } from '@mui/icons-material';
import { Document, Page, pdfjs } from 'react-pdf';
import * as mammoth from 'mammoth';
import apiService from '@/app/untils/api';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const DEFAULT_PDF_WIDTH = 800;

const AdminReadBookPage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [loading, setLoading] = useState(true);
  const [fileType, setFileType] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [docxHtml, setDocxHtml] = useState<string>('');
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [maxScale, setMaxScale] = useState(2);
  const [minScale] = useState(0.5);
  const [pdfPageWidth, setPdfPageWidth] = useState(DEFAULT_PDF_WIDTH);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchFile = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await apiService.get(`/api/v1/digital-documents/file/${id}`, {
          responseType: 'arraybuffer',
        });
        const contentType = response.headers['content-type'] || '';
        setFileType(contentType);
        const buffer = response.data as ArrayBuffer;
        // Nhận diện file
        if (contentType.includes('pdf')) {
          const blob = new Blob([buffer], { type: 'application/pdf' });
          setPdfUrl(URL.createObjectURL(blob));
        } else if (contentType.includes('word') || contentType === 'application/octet-stream') {
          // Kiểm tra signature
          const firstBytes = new Uint8Array(buffer.slice(0, 4));
          const isDocx = firstBytes[0] === 0x50 && firstBytes[1] === 0x4B && firstBytes[2] === 0x03 && firstBytes[3] === 0x04;
          const isDoc = firstBytes[0] === 0xD0 && firstBytes[1] === 0xCF && firstBytes[2] === 0x11 && firstBytes[3] === 0xE0;
          if (!isDocx && !isDoc) {
            setDocxHtml('<div style="color: red; padding: 20px;">❌ File không phải định dạng Word hợp lệ</div>');
          } else {
            const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
            setDocxHtml(`
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #fff; }
                p { margin: 1em 0; }
                table { border-collapse: collapse; width: 100%; margin: 1em 0; }
                td, th { border: 1px solid #444; padding: 8px; }
                img { max-width: 100%; }
              </style>
              ${result.value}
            `);
          }
        } else {
          setDocxHtml('<div style="color: red; padding: 20px;">❌ Không hỗ trợ định dạng file này</div>');
        }
      } catch (error) {
        setDocxHtml('<div style="color: red; padding: 20px;">❌ Lỗi khi tải file</div>');
      } finally {
        setLoading(false);
      }
    };
    fetchFile();
  }, [id]);

  useLayoutEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const newMaxScale = Math.max(minScale, containerWidth / pdfPageWidth);
      setMaxScale(newMaxScale);
      setScale((prev) => Math.min(prev, newMaxScale));
    }
  }, [pdfPageWidth, minScale]);

  const handlePageLoadSuccess = (page: any) => {
    if (page && page.originalWidth) {
      setPdfPageWidth(page.originalWidth);
    } else {
      setPdfPageWidth(DEFAULT_PDF_WIDTH);
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, maxScale));
  };
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, minScale));
  };
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (numPages || 1)) {
      setCurrentPage(newPage);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        gap: 2, 
        backgroundColor: '#121212',
        background: 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)'
      }}>
        <CircularProgress size={60} thickness={4} sx={{ color: '#4fc3f7' }} />
        <Typography variant="h6" color="#e0e0e0" sx={{ fontWeight: 500 }}>Đang tải tài liệu...</Typography>
      </Box>
    );
  }

  if (pdfUrl) {
    return (
      <Box ref={containerRef} sx={{ 
        p: { xs: 1, md: 3 }, 
        width: '100%', 
        margin: '0 auto', 
        minHeight: '100vh', 
        backgroundColor: '#121212',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'flex-start',
        transition: 'all 0.3s ease'
      }}>
        <Paper elevation={0} sx={{ 
          p: 3, 
          mb: 3, 
          backgroundColor: 'transparent', 
          color: '#fff', 
          width: '100%', 
          maxWidth: '1200px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Typography variant="h4" gutterBottom sx={{ 
            fontWeight: 700, 
            color: '#fff', 
            textAlign: 'center', 
            mb: 2,
            fontSize: { xs: '1.5rem', md: '2rem' }
          }}>
            Đọc tài liệu PDF
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ 
            textAlign: 'center',
            color: 'rgba(255,255,255,0.7)'
          }}>
            ID: {id}
          </Typography>
        </Paper>

        <Box sx={{ 
          width: '100%', 
          maxWidth: '1200px', 
          mb: 4,
          position: 'relative'
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            mb: 2, 
            gap: 1,
            backgroundColor: 'rgba(30,30,30,0.8)',
            p: 1,
            borderRadius: '8px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <Tooltip title="Trang trước" arrow>
              <IconButton 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage <= 1} 
                sx={{ 
                  color: '#fff', 
                  '&:hover': { backgroundColor: 'rgba(79,195,247,0.2)' },
                  '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)' }
                }}
              >
                <NavigateBefore />
              </IconButton>
            </Tooltip>

            <Typography sx={{ 
              minWidth: '100px', 
              textAlign: 'center', 
              fontWeight: 500,
              color: '#e0e0e0'
            }}>
              Trang {currentPage} / {numPages}
            </Typography>

            <Tooltip title="Trang sau" arrow>
              <IconButton 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage >= (numPages || 1)} 
                sx={{ 
                  color: '#fff', 
                  '&:hover': { backgroundColor: 'rgba(79,195,247,0.2)' },
                  '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)' }
                }}
              >
                <NavigateNext />
              </IconButton>
            </Tooltip>

            <Box sx={{ mx: 1, height: '24px', width: '1px', backgroundColor: 'rgba(255,255,255,0.2)' }} />

            <Tooltip title="Thu nhỏ" arrow>
              <IconButton 
                onClick={handleZoomOut} 
                disabled={scale <= minScale}
                sx={{ 
                  color: '#fff', 
                  '&:hover': { backgroundColor: 'rgba(79,195,247,0.2)' },
                  '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)' }
                }}
              >
                <ZoomOut />
              </IconButton>
            </Tooltip>

            <Typography sx={{ 
              minWidth: '60px', 
              textAlign: 'center', 
              color: '#e0e0e0'
            }}>
              {(scale * 100).toFixed(0)}%
            </Typography>

            <Tooltip title="Phóng to" arrow>
              <IconButton 
                onClick={handleZoomIn} 
                disabled={scale >= maxScale}
                sx={{ 
                  color: '#fff', 
                  '&:hover': { backgroundColor: 'rgba(79,195,247,0.2)' },
                  '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)' }
                }}
              >
                <ZoomIn />
              </IconButton>
            </Tooltip>

            <Box sx={{ mx: 1, height: '24px', width: '1px', backgroundColor: 'rgba(255,255,255,0.2)' }} />

            <Tooltip title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"} arrow>
              <IconButton 
                onClick={toggleFullscreen}
                sx={{ 
                  color: '#fff', 
                  '&:hover': { backgroundColor: 'rgba(79,195,247,0.2)' }
                }}
              >
                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            backgroundColor: 'rgba(30,30,30,0.8)',
            borderRadius: '8px',
            p: 2,
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <Document
              file={pdfUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '500px' }}>
                  <CircularProgress sx={{ color: '#4fc3f7' }} />
                </Box>
              }
            >
              <Page 
                pageNumber={currentPage} 
                scale={scale} 
                onLoadSuccess={handlePageLoadSuccess}
                loading={
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '500px' }}>
                    <CircularProgress sx={{ color: '#4fc3f7' }} />
                  </Box>
                }
              />
            </Document>
          </Box>
        </Box>
      </Box>
    );
  }

  if (docxHtml) {
    return (
      <Box sx={{ 
        p: { xs: 1, md: 3 }, 
        width: '100%', 
        margin: '0 auto', 
        minHeight: '100vh', 
        backgroundColor: '#121212',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'flex-start'
      }}>
        <Paper elevation={0} sx={{ 
          p: 3, 
          mb: 3, 
          backgroundColor: 'transparent', 
          color: '#fff', 
          width: '100%', 
          maxWidth: '1200px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Typography variant="h4" gutterBottom sx={{ 
            fontWeight: 700, 
            color: '#fff', 
            textAlign: 'center', 
            mb: 2,
            fontSize: { xs: '1.5rem', md: '2rem' }
          }}>
            Đọc tài liệu Word
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ 
            textAlign: 'center',
            color: 'rgba(255,255,255,0.7)'
          }}>
            ID: {id}
          </Typography>
        </Paper>

        <Box sx={{ 
          width: '100%', 
          maxWidth: '1200px', 
          mb: 4,
          backgroundColor: 'rgba(30,30,30,0.8)',
          borderRadius: '8px',
          p: 3,
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
          overflow: 'auto'
        }}>
          <Box sx={{ 
            p: 2, 
            color: '#fff', 
            '& *': { color: '#fff !important' }, 
            '& h1, & h2, & h3, & h4, & h5, & h6': { 
              color: '#4fc3f7 !important', 
              marginTop: '1.5em', 
              marginBottom: '0.5em', 
              fontWeight: '600' 
            }, 
            '& p': { 
              marginBottom: '1em', 
              lineHeight: '1.8',
              fontSize: '1.05rem'
            }, 
            '& table': { 
              borderCollapse: 'collapse', 
              width: '100%', 
              margin: '1.5em 0', 
              backgroundColor: 'rgba(40,40,40,0.5)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }, 
            '& th, & td': { 
              border: '1px solid rgba(255,255,255,0.1)', 
              padding: '12px', 
              textAlign: 'left' 
            }, 
            '& th': { 
              backgroundColor: 'rgba(79,195,247,0.1)', 
              fontWeight: '600',
              color: '#4fc3f7 !important'
            }, 
            '& img': { 
              maxWidth: '100%', 
              height: 'auto', 
              borderRadius: '4px', 
              margin: '1.5em 0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }, 
            '& ul, & ol': { 
              paddingLeft: '2em', 
              margin: '1.2em 0' 
            }, 
            '& li': { 
              marginBottom: '0.8em',
              lineHeight: '1.7'
            }, 
            '& blockquote': { 
              borderLeft: '4px solid #4fc3f7', 
              paddingLeft: '1.2em', 
              margin: '1.5em 0', 
              fontStyle: 'italic', 
              color: 'rgba(255,255,255,0.8) !important',
              backgroundColor: 'rgba(79,195,247,0.05)',
              padding: '1em',
              borderRadius: '0 4px 4px 0'
            }, 
            '& code': { 
              backgroundColor: 'rgba(40,40,40,0.8)', 
              padding: '0.2em 0.4em', 
              borderRadius: '3px', 
              fontFamily: 'monospace',
              fontSize: '0.9em'
            }, 
            '& pre': { 
              backgroundColor: 'rgba(40,40,40,0.8)', 
              padding: '1em', 
              borderRadius: '4px', 
              overflowX: 'auto', 
              margin: '1.5em 0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            },
            '& a': {
              color: '#4fc3f7 !important',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }
          }}>
            <div dangerouslySetInnerHTML={{ __html: docxHtml }} />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      gap: 2, 
      backgroundColor: '#121212',
      p: 3,
      textAlign: 'center'
    }}>
      <Typography variant="h5" color="#e0e0e0" sx={{ fontWeight: 500 }}>
        Không thể hiển thị tài liệu này
      </Typography>
      <Typography variant="body1" color="rgba(255,255,255,0.7)">
        Định dạng tài liệu không được hỗ trợ hoặc có lỗi khi tải file.
      </Typography>
    </Box>
  );
};

export default AdminReadBookPage;