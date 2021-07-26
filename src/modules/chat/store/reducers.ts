import { Actions } from 'modules/chat/store/actions';
import { State } from 'modules/chat/store/state';

export interface Action {
  type: string;
  payload?: any;
}

export interface Reducer<T> {
  (state: T, action: Action): T;
}

export const reducer: Reducer<State> = (
  state: State,
  action: Action,
): State => {
  // Connect socket
  if (action.type === Actions.CONNECT) {
    const { id, client } = action.payload;
    const { sockets } = state;

    // Remove user info from socket and disconnect
    if (sockets[id]) {
      delete sockets[id].data.user;
      sockets[id].disconnect(true);
    }

    // add new socket
    sockets[id] = client;

    return state;
  }

  // Disconnect socket
  if (action.type === Actions.DISCONNECT) {
    const id = action.payload;
    const { sockets } = state;

    // Remove user info from socket and disconnect
    if (sockets[id]) {
      delete sockets[id].data.user;
      sockets[id].disconnect(true);
    }

    delete sockets[id];

    return state;
  }

  // Send private message
  if (action.type === Actions.PRIVATE_MESSAGE) {
    console.log('private message action');
    const { user, contact, message } = action.payload;
    const { sockets } = state;
    const socket = sockets[contact];

    if (!socket) {
      console.log('Socket not found');
      return state;
    }

    // emmit event
    socket.emit('private-message', {
      user,
      message,
    });

    return state;
  }

  // Send public message
  if (action.type === Actions.PUBLIC_MESSAGE) {
    const { from, message } = action.payload;
    const { server } = state;

    if (!server) {
      throw new Error('Server was not initialized');
    }

    server.emit('public-message', {
      from,
      message,
    });

    return state;
  }

  // Set server
  if (action.type === Actions.SET_SERVER) {
    return {
      ...state,
      server: action.payload,
    };
  }

  return state;
};
