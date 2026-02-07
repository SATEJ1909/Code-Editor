/**
 * Room Page
 * Main collaborative editing room with editor, chat, and user list
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastProvider';
import CodeEditor from '../components/CodeEditor';
import ChatPanel from '../components/ChatPanel';
import UserList from '../components/UserList';
import LanguageSelector from '../components/LanguageSelector';
import OutputPanel from '../components/OutputPanel';
import HistoryPanel from '../components/HistoryPanel';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface ExecutionResult {
    language: string;
    version: string;
    output: string;
    stdout: string;
    stderr: string;
    exitCode: number;
    signal: string | null;
}

export default function Room() {
    const { roomId } = useParams<{ roomId: string }>();
    const { joinRoom, leaveRoom, socket, isConnected } = useSocket();
    const { token, isAuthenticated } = useAuth();
    const { showToast } = useToast();

    const [code, setCode] = useState('// Loading...\n');
    const [language, setLanguage] = useState('javascript');
    const [roomName, setRoomName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showChat, setShowChat] = useState(true);
    const [showUsers, setShowUsers] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Code execution state
    const [showOutput, setShowOutput] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
    const [executionError, setExecutionError] = useState<string | null>(null);

    // History panel state
    const [showHistory, setShowHistory] = useState(false);

    // Load room data
    useEffect(() => {
        const loadRoom = async () => {
            if (!roomId) return;

            try {
                // Try to get room from API
                const res = await fetch(`${API_URL}/room/${roomId}`);
                const data = await res.json();

                if (res.ok && data.data) {
                    setCode(data.data.code || '// Start coding here...\n');
                    setLanguage(data.data.language || 'javascript');
                    setRoomName(data.data.name || `Room ${roomId}`);
                } else {
                    // Room doesn't exist, use defaults
                    setCode('// Start coding here...\n');
                    setRoomName(`Room ${roomId}`);
                }
            } catch (error) {
                console.error('Failed to load room:', error);
                setCode('// Start coding here...\n');
            } finally {
                setIsLoading(false);
            }
        };

        loadRoom();
    }, [roomId]);

    // Join socket room when connected
    useEffect(() => {
        if (roomId && isConnected) {
            joinRoom(roomId);

            return () => {
                leaveRoom();
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId, isConnected]);

    // Listen for language updates
    useEffect(() => {
        if (!socket) return;

        const handleLanguageUpdate = (newLanguage: string) => {
            setLanguage(newLanguage);
        };

        const handleRoomData = (data: { code: string; language: string }) => {
            if (data.code) setCode(data.code);
            if (data.language) setLanguage(data.language);
        };

        socket.on('language-update', handleLanguageUpdate);
        socket.on('room-data', handleRoomData);

        return () => {
            socket.off('language-update', handleLanguageUpdate);
            socket.off('room-data', handleRoomData);
        };
    }, [socket]);

    // Handle language change
    const handleLanguageChange = useCallback(
        (newLanguage: string) => {
            setLanguage(newLanguage);
            if (socket && roomId) {
                socket.emit('language-change', { roomId, language: newLanguage });
            }
        },
        [socket, roomId]
    );

    // Save code to backend
    const handleSave = async () => {
        if (!isAuthenticated) {
            showToast('Login to save your code', 'warning');
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch(`${API_URL}/snippet/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    roomId,
                    code,
                    language,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                showToast('Code saved!', 'success');
            } else {
                showToast(data.error || 'Failed to save', 'error');
            }
        } catch (error) {
            showToast('Failed to save code', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // Copy room link to clipboard
    const handleCopyLink = () => {
        const link = window.location.href;
        navigator.clipboard.writeText(link);
        showToast('Room link copied!', 'success');
    };

    // Download code as file
    const handleDownload = () => {
        const extensions: Record<string, string> = {
            javascript: 'js',
            typescript: 'ts',
            python: 'py',
            java: 'java',
            cpp: 'cpp',
            c: 'c',
            csharp: 'cs',
            go: 'go',
            rust: 'rs',
            ruby: 'rb',
            php: 'php',
            html: 'html',
            css: 'css',
            json: 'json',
            markdown: 'md',
            sql: 'sql',
            plaintext: 'txt',
        };
        const ext = extensions[language] || 'txt';
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Code downloaded!', 'success');
    };

    // Run code using Piston API
    const handleRunCode = async () => {
        setShowOutput(true);
        setIsExecuting(true);
        setExecutionError(null);
        setExecutionResult(null);

        try {
            const res = await fetch(`${API_URL}/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code,
                    language,
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setExecutionResult(data.data);
            } else {
                setExecutionError(data.error || 'Execution failed');
            }
        } catch (error) {
            setExecutionError('Failed to connect to execution service');
        } finally {
            setIsExecuting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner" />
                <p>Loading room...</p>
            </div>
        );
    }

    return (
        <div className="room-page">
            {/* Header */}
            <header className="room-header">
                <div className="header-left">
                    <Link to="/" className="logo-link">
                        <span className="logo-text gradient-text">CodeSync</span>
                    </Link>
                    <div className="room-info">
                        <h1 className="room-name">{roomName}</h1>
                        <span className="room-id">ID: {roomId}</span>
                    </div>
                </div>

                <div className="header-center">
                    <LanguageSelector value={language} onChange={handleLanguageChange} />
                </div>

                <div className="header-right">
                    <button
                        onClick={handleRunCode}
                        disabled={isExecuting}
                        className="btn btn-accent btn-sm"
                        title="Run code"
                    >
                        {isExecuting ? '⏳ Running...' : '▶ Run'}
                    </button>
                    <button
                        onClick={handleCopyLink}
                        className="btn btn-outline btn-sm"
                        title="Copy room link"
                    >
                        🔗 Share
                    </button>
                    <button
                        onClick={handleDownload}
                        className="btn btn-outline btn-sm"
                        title="Download code"
                    >
                        ⬇ Download
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="btn btn-primary btn-sm"
                    >
                        {isSaving ? '💾 Saving...' : '💾 Save'}
                    </button>
                    <button
                        onClick={() => setShowOutput(!showOutput)}
                        className={`btn btn-icon ${showOutput ? 'active' : ''}`}
                        title="Toggle output"
                    >
                        📤
                    </button>
                    <button
                        onClick={() => setShowHistory(true)}
                        className="btn btn-icon"
                        title="Code history"
                    >
                        📜
                    </button>
                    <button
                        onClick={() => setShowUsers(!showUsers)}
                        className={`btn btn-icon ${showUsers ? 'active' : ''}`}
                        title="Toggle users"
                    >
                        👥
                    </button>
                    <button
                        onClick={() => setShowChat(!showChat)}
                        className={`btn btn-icon ${showChat ? 'active' : ''}`}
                        title="Toggle chat"
                    >
                        💬
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="room-content">
                {/* Users Sidebar */}
                {showUsers && (
                    <aside className="sidebar sidebar-left">
                        <UserList />
                    </aside>
                )}

                {/* Editor */}
                <main className="editor-wrapper">
                    <CodeEditor
                        initialCode={code}
                        language={language}
                        onCodeChange={setCode}
                    />
                </main>

                {/* Chat Sidebar */}
                {showChat && (
                    <aside className="sidebar sidebar-right">
                        <ChatPanel />
                    </aside>
                )}
            </div>

            {/* Output Panel */}
            {showOutput && (
                <OutputPanel
                    isExecuting={isExecuting}
                    result={executionResult}
                    error={executionError}
                    onClose={() => setShowOutput(false)}
                />
            )}

            {/* History Panel */}
            <HistoryPanel
                roomId={roomId || ''}
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                onRestore={(restoredCode, restoredLanguage) => {
                    setCode(restoredCode);
                    setLanguage(restoredLanguage);
                    showToast('Code restored from history!', 'success');
                }}
            />

            {/* Connection Status */}
            <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                <span className="status-dot" />
                {isConnected ? 'Connected' : 'Reconnecting...'}
            </div>
        </div>
    );
}
