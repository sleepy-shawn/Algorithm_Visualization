export const environment = {
  production: false,
  apiUrl: '/api',
  rtcIceServers: [
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: 'stun:stun.l.google.com:19302' },
  ] as RTCIceServer[],
};
