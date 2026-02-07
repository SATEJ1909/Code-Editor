/**
 * Chat Panel Component
 * Real-time chat for room collaboration
 */

import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';

export default function ChatPanel() {
    const { chatMessages, sendChatMessage, roomUsers } = useSocket();
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            sendChatMessage(message.trim());
            setMessage('');
        }
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Get user color from room users
    const getUserColor = (userId: string) => {
        const roomUser = roomUsers.find((u) => u.id === userId);
        return roomUser?.color || '#888';
    };

    return (
        <div className="chat-panel">
            <div className="chat-header">
                <h3>💬 Chat</h3>
                <span className="user-count">{roomUsers.length} online</span>
            </div>

            <div className="chat-messages">
                {chatMessages.length === 0 ? (
                    <div className="chat-empty">
                        <p>No messages yet</p>
                        <p className="chat-empty-hint">Start the conversation!</p>
                    </div>
                ) : (
                    chatMessages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`chat-message ${msg.userId === user?.id ? 'own-message' : ''
                                }`}
                        >
                            <div className="message-header">
                                <span
                                    className="message-username"
                                    style={{ color: getUserColor(msg.userId) }}
                                >
                                    {msg.username}
                                </span>
                                <span className="message-time">{formatTime(msg.timestamp)}</span>
                            </div>
                            <div className="message-content">{msg.content}</div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    maxLength={2000}
                    className="chat-input"
                />
                <button
                    type="submit"
                    disabled={!message.trim()}
                    className="chat-send-btn"
                >
                    ➤
                </button>
            </form>
        </div>
    );
}
