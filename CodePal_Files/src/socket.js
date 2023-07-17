import { io } from "socket.io-client"; // es module syntax

export const initSocket = async () => {
  const options = {
    "force new connection": true,
    reconnectionAttempt: "Infinity", // attempts to reconnect
    timeout: 10000,
    transports: ["websocket"],
  };
  return io(process.env.REACT_APP_BACKEND_URL, options); // we have to give the backend url of the server with options to io with the help of environment variable
  // http://localhost:5000

  // as we are using create-react-app we dont need to install .env package seperatley, just add the prefix : REACT_APP_ to the variable.
};
