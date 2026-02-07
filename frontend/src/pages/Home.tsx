/**
 * Home Page
 * Landing page with room creation and joining
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastProvider';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface Room {
    roomId: string;
    name: string;
    language: string;
    isPublic: boolean;
    hasPassword: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function Home() {
    const navigate = useNavigate();
    const { isAuthenticated, user, token, logout } = useAuth();
    const { showToast } = useToast();
    const [roomId, setRoomId] = useState('');
    const [roomName, setRoomName] = useState('');
    const [roomPassword, setRoomPassword] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [myRooms, setMyRooms] = useState<Room[]>([]);
    const [isLoadingRooms, setIsLoadingRooms] = useState(false);
    const [isDeletingRoom, setIsDeletingRoom] = useState<string | null>(null);

    // Fetch user's rooms
    const fetchMyRooms = useCallback(async () => {
        if (!isAuthenticated || !token) return;

        setIsLoadingRooms(true);
        try {
            const res = await fetch(`${API_URL}/room`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (res.ok && data.data) {
                setMyRooms(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
        } finally {
            setIsLoadingRooms(false);
        }
    }, [isAuthenticated, token]);

    // Fetch rooms when authenticated
    useEffect(() => {
        fetchMyRooms();
    }, [fetchMyRooms]);

    // Delete a room
    const handleDeleteRoom = async (roomIdToDelete: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this room? This cannot be undone.')) {
            return;
        }

        setIsDeletingRoom(roomIdToDelete);
        try {
            const res = await fetch(`${API_URL}/room/${roomIdToDelete}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                showToast('Room deleted successfully!', 'success');
                setMyRooms((prev) => prev.filter((r) => r.roomId !== roomIdToDelete));
            } else {
                const data = await res.json();
                showToast(data.error || 'Failed to delete room', 'error');
            }
        } catch (error) {
            showToast('Failed to delete room', 'error');
        } finally {
            setIsDeletingRoom(null);
        }
    };

    // Create a new room
    const handleCreateRoom = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setIsCreating(true);
        try {
            const res = await fetch(`${API_URL}/room`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: roomName || undefined,
                    password: roomPassword || undefined,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                const hasPasswordMsg = roomPassword ? ' (password protected)' : '';
                showToast(`Room created successfully!${hasPasswordMsg}`, 'success');
                setRoomPassword('');
                navigate(`/room/${data.data.roomId}`);
            } else {
                showToast(data.error || 'Failed to create room', 'error');
            }
        } catch (error) {
            showToast('Failed to create room', 'error');
        } finally {
            setIsCreating(false);
        }
    };

    // Join existing room by ID
    const handleJoinRoom = (e: React.FormEvent) => {
        e.preventDefault();
        if (roomId.trim()) {
            navigate(`/room/${roomId.trim()}`);
        }
    };

    // Generate random room ID for quick join
    const handleQuickCreate = () => {
        const quickId = crypto.randomUUID().slice(0, 8);
        navigate(`/room/${quickId}`);
    };

    return (
        <div className="home-page">
            <div className="home-hero">
                <h1 className="home-title">
                    <span className="gradient-text">CodeSync</span>
                </h1>
                <p className="home-subtitle">
                    Real-time collaborative code editor with live cursors and chat
                </p>
            </div>

            <div className="home-content">
                {/* User Section */}
                <div className="user-section">
                    {isAuthenticated ? (
                        <div className="user-info-bar">
                            <span className="welcome-text">
                                Welcome, <strong>{user?.username}</strong>
                            </span>
                            <button onClick={logout} className="btn btn-outline btn-sm">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <button
                                onClick={() => navigate('/login')}
                                className="btn btn-outline"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="btn btn-primary"
                            >
                                Sign Up
                            </button>
                        </div>
                    )}
                </div>

                {/* Room Actions */}
                <div className="room-actions">
                    {/* Create Room */}
                    <div className="action-card">
                        <h2>Create Room</h2>
                        <p>Start a new collaborative coding session</p>
                        <input
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder="Room name (optional)"
                            className="input"
                        />
                        <input
                            type="password"
                            value={roomPassword}
                            onChange={(e) => setRoomPassword(e.target.value)}
                            placeholder="🔒 Room password (optional)"
                            className="input"
                        />
                        {roomPassword && (
                            <p className="password-hint">🔐 This room will be password protected</p>
                        )}
                        <button
                            onClick={handleCreateRoom}
                            disabled={isCreating}
                            className="btn btn-primary btn-block"
                        >
                            {isCreating ? 'Creating...' : '➕ Create Room'}
                        </button>
                    </div>

                    {/* Join Room */}
                    <div className="action-card">
                        <h2>Join Room</h2>
                        <p>Enter a room ID to join an existing session</p>
                        <form onSubmit={handleJoinRoom}>
                            <input
                                type="text"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                placeholder="Enter room ID"
                                className="input"
                            />
                            <button
                                type="submit"
                                disabled={!roomId.trim()}
                                className="btn btn-secondary btn-block"
                            >
                                🚀 Join Room
                            </button>
                        </form>
                    </div>
                </div>

                {/* Quick Action */}
                <div className="quick-action">
                    <p>Just want to try it out?</p>
                    <button onClick={handleQuickCreate} className="btn btn-accent">
                        ⚡ Quick Start (No Login Required)
                    </button>
                </div>

                {/* My Rooms Dashboard */}
                {isAuthenticated && (
                    <div className="my-rooms-section">
                        <div className="section-header">
                            <h2>📁 My Rooms</h2>
                            <button onClick={fetchMyRooms} className="btn btn-outline btn-sm" disabled={isLoadingRooms}>
                                {isLoadingRooms ? '🔄 Refreshing...' : '🔄 Refresh'}
                            </button>
                        </div>

                        {isLoadingRooms && myRooms.length === 0 ? (
                            <div className="loading-rooms">
                                <div className="loading-spinner" />
                                <p>Loading your rooms...</p>
                            </div>
                        ) : myRooms.length === 0 ? (
                            <div className="empty-rooms">
                                <p>You haven't created any rooms yet.</p>
                                <p className="hint">Create a room above to get started!</p>
                            </div>
                        ) : (
                            <div className="rooms-grid">
                                {myRooms.map((room) => (
                                    <div
                                        key={room.roomId}
                                        className="room-card"
                                        onClick={() => navigate(`/room/${room.roomId}`)}
                                    >
                                        <div className="room-card-header">
                                            <h3 className="room-card-name">
                                                {room.hasPassword && <span title="Password protected">🔒 </span>}
                                                {room.name}
                                            </h3>
                                            <button
                                                className="btn btn-danger btn-sm btn-icon"
                                                onClick={(e) => handleDeleteRoom(room.roomId, e)}
                                                disabled={isDeletingRoom === room.roomId}
                                                title="Delete room"
                                            >
                                                {isDeletingRoom === room.roomId ? '...' : '🗑️'}
                                            </button>
                                        </div>
                                        <div className="room-card-details">
                                            <span className="room-card-id">ID: {room.roomId}</span>
                                            <span className="room-card-language">{room.language}</span>
                                        </div>
                                        <div className="room-card-footer">
                                            <span className="room-card-date">
                                                {new Date(room.updatedAt || room.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Features */}
                <div className="features-section">
                    <h2>Features</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <span className="feature-icon">👥</span>
                            <h3>Live Collaboration</h3>
                            <p>See changes in real-time as others type</p>
                        </div>
                        <div className="feature-card">
                            <span className="feature-icon">🎯</span>
                            <h3>Cursor Presence</h3>
                            <p>See where other users are editing</p>
                        </div>
                        <div className="feature-card">
                            <span className="feature-icon">💬</span>
                            <h3>Built-in Chat</h3>
                            <p>Communicate with your team in-room</p>
                        </div>
                        <div className="feature-card">
                            <span className="feature-icon">💾</span>
                            <h3>Save & Load</h3>
                            <p>Persist your code for later access</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
