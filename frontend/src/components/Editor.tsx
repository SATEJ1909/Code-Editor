import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import socket from "../socket";

type Props = {
  roomId: string;
};

const CodeEditor = ({ roomId }: Props) => {
  const [code, setCode] = useState("// Start typing your code here...");
  const codeRef = useRef(code);

  const handleChange = (value: string | undefined) => {
    if (value !== undefined) {
      codeRef.current = value;
      setCode(value);
      socket.emit("code-change", { roomId, code: value });
    }
  };

  useEffect(() => {
    socket.on("code-update", (newCode: string) => {
      if (newCode !== codeRef.current) {
        setCode(newCode);
        codeRef.current = newCode;
      }
    });

    return () => {
      socket.off("code-update");
    };
  }, [roomId]);

  return (
    <Editor
      height="85vh"
      language="javascript"
      value={code}
      onChange={handleChange}
      theme="vs-dark"
    />
  );
};

export default CodeEditor ;