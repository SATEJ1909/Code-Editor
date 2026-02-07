/**
 * User List Component
 * Shows online users in the current room with their cursor colors
 */

import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';

export default function UserList() {
    const { roomUsers, typingUsers } = useSocket();
    const { user } = useAuth();

    return (
        <div className="user-list">
            <div className="user-list-header">
                <h3>👥 Users</h3>
                <span className="online-badge">{roomUsers.length}</span>
            </div>

            <div className="user-list-items">
                {roomUsers.map((roomUser) => {
                    const isTyping = typingUsers.has(roomUser.id);
                    return (
                        <div
                            key={roomUser.id}
                            className={`user-item ${roomUser.id === user?.id ? 'current-user' : ''}`}
                        >
                            <div
                                className="user-avatar"
                                style={{ backgroundColor: roomUser.color }}
                            >
                                {roomUser.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-info">
                                <span className="user-name">
                                    {roomUser.username}
                                    {roomUser.id === user?.id && ' (you)'}
                                </span>
                                <span
                                    className={`user-status ${isTyping ? 'typing' : ''}`}
                                    style={{ color: roomUser.color }}
                                >
                                    {isTyping ? '✏️ typing...' : '● Online'}
                                </span>
                            </div>
                        </div>
                    );
                })}

                {roomUsers.length === 0 && (
                    <div className="user-list-empty">
                        <p>No users in room</p>
                    </div>
                )}
            </div>
        </div>
    );
}
