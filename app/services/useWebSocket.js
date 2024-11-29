import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const useWebSocket = (onMessageReceived) => {
  const stompClientRef = useRef(null);

  useEffect(() => {
    // Lấy token từ localStorage
    const token = sessionStorage.getItem('access_token')
    console.log('abc')
    if (!token) {
      console.log('No token found in localStorage');
      return;
    }

    // Tạo client STOMP với header Authorization chứa token
    const stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8009/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
    });

    stompClient.onConnect = (frame) => {
      console.log('Connected: ' + frame);
      // Đăng ký nhận thông báo
      stompClient.subscribe('/user/queue/notifications', (message) => {
        console.log('Recieved: ' + message.body);
        const notification = JSON.parse(message.body);
        onMessageReceived(notification);
      });
      stompClient.subscribe('/user/queue/loans', (message) => {
        console.log('Recieved: ' + message.body);
        const notification = JSON.parse(message.body);
        onMessageReceived(notification);
      });
    };

    stompClient.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    // Kích hoạt kết nối WebSocket
    stompClient.activate();
    stompClientRef.current = stompClient;

    // Cleanup khi component unmount
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [onMessageReceived]);

  return stompClientRef.current;
};

export default useWebSocket;
