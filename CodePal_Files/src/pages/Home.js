import React, { useState } from "react"; // rafce: boilerplate command
import { v4 as uuidV4 } from "uuid"; // uuid package downloaded to generate a unique id
import toast from "react-hot-toast"; // to show the room creation notification
import { useNavigate } from "react-router-dom"; // for redirection

const Home = () => {
  const [roomID, setRoomID] = useState("");
  const [username, setUsername] = useState("");

  const navigate = useNavigate(); // redirection

  const createNewRoom = (e) => {
    e.preventDefault(); // to stop reloading of page when clicked on anchor tag
    const id = uuidV4();
    setRoomID(id);
    toast.success("Created a new room"); // success for green tick
  };

  const joinRoom = () => {
    if (!roomID || !username) {
      toast.error("Room ID & Username is required");
      return;
    }

    // Redirect
    navigate(`/editor/${roomID}`, {
      state: {
        /* to access the username variable even in another state */
        username, // recieved in EditorPage.js use useLocation hook
      },
    });
  };

  const handleInputEnter = (e) => {
    // to join room even on pressing enter
    if (e.code === "Enter") {
      joinRoom();
    }
  };
  return (
    <div className="homePageWrapper">
      <div className="formWrapper">
        <img className="homePageLogo" src="/code-pal.png" alt="code-pal-logo" />
        <h4 className="mainLabel">Paste invitation ROOM ID </h4>
        <div className="input-group">
          <input
            type="text"
            className="inputBox"
            placeholder="ROOM ID"
            onChange={(e) => setRoomID(e.target.value)} // when we want to manually write the room id, then roomID variable is changed to that only
            value={roomID}
            // But, if we want to generate a new room automatically, then it can be done using the uuid funtion with useState Hook.
            onKeyUp={handleInputEnter}
          />

          <input
            type="text"
            className="inputBox"
            placeholder="USERNAME"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            onKeyUp={handleInputEnter}
          />

          <button className="btn joinBtn" onClick={joinRoom}>
            Join
          </button>
          {/* Two classes given to this button, to keep a general styple and a specific for join button only */}

          <span className="createInfo">
            If you don't have an invite then create &nbsp;
            <a onClick={createNewRoom} href="" className="createNewBtn">
              new room
            </a>
          </span>
        </div>
      </div>

      <footer>
        <h4>
          Built with 💛 by &nbsp;
          <a href="https://github.com/ron2111" target="/blank">
            Rohan Sharma
          </a>
        </h4>
      </footer>
    </div>
  );
};

export default Home;
