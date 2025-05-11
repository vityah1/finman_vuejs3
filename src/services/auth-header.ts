interface User {
  accessToken: string;
  [key: string]: any;
}

export default function authHeader(): { Authorization?: string } {
  const userStr = localStorage.getItem('user');
  let user: User | null = null;
  
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      console.error('Помилка парсингу даних користувача:', e);
    }
  }
  
  if (user && user.accessToken) {
    return { Authorization: 'Bearer ' + user.accessToken };
  } else {
    return {};
  }
}
