import { io } from "socket.io-client"; // module syntax

export const initSocket = async () => {
  const options = {
    "force new connection": true,
    reconnectionAttempt: "Infinity", // attempts to reconnect
    timeout: 10000,
    transports: ["websocket"],
  };
  return io(process.env.REACT_APP_BACKEND_URL, options); // we have to give the backend url of the server
};
