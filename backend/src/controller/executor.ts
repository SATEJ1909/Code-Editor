/**
 * Code Executor Controller
 * Executes code using Piston API (free code execution service)
 */

import { Request, Response } from 'express';
import { z } from 'zod';

// Piston API base URL
const PISTON_API = 'https://emkc.org/api/v2/piston';

// Language mapping for Piston API
const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
    javascript: { language: 'javascript', version: '18.15.0' },
    typescript: { language: 'typescript', version: '5.0.3' },
    python: { language: 'python', version: '3.10.0' },
    java: { language: 'java', version: '15.0.2' },
    cpp: { language: 'c++', version: '10.2.0' },
    c: { language: 'c', version: '10.2.0' },
    csharp: { language: 'csharp', version: '6.12.0' },
    go: { language: 'go', version: '1.16.2' },
    rust: { language: 'rust', version: '1.68.2' },
    ruby: { language: 'ruby', version: '3.0.1' },
    php: { language: 'php', version: '8.2.3' },
};

// Validation schema
const executeSchema = z.object({
    code: z.string().min(1).max(50000),
    language: z.string(),
    stdin: z.string().optional(),
});

/**
 * Execute code snippet
 * POST /api/v1/execute
 */
export const executeCode = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const validation = executeSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                error: validation.error.errors.map((e) => e.message).join(', '),
            });
            return;
        }

        const { code, language, stdin } = validation.data;

        // Get language config for Piston
        const langConfig = LANGUAGE_MAP[language.toLowerCase()];
        if (!langConfig) {
            res.status(400).json({
                success: false,
                error: `Language '${language}' is not supported for execution`,
                supportedLanguages: Object.keys(LANGUAGE_MAP),
            });
            return;
        }

        // Call Piston API
        const response = await fetch(`${PISTON_API}/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                language: langConfig.language,
                version: langConfig.version,
                files: [
                    {
                        content: code,
                    },
                ],
                stdin: stdin || '',
                run_timeout: 10000, // 10 second timeout
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Piston API error:', errorText);
            res.status(502).json({
                success: false,
                error: 'Code execution service unavailable',
            });
            return;
        }

        const result = await response.json();

        // Format the response
        res.json({
            success: true,
            data: {
                language: result.language,
                version: result.version,
                output: result.run?.output || '',
                stdout: result.run?.stdout || '',
                stderr: result.run?.stderr || '',
                exitCode: result.run?.code ?? 0,
                signal: result.run?.signal || null,
            },
        });
    } catch (error) {
        console.error('Execute code error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to execute code',
        });
    }
};

/**
 * Get supported languages for execution
 * GET /api/v1/execute/languages
 */
export const getSupportedLanguages = async (
    _req: Request,
    res: Response
): Promise<void> => {
    res.json({
        success: true,
        data: Object.entries(LANGUAGE_MAP).map(([id, config]) => ({
            id,
            name: id.charAt(0).toUpperCase() + id.slice(1),
            version: config.version,
        })),
    });
};
