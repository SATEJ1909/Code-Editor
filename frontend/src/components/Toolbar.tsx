import Button from "./Button";
import { useToast } from "./ToastProvider";
type Props = {
  roomId: string;
};

const Toolbar = ({ roomId }: Props) => {
  const { showToast } = useToast(); // 👈 get custom toast function

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    showToast(`Room ID Copied: ${roomId}`);
  };

  return (
    <div className="p-2 bg-gray-900 text-white flex justify-between items-center">
      <div>Room: <strong>{roomId}</strong></div>
      <Button onClick={copyRoomId}>Copy Room ID</Button>
    </div>
  );
};

export default Toolbar;
