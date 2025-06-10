"use client"
import { useEffect } from 'react';

function parseUserInfo(userInfoStr: string) {
  const match = userInfoStr.match(/^UserInfo\((.*)\)$/);
  if (!match) return null;
  const fields = match[1].split(/, (?=[a-zA-Z]+=)/g);
  const obj: any = {};
  fields.forEach(field => {
    const [key, value] = field.split('=');
    if (key === 'roles') {
      obj[key] = value.replace(/[\[\]]/g, '').split(',').map(v => v.trim());
    } else {
      obj[key] = decodeURIComponent(value || '');
    }
  });
  return obj;
}

const Callback = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userInfoRaw = params.get('userInfo');
    let userInfo = null;
    if (userInfoRaw) {
      userInfo = parseUserInfo(userInfoRaw);
    }
    if (token && userInfo) {
      localStorage.setItem('access_token', token);
      localStorage.setItem('info', JSON.stringify(userInfo));
      window.opener?.postMessage(
        { token, info: userInfo },
        window.location.origin
      );
      window.close();
    }
  }, []);

  return <div>Đang xác thực...</div>;
};

export default Callback; 