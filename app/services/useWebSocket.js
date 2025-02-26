import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const useWebSocket = (onMessageReceived) => {
  const stompClientRef = useRef(null);

  useEffect(() => {
    // Lấy token từ sessionStorage
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      console.log('No token found in sessionStorage');
      return;
    }

    // Tạo client STOMP
    const stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8009/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000, // Đảm bảo tự động reconnect
    });

    // Hàm đăng ký và xử lý thông báo
    const subscribeToChannel = (channel, onMessage) => {
      stompClient.subscribe(channel, (message) => {
        const notification = JSON.parse(message.body);
        onMessage(notification);
      });
    };

    // Hàm xử lý kết nối thành công
    stompClient.onConnect = (frame) => {
      console.log('Connected:', frame);
      // Đăng ký nhận thông báo từ nhiều kênh khác nhau
      subscribeToChannel('/user/queue/notifications', onMessageReceived);
      subscribeToChannel('/user/queue/loans', onMessageReceived);
    };

    // Hàm xử lý lỗi của broker
    stompClient.onStompError = (frame) => {
      console.log('Broker error:', frame.headers['message']);
      console.log('Details:', frame.body);
    };

    // Kích hoạt kết nối
    stompClient.activate();
    stompClientRef.current = stompClient;

    // Cleanup khi component unmount
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [onMessageReceived]); // Chỉ gọi lại effect nếu `onMessageReceived` thay đổi

  return stompClientRef.current;
};

export default useWebSocket;
