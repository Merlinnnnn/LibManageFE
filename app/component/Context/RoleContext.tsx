import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const withAuth = (WrappedComponent: any, allowedRoles: string[]) => {
  return (props: any) => {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
      // Lấy role từ session storage
      const infoString = localStorage.getItem('info');
      if(infoString === null) {
        router.replace('/home');
        return;
      }
      const info = JSON.parse(infoString); // Chuyển chuỗi thành object
      const role = info.roles; // Truy cập thuộc tính roles
      const hasPermission = role.some(r => allowedRoles.includes(r));
      // Nếu không có role hoặc role không nằm trong danh sách allowedRoles
      if (!role ||  !hasPermission) {
        // Redirect người dùng về trang chủ và không render WrappedComponent
        router.replace('/home');
      } else {
        // Cho phép render component sau khi đã xác minh quyền
        setIsAuthorized(true);
      }
    }, []);

    // Chỉ render component khi đã xác minh quyền
    if (!isAuthorized) {
      return null; // Hoặc bạn có thể hiển thị một loader trong khi chờ xác thực
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
