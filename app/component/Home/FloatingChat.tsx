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
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';

type Message = {
  from: 'user' | 'bot';
  text: string;
  options?: string[]; // Lưu các lựa chọn gợi ý dưới dạng string[]
};

const FloatingChat: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId] = useState(`session-${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Welcome message
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          from: 'bot',
          text: 'Xin chào! Tôi là trợ lý thư viện. Bạn cần giúp gì?',
          options: [
            'Cách mượn sách vật lý',
            'Cách mượn sách điện tử',
            'Tra cứu sách trong thư viện',
          ],
        },
      ]);
    }
  }, [open]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { from: 'user', text }]);
    setInput('');

    try {
      const res = await fetch('/api/dialogflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId,
        }),
      });

      const data = await res.json();
      console.log('Phản hồi từ Dialogflow:', data);

      // Tạo message bot với câu trả lời và các lựa chọn (nếu có)
      const botMessage: Message = {
        from: 'bot',
        text: data.reply || 'Tôi chưa hiểu ý bạn.',
        options: data.suggestions || undefined,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Lỗi gửi tin:', error);
      setMessages((prev) => [
        ...prev,
        {
          from: 'bot',
          text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        },
      ]);
    }
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
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 360,
            height: 480,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            zIndex: 1300,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6">Trợ lý Thư viện</Typography>
            <IconButton onClick={() => setOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              p: 2,
              overflowY: 'auto',
              bgcolor: '#f9f9f9',
            }}
          >
            {messages.map((msg, i) => (
              <Box
                key={i}
                sx={{
                  mb: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.from === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Box
                  sx={{
                    bgcolor: msg.from === 'user' ? 'primary.light' : 'grey.200',
                    color: msg.from === 'user' ? 'white' : 'text.primary',
                    px: 2,
                    py: 1,
                    borderRadius:
                      msg.from === 'user'
                        ? '18px 18px 4px 18px'
                        : '18px 18px 18px 4px',
                    maxWidth: '80%',
                    wordBreak: 'break-word',
                  }}
                >
                  <Typography>{msg.text}</Typography>
                </Box>

                {/* Hiển thị options dưới dạng các nút lựa chọn nếu có */}
                {msg.options && (
                  <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                    {msg.options.map((option, j) => (
                      <Button
                        key={j}
                        variant="outlined"
                        size="small"
                        onClick={() => handleSend(option)}
                        sx={{ mt: 1 }}
                      >
                        {option}
                      </Button>
                    ))}
                  </Stack>
                )}
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box
            sx={{
              p: 1.5,
              borderTop: '1px solid #ddd',
              display: 'flex',
              gap: 1,
              bgcolor: 'white',
            }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '18px',
                  px: 1.5,
                },
              }}
            />
            <Button
              variant="contained"
              onClick={() => handleSend(input)}
              sx={{ borderRadius: '18px' }}
            >
              Gửi
            </Button>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default FloatingChat;
