/**
 * Output Panel Component
 * Displays code execution results with stdout, stderr, and status
 */

interface ExecutionResult {
    language: string;
    version: string;
    output: string;
    stdout: string;
    stderr: string;
    exitCode: number;
    signal: string | null;
}

interface OutputPanelProps {
    isExecuting: boolean;
    result: ExecutionResult | null;
    error: string | null;
    onClose: () => void;
}

export default function OutputPanel({
    isExecuting,
    result,
    error,
    onClose,
}: OutputPanelProps) {
    const hasError = error || (result && result.exitCode !== 0);
    const hasOutput = result && (result.stdout || result.stderr || result.output);

    return (
        <div className="output-panel">
            <div className="output-header">
                <div className="output-title">
                    <span className="output-icon">
                        {isExecuting ? '⏳' : hasError ? '❌' : '✅'}
                    </span>
                    <span>Output</span>
                    {result && (
                        <span className="output-language">
                            {result.language} {result.version}
                        </span>
                    )}
                </div>
                <button className="output-close-btn" onClick={onClose} title="Close">
                    ✕
                </button>
            </div>

            <div className="output-content">
                {isExecuting ? (
                    <div className="output-loading">
                        <div className="loading-spinner" />
                        <span>Running code...</span>
                    </div>
                ) : error ? (
                    <div className="output-error">
                        <span className="error-label">Error</span>
                        <pre>{error}</pre>
                    </div>
                ) : result ? (
                    <>
                        {result.stdout && (
                            <div className="output-section">
                                <pre className="output-stdout">{result.stdout}</pre>
                            </div>
                        )}
                        {result.stderr && (
                            <div className="output-section output-stderr-section">
                                <span className="stderr-label">stderr</span>
                                <pre className="output-stderr">{result.stderr}</pre>
                            </div>
                        )}
                        {!result.stdout && !result.stderr && result.output && (
                            <div className="output-section">
                                <pre className="output-stdout">{result.output}</pre>
                            </div>
                        )}
                        {!hasOutput && (
                            <div className="output-empty">
                                <span>No output</span>
                            </div>
                        )}
                        <div className="output-footer">
                            <span className={`exit-code ${result.exitCode === 0 ? 'success' : 'error'}`}>
                                Exit code: {result.exitCode}
                            </span>
                            {result.signal && (
                                <span className="signal">Signal: {result.signal}</span>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="output-empty">
                        <span>Click "Run" to execute your code</span>
                    </div>
                )}
            </div>
        </div>
    );
}
