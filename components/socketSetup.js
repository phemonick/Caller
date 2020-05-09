import io from 'socket.io-client';

const SocketServer = 'http://50e40371.ngrok.io';

const connectionConfig = {
  transports: ['websocket'],
};

export const socket = io(SocketServer, connectionConfig);
