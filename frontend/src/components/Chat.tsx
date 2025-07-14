import { useEffect, useState } from "react";
import socket from "../socket";
import Button from "./Button";
import Input from "./Input";
type Props = {
  roomId: string;
  username: string;
};

const Chat = ({ roomId, username }: Props) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ username: string; message: string; timestamp: number; }[]>([]);

  useEffect(() => {
    socket.on("chat-receive", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("chat-receive");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("chat-message", { roomId, message, username });
      setMessage("");
    }
  };

  return (
    <div className="h-full flex flex-col p-2 border-l bg-gray-100">
      <div className="flex-grow overflow-y-auto space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className="text-sm">
            <strong>{msg.username}</strong>: {msg.message}
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  );
};

export default Chat;