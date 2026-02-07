/**
 * History Panel Component
 * Displays code snippet history for a room with restore functionality
 */

import { useState, useEffect } from 'react';

interface HistoryItem {
    _id: string;
    name: string;
    language: string;
    createdAt: string;
}

interface HistoryPanelProps {
    roomId: string;
    isOpen: boolean;
    onClose: () => void;
    onRestore: (code: string, language: string) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function HistoryPanel({
    roomId,
    isOpen,
    onClose,
    onRestore,
}: HistoryPanelProps) {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRestoring, setIsRestoring] = useState<string | null>(null);

    // Fetch history when panel opens
    useEffect(() => {
        if (isOpen && roomId) {
            fetchHistory();
        }
    }, [isOpen, roomId]);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/snippet/${roomId}/history`);
            const data = await res.json();
            if (res.ok && data.data) {
                setHistory(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestore = async (snippetId: string) => {
        setIsRestoring(snippetId);
        try {
            const res = await fetch(`${API_URL}/snippet/id/${snippetId}`);
            const data = await res.json();
            if (res.ok && data.data) {
                onRestore(data.data.code, data.data.language);
                onClose();
            }
        } catch (error) {
            console.error('Failed to restore snippet:', error);
        } finally {
            setIsRestoring(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="history-panel-overlay" onClick={onClose}>
            <div className="history-panel" onClick={(e) => e.stopPropagation()}>
                <div className="history-header">
                    <h3>📜 Code History</h3>
                    <button className="output-close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="history-content">
                    {isLoading ? (
                        <div className="history-loading">
                            <div className="loading-spinner" />
                            <span>Loading history...</span>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="history-empty">
                            <p>No saved snapshots yet.</p>
                            <p className="hint">Click "Save" to create a snapshot.</p>
                        </div>
                    ) : (
                        <div className="history-list">
                            {history.map((item) => (
                                <div key={item._id} className="history-item">
                                    <div className="history-item-info">
                                        <span className="history-item-name">{item.name}</span>
                                        <div className="history-item-meta">
                                            <span className="history-item-language">{item.language}</span>
                                            <span className="history-item-date">
                                                {new Date(item.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => handleRestore(item._id)}
                                        disabled={isRestoring === item._id}
                                    >
                                        {isRestoring === item._id ? '...' : '↩ Restore'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
