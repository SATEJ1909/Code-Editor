/**
 * Language Selector Component
 * Dropdown for selecting programming language
 */

import { LANGUAGES } from './CodeEditor';

interface LanguageSelectorProps {
    value: string;
    onChange: (language: string) => void;
    disabled?: boolean;
}

export default function LanguageSelector({
    value,
    onChange,
    disabled = false,
}: LanguageSelectorProps) {
    return (
        <div className="language-selector">
            <label htmlFor="language-select">Language:</label>
            <select
                id="language-select"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="language-select"
            >
                {LANGUAGES.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                        {lang.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
