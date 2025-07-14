import { useEffect } from "react";
import { useParams } from "react-router-dom";
import CodeEditor from "../components/Editor";
import Chat from "../components/Chat";
import Toolbar from "../components/Toolbar";
import socket from "../socket";
const Room = () => {
  const { roomId } = useParams();
  const username = prompt("Enter your name") || "Guest";

  useEffect(() => {
    if (roomId) {
      socket.emit("join-room", roomId, username);
    }
  }, [roomId]);

  return (
    <div className="h-screen flex flex-col">
      <Toolbar roomId={roomId || ""} />
      <div className="flex flex-grow">
        <div className="flex-grow">
          <CodeEditor roomId={roomId || ""} />
        </div>
        <div className="w-1/4">
          <Chat roomId={roomId || ""} username={username} />
        </div>
      </div>
    </div>
  );
};

export default Room;