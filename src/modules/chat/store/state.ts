import { Server, Socket } from 'socket.io';

export interface State {
  sockets: {
    [key: string]: Socket;
  };
  server: Server;
}

export const initialState: State = {
  sockets: {},
  server: null,
};
