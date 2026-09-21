export const isAuthenticated = () => Boolean(localStorage.getItem('inspire_token'));

export const logout = () => {
  localStorage.removeItem('inspire_token');
  window.location.href = '/login';
};
