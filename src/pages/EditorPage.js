import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import ACTIONS from "../Actions";
import Client from "../components/Client";
import Editor from "../components/Editor";
import { initSocket } from "../socket";
import {
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";

const EditorPage = () => {
  const socketRef = useRef(null);
  // useRef: react hook that helps us to store a mutable value that does not cause re-render of component when updated.
  //     If we tried to count how many times our application renders using the useState Hook, we would be caught in an infinite loop since this Hook itself causes a re-render.
  // To avoid this, we can use the useRef Hook.

  const codeRef = useRef(null);
  const location = useLocation(); // hook to get data even in another state
  const { roomId } = useParams(); //returns all our params,spelling should be same as in App.js router declaration. Directly got the room ID using destructuring
  const reactNavigator = useNavigate(); //The useNavigate hook returns a function that lets you navigate programmatically, for example after a form is submitted.
  const [clients, setClients] = useState([]);

  useEffect(() => {
    //useEffect Hook allows you to perform side effects in your components. Some examples of side effects are: fetching data, directly updating the DOM, and timers. useEffect accepts two arguments.

    const init = async () => {
      // init func
      socketRef.current = await initSocket(); // get promise from socket.js async func using await
      // error handling:
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        // func to handle all the errors in connection of socket
        console.log("socket error", e);
        toast.error("Socket connection failed, try again later."); // error msg using toast
        reactNavigator("/"); // redirects to homepage in case of error
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        // as soon as initSocket returns the promise we need to instruct the server that client has opened the page and joined , so send the rquired joining data

        roomId, // we need to send some data after joining
        username: location.state?.username, // got from home.js
        // '?' used in the newer syntax of JS which will help in avoiding error if username not found
      });

      // Listening for joined event-----------------------------------------
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          // recievd from server.js
          if (username !== location.state?.username) {
            // notifiy everyone of tht joining of the new member except him
            toast.success(`${username} joined the room.`);
            console.log(`${username} joined`);
          }
          setClients(clients); // setting the clients-list, to get the names/avatar of clients name under the connected tab
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      // Listening for disconnected event-------------------------
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
        // state updation
        setClients((prev) => {
          // remaking/ filtering the clients list. (after removal)
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };
    init(); // called init

    // cleaning function- to clear listeners- prevents memory leak
    return () => {
      // function returned in useEffect
      socketRef.current.disconnect(); // socket connection needs to be disconnected
      socketRef.current.off(ACTIONS.JOINED); // unsubcribe the joining event
      socketRef.current.off(ACTIONS.DISCONNECTED); // unsubcribe the disconnected event
    };
  }, []); // this empty array is dependancy array.  It simply means that the hook will only trigger once when the component is first rendered. So for example, for useEffect it means the callback will run once at the beginning of the lifecycle of the component and never again

  async function copyRoomId() {
    // room ID copyfunction
    try {
      await navigator.clipboard.writeText(roomId); // navigator api
      // can be used to get camera, microphone and text copying
      toast.success("Room ID has been copied to your clipboard");
    } catch (err) {
      toast.error("Could not copy the Room ID"); // error msg
      console.error(err);
    }
  }

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img className="logoImage" src="/code-pal2.png" alt="logo" />
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        {/* room ID btn */}
        <button className="btn copyBtn" onClick={copyRoomId}>
          Copy ROOM ID
        </button>

        {/* Leave room btn */}
        <button className="btn leaveBtn" onClick={leaveRoom}>
          Leave
        </button>
      </div>
      <div className="editorWrap">
        <Editor // passed the props: socketRef with room ID & a fucntion
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => {
            codeRef.current = code;
          }}
        />
      </div>
    </div>
  );
};

export default EditorPage;
