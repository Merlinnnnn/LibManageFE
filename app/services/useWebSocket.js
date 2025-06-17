import { useEffect, useRef, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { API_BASE_URL } from '../untils/apiConfig';

const useWebSocket = (onMessageReceived) => {
  const stompClientRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;

  const messageHandler = useCallback(
    (message) => {
      try {
        // Parse message từ _body nếu là binary message
        const messageBody = message._body || message.body;
        const parsedMessage = JSON.parse(messageBody);
        console.log('Parsed message:', parsedMessage);

        // Kiểm tra nếu là loan message (có transactionId)
        if (parsedMessage.transactionId) {
          console.log('Loan message received, forwarding to handler');
          onMessageReceived(parsedMessage);
        } else {
          // Xử lý notification
          const userInfo = JSON.parse(localStorage.getItem('info') || '{}');
          if (parsedMessage.username === userInfo.username) {
            onMessageReceived(parsedMessage);
          }
        }
      } catch (err) {
        console.error('Error parsing message:', err);
        console.error('Raw message:', message);
      }
    },
    [onMessageReceived]
  );

  useEffect(() => {
    if (stompClientRef.current) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('Không tìm thấy token trong localStorage');
      return;
    }

    const wsUrl = `${API_BASE_URL}/ws?token=${token}`;
    console.log('Đang cố gắng kết nối WebSocket tới:', wsUrl);

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      debug: (str) => console.log('[STOMP]', str),
    });

    stompClient.onConnect = (frame) => {
      console.log('Đã kết nối WebSocket:', frame);
      reconnectAttemptsRef.current = 0;
      stompClient.subscribe('/user/queue/notifications', messageHandler);
      stompClient.subscribe('/user/queue/loans', messageHandler);
    };

    stompClient.onStompError = (frame) => {
      console.error('STOMP lỗi:', frame.headers['message']);
      console.error('Chi tiết:', frame.body);
    };

    stompClient.onWebSocketClose = (event) => {
      console.error('Kết nối WebSocket thất bại:', event.reason || 'Không rõ lý do');
      
      reconnectAttemptsRef.current += 1;
      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        console.warn('Đã vượt quá số lần reconnect cho phép');
        return;
      }
    };

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      if (stompClientRef.current) {
        console.log('Đang ngắt kết nối WebSocket...');
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [messageHandler]);

  return null;
};

export default useWebSocket;
