export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

export const setAccessToken = (token: string) => {
  localStorage.setItem('accessToken', token);
};

export const fetchWithApi = async (url: string, options: RequestInit = {}) => {
  const accessToken = getAccessToken();
  const headers = {
    ...options.headers,
    Authorization: accessToken ? `Bearer ${accessToken}` : "",
  };
  return fetch(url, { ...options, headers });
};
