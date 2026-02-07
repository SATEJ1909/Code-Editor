/**
 * Monaco Code Editor with collaborative features
 * Supports real-time sync, remote cursors, and language switching
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import Editor from '@monaco-editor/react';
import type { OnMount, OnChange } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useSocket } from '../contexts/SocketContext';

interface RemoteCursor {
    id: string;
    username: string;
    color: string;
    cursor: { lineNumber: number; column: number };
}

interface CodeEditorProps {
    initialCode?: string;
    language: string;
    onCodeChange?: (code: string) => void;
    onLanguageChange?: (language: string) => void;
    readOnly?: boolean;
}

// Supported languages with display names
export const LANGUAGES = [
    { id: 'javascript', name: 'JavaScript' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'python', name: 'Python' },
    { id: 'java', name: 'Java' },
    { id: 'cpp', name: 'C++' },
    { id: 'c', name: 'C' },
    { id: 'csharp', name: 'C#' },
    { id: 'go', name: 'Go' },
    { id: 'rust', name: 'Rust' },
    { id: 'ruby', name: 'Ruby' },
    { id: 'php', name: 'PHP' },
    { id: 'html', name: 'HTML' },
    { id: 'css', name: 'CSS' },
    { id: 'json', name: 'JSON' },
    { id: 'markdown', name: 'Markdown' },
    { id: 'sql', name: 'SQL' },
    { id: 'plaintext', name: 'Plain Text' },
];

export default function CodeEditor({
    initialCode = '// Start coding here...\n',
    language,
    onCodeChange,
    readOnly = false,
}: CodeEditorProps) {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
    const decorationsRef = useRef<string[]>([]);
    const { socket, sendCodeChange, sendCursorMove, sendTypingStart, sendTypingStop } = useSocket();
    const [remoteCursors, setRemoteCursors] = useState<Map<string, RemoteCursor>>(
        new Map()
    );
    const isRemoteChangeRef = useRef(false);

    // Handle editor mount
    const handleEditorMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        // Track cursor position changes
        editor.onDidChangeCursorPosition((e) => {
            if (!isRemoteChangeRef.current) {
                sendCursorMove({
                    lineNumber: e.position.lineNumber,
                    column: e.position.column,
                });
            }
        });
    };

    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isTypingRef = useRef(false);

    // Handle local code changes with debouncing
    const handleChange: OnChange = useCallback(
        (value) => {
            if (isRemoteChangeRef.current) return;

            const code = value || '';
            onCodeChange?.(code);

            // Signal that we started typing
            if (!isTypingRef.current) {
                isTypingRef.current = true;
                sendTypingStart();
            }

            // Clear previous typing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Stop typing after 1 second of inactivity
            typingTimeoutRef.current = setTimeout(() => {
                isTypingRef.current = false;
                sendTypingStop();
            }, 1000);

            // Debounced sync to server (300ms)
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
            debounceTimeoutRef.current = setTimeout(() => {
                sendCodeChange(code);
            }, 300);
        },
        [onCodeChange, sendCodeChange, sendTypingStart, sendTypingStop]
    );

    // Listen for remote code updates
    useEffect(() => {
        if (!socket) return;

        const handleCodeUpdate = (data: { code: string; language?: string }) => {
            if (editorRef.current && data.code !== editorRef.current.getValue()) {
                isRemoteChangeRef.current = true;
                const position = editorRef.current.getPosition();
                editorRef.current.setValue(data.code);
                if (position) {
                    editorRef.current.setPosition(position);
                }
                isRemoteChangeRef.current = false;
            }
        };

        const handleCursorUpdate = (data: RemoteCursor) => {
            setRemoteCursors((prev) => {
                const next = new Map(prev);
                next.set(data.id, data);
                return next;
            });
        };

        const handleUserLeft = (data: { id: string }) => {
            setRemoteCursors((prev) => {
                const next = new Map(prev);
                next.delete(data.id);
                return next;
            });
        };

        socket.on('code-update', handleCodeUpdate);
        socket.on('cursor-update', handleCursorUpdate);
        socket.on('user-left', handleUserLeft);

        return () => {
            socket.off('code-update', handleCodeUpdate);
            socket.off('cursor-update', handleCursorUpdate);
            socket.off('user-left', handleUserLeft);
        };
    }, [socket]);

    // Render remote cursors as decorations
    useEffect(() => {
        if (!editorRef.current || !monacoRef.current) return;

        const editor = editorRef.current;
        const monaco = monacoRef.current;

        const decorations: editor.IModelDeltaDecoration[] = [];

        remoteCursors.forEach((cursor) => {
            if (!cursor.cursor) return;

            // Cursor line decoration
            decorations.push({
                range: new monaco.Range(
                    cursor.cursor.lineNumber,
                    cursor.cursor.column,
                    cursor.cursor.lineNumber,
                    cursor.cursor.column + 1
                ),
                options: {
                    className: 'remote-cursor',
                    beforeContentClassName: 'remote-cursor-line',
                    hoverMessage: { value: cursor.username },
                    stickiness:
                        monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
                },
            });

            // Username label
            decorations.push({
                range: new monaco.Range(
                    cursor.cursor.lineNumber,
                    cursor.cursor.column,
                    cursor.cursor.lineNumber,
                    cursor.cursor.column
                ),
                options: {
                    after: {
                        content: ` ${cursor.username}`,
                        inlineClassName: 'remote-cursor-label',
                        cursorStops: monaco.editor.InjectedTextCursorStops.None,
                    },
                },
            });
        });

        // Apply decorations
        decorationsRef.current = editor.deltaDecorations(
            decorationsRef.current,
            decorations
        );
    }, [remoteCursors]);

    return (
        <div className="editor-container">
            <Editor
                height="100%"
                language={language}
                value={initialCode}
                theme="vs-dark"
                onChange={handleChange}
                onMount={handleEditorMount}
                options={{
                    fontSize: 14,
                    fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                    fontLigatures: true,
                    minimap: { enabled: true },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    renderLineHighlight: 'all',
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    smoothScrolling: true,
                    readOnly,
                    padding: { top: 16 },
                }}
            />
        </div>
    );
}
