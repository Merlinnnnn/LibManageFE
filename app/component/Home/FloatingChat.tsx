import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Fab,
  Paper,
  TextField,
  Typography,
  IconButton,
  Button,
  Stack,
  Avatar,
  Dialog,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import apiService from '@/app/untils/api';
import BookInfo from '../Books/BookInfo';
import BookDetail from '../Books/BookDetail';

interface QuickReply {
  text: string;
  payload: string;
}

interface CardButton {
  type: 'POST' | 'GET';
  text: string;
  payload: string;
  url: string;
}

interface Card {
  title: string;
  subtitle: string;
  imageUrl: string;
  buttons: CardButton[];
}

interface Message {
  from: 'user' | 'bot';
  text: string;
  quickReplies?: QuickReply[];
  options?: string[];
  cards?: Card[];
}

interface ChatResponse {
  code: number;
  success: boolean;
  message: string;
  data: {
    reply: string;
    quickReplies: QuickReply[] | null;
    cards: Card[] | null;
    suggestions: string[] | null;
    customData: any;
    error: any;
  };
}

interface QuickReplyPayload {
  eventName: string;
  parameters: Record<string, any>;
}

interface BookDetails {
  documentId: number;
  documentName: string;
  author: string;
  publisher: string;
  description: string;
  coverImage: string | null;
  quantity: number;
}

interface BookDetailsResponse {
  code: number;
  success: boolean;
  message: string;
  data: BookDetails;
}

interface Book {
  documentId: number;
  documentName: string;
  author: string;
  publisher: string;
  publishedDate: string | null;
  language: string | null;
  quantity: number;
  description: string;
  coverImage: string | null;
  documentCategory: string;
  documentTypes: any[];
  courses: any[];
  physicalDocument: any | null;
  digitalDocument: any | null;
}

interface LoanResponse {
  code: number;
  success: boolean;
  message: string;
  data: {
    transactionId: number;
    documentId: string;
    physicalDocId: number;
    documentName: string;
    username: string;
    librarianId: number | null;
    loanDate: string;
    dueDate: string | null;
    returnDate: string | null;
    status: string;
    returnCondition: string | null;
    fineAmount: number;
    paymentStatus: string;
    paidAt: string | null;
  };
}

const FloatingChat: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId] = useState(`session-${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [bookDetails, setBookDetails] = useState<BookDetails | null>(null);
  const [bookDetailsOpen, setBookDetailsOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookInfoOpen, setBookInfoOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [bookDetailOpen, setBookDetailOpen] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          from: 'bot',
          text: 'Xin chào! Tôi là trợ lý thư viện. Bạn cần giúp gì?',
        },
      ]);
    }
  }, [open, messages.length]);

  const handleSend = async (text: string, payload?: string | object) => {
    if (!text.trim() && !payload) return;
    
    if (!payload) {
      setMessages((prev) => [...prev, { from: 'user', text }]);
    } else {
      const payloadObj = typeof payload === 'string' ? JSON.parse(payload) : payload;
      if (payloadObj.eventName === 'summarize') {
        setMessages((prev) => [...prev, { from: 'user', text: 'Tóm tắt sách' }]);
      } else {
        setMessages((prev) => [...prev, { from: 'user', text }]);
      }
    }
    setInput('');
  
    try {
      let requestData: any = {
        message: text,
        sessionId
      };

      if (payload) {
        const payloadObj = typeof payload === 'string' ? JSON.parse(payload) : payload;
        if (payloadObj.eventName === 'summarize') {
          requestData = {
            message: 'Tóm tắt sách',
            eventName: 'summarize',
            bookId: payloadObj.parameters.bookId,
            sessionId
          };
        }
      }

      const res = await apiService.post<ChatResponse>('/api/chat', requestData);
  
      const { data } = res;
  
      if (data.success) {
        const botMessage: Message = {
          from: 'bot',
          text: data.data.reply,
          quickReplies: data.data.quickReplies || undefined,
          cards: data.data.cards || undefined,
          options: data.data.suggestions || undefined,
        };
  
        setMessages((prev) => [...prev, botMessage]);
      } else {
        setMessages((prev) => [...prev, { from: 'bot', text: 'Xin lỗi, đã có lỗi xảy ra.' }]);
      }
    } catch (err) {
      console.error('Network error:', err);
      setMessages((prev) => [...prev, { from: 'bot', text: 'Lỗi mạng, vui lòng thử lại sau.' }]);
    }
  };
  
  const handleQuickReply = (qr: QuickReply) => {
    try {
      const parsedPayload = JSON.parse(qr.payload);
      handleSend(qr.text, parsedPayload);
    } catch (err) {
      console.error('Payload không phải JSON hợp lệ:', err);
    }
  };

  const handleGetBtn = async (url: string) => {
    const match = url.match(/\/api\/v1\/documents\/(\d+)/);
    if (match) {
      setSelectedBookId(match[1]);
      setBookDetailOpen(true);
    }
  };

  const handlePostBtn = async (payload: string, url: string) => {
    try {
      const payloadObj = typeof payload === 'string' ? JSON.parse(payload) : payload;
      
      if (url.includes('/api/v1/loans')) {
        const response = await apiService.post<LoanResponse>(url, payloadObj);
        if (response.data.success) {
          const botMessage: Message = {
            from: 'bot',
            text: response.data.message,
          };
          setMessages((prev) => [...prev, botMessage]);
        } else {
          setMessages((prev) => [...prev, { from: 'bot', text: 'Xin lỗi, đã có lỗi xảy ra.' }]);
        }
      } else {
        const response = await apiService.post<ChatResponse>(url, payloadObj);
        if (response.data.success) {
          const botMessage: Message = {
            from: 'bot',
            text: response.data.data.reply,
            quickReplies: response.data.data.quickReplies || undefined,
            cards: response.data.data.cards || undefined,
            options: response.data.data.suggestions || undefined,
          };
          setMessages((prev) => [...prev, botMessage]);
        } else {
          setMessages((prev) => [...prev, { from: 'bot', text: 'Xin lỗi, đã có lỗi xảy ra.' }]);
        }
      }
    } catch (err) {
      console.error('Error handling POST request:', err);
      setMessages((prev) => [...prev, { from: 'bot', text: 'Lỗi mạng, vui lòng thử lại sau.' }]);
    }
  };

  const handleCloseBookDetail = () => {
    setBookDetailOpen(false);
    setSelectedBookId(null);
  };

  return (
    <>
      {!open && (
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300 }}>
          <Fab color="primary" onClick={() => setOpen(true)}>
            <ChatIcon />
          </Fab>
        </Box>
      )}

      {open && (
        <Paper elevation={8} sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24, 
          width: 380, 
          height: 520, 
          display: 'flex', 
          flexDirection: 'column', 
          borderRadius: 3, 
          overflow: 'hidden', 
          zIndex: 1300 
        }}>
          <Box sx={{ 
            bgcolor: 'primary.main', 
            color: 'white', 
            p: 2, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Typography variant="h6">Trợ lý thư viện</Typography>
            <IconButton onClick={() => setOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ 
            flex: 1, 
            p: 2, 
            overflowY: 'auto', 
            bgcolor: '#f9f9f9',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#bdbdbd',
              borderRadius: '3px',
            }
          }}>
            {messages.map((msg, i) => (
              <Box 
                key={i} 
                sx={{ 
                  mb: 2.5, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: msg.from === 'user' ? 'flex-end' : 'flex-start' 
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-end', 
                  gap: 1,
                  maxWidth: '80%'
                }}>
                  {msg.from === 'bot' && (
                    <Avatar 
                      src="https://th.bing.com/th/id/OIP.I9KrlBSL9cZmpQU3T2nq-AHaIZ?cb=iwp2&rs=1&pid=ImgDetMain" 
                      sx={{ width: 32, height: 32 }} 
                    />
                  )}
                  <Box sx={{ 
                    bgcolor: msg.from === 'user' ? 'primary.main' : 'grey.200', 
                    color: msg.from === 'user' ? 'white' : 'black', 
                    px: 2, 
                    py: 1.2, 
                    borderRadius: 2, 
                    wordBreak: 'break-word',
                    fontSize: 14,
                    boxShadow: 1,
                    ml: msg.from === 'bot' ? 0 : 'auto'
                  }}>
                    {msg.text}
                  </Box>
                </Box>

                {Array.isArray(msg.cards) && msg.cards.length > 0 && (
                  <Stack 
                    direction="column" 
                    spacing={1.5} 
                    mt={1.5} 
                    width="100%"
                    sx={{ mx: 'auto', mb: 2 }}
                  >
                    {msg.cards.map((card, idx) => (
                      <Paper 
                        key={idx} 
                        sx={{ 
                          p: 1.5, 
                          bgcolor: '#fff', 
                          boxShadow: 2, 
                          borderRadius: 2,
                          border: '1px solid #eee'
                        }}
                      >
                        <Typography fontWeight={600} sx={{ mb: 0.5 }}>
                          {card.title}
                        </Typography>
                        {card.subtitle && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {card.subtitle}
                          </Typography>
                        )}
                        {card.imageUrl && (
                          <img 
                            src={card.imageUrl} 
                            alt="card" 
                            style={{ 
                              width: '100%', 
                              height: 120, 
                              objectFit: 'cover', 
                              borderRadius: 8,
                              marginBottom: 12
                            }} 
                          />
                        )}
                        <Stack spacing={1.2}>
                          {card.buttons.map((btn, bidx) => (
                            <Button
                              key={bidx}
                              variant={btn.type === 'POST' ? 'contained' : 'outlined'}
                              fullWidth
                              size="small"
                              sx={{ 
                                textTransform: 'none',
                                borderRadius: 2,
                                py: 0.8
                              }}
                              onClick={() => {
                                if (btn.type === 'POST') {
                                  handlePostBtn(btn.payload, btn.url);
                                } else if (btn.type === 'GET') {
                                  handleGetBtn(btn.url);
                                }
                              }}
                            >
                              {btn.text}
                            </Button>
                          ))}
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                )}

                {Array.isArray(msg.quickReplies) && msg.quickReplies.length > 0 && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      rowGap: '10px',
                      columnGap: '8px',
                      mt: 2,
                      p: 0,
                      m: 0,
                      width: '100%',
                      justifyContent: msg.from === 'bot' ? 'flex-start' : 'flex-end',
                    }}
                  >
                    {msg.quickReplies.map((qr, j) => (
                      <Button
                        key={j}
                        variant="outlined"
                        size="small"
                        onClick={() => handleQuickReply(qr)}
                        sx={{
                          borderRadius: 4,
                          textTransform: 'none',
                          px: 2,
                          py: 0.5,
                          fontSize: 13,
                          borderWidth: 1.5,
                          minWidth: 0,
                          m: 0,
                          '&:hover': {
                            borderWidth: 1.5
                          }
                        }}
                      >
                        {qr.text}
                      </Button>
                    ))}
                  </Box>
                )}

                {Array.isArray(msg.options) && msg.options.length > 0 && (
                  <Stack
                    direction="column"
                    spacing={1}
                    mt={2}
                    width="100%"
                  >
                    {msg.options.map((opt, j) => (
                      <Button
                        key={j}
                        variant="outlined"
                        disabled
                        size="small"
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          px: 2,
                          py: 1,
                          bgcolor: '#f5f5f5',
                          color: '#333',
                          borderColor: '#e0e0e0',
                          justifyContent: 'flex-start',
                          fontSize: 13,
                          '&.Mui-disabled': {
                            color: '#666'
                          }
                        }}
                      >
                        {opt}
                      </Button>
                    ))}
                  </Stack>
                )}
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          <Box sx={{ 
            p: 1.5, 
            borderTop: '1px solid #e0e0e0', 
            display: 'flex', 
            gap: 1.5, 
            bgcolor: 'white',
            alignItems: 'center'
          }}>
            <TextField 
              fullWidth 
              size="small" 
              placeholder="Nhập tin nhắn..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)} 
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: '20px', 
                  px: 1.5,
                  fontSize: 14
                } 
              }} 
            />
            <Button 
              variant="contained" 
              onClick={() => handleSend(input)} 
              sx={{ 
                borderRadius: '20px',
                px: 2.5,
                minWidth: 'auto'
              }}
            >
              Gửi
            </Button>
          </Box>
        </Paper>
      )}

      <Dialog 
        open={bookInfoOpen} 
        onClose={() => {
          setBookInfoOpen(false);
          setSelectedBook(null);
        }}
        maxWidth="md"
        fullWidth
      >
        {selectedBook && (
          <BookInfo 
            id={selectedBook.documentId.toString()} 
            books={[selectedBook]} 
          />
        )}
      </Dialog>

      <Dialog open={bookDetailOpen} onClose={handleCloseBookDetail} maxWidth="md" fullWidth>
        {selectedBookId && (
          <BookDetail id={selectedBookId} open={bookDetailOpen} onClose={handleCloseBookDetail} />
        )}
      </Dialog>
    </>
  );
};

export default FloatingChat;