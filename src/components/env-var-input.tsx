import { useRef, useMemo, useState } from "react";
import { useEnvVarStore } from "../store/env-var-store";

interface EnvVarInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	onFocus?: () => void;
}

export const EnvVarInput = ({ value, onChange, placeholder, className, onFocus }: EnvVarInputProps) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const { envVars } = useEnvVarStore();
	const [query, setQuery] = useState("");
	const [showDropdown, setShowDropdown] = useState(false);

	const getOpenBracePos = (val: string, cursor: number) => {
		const before = val.slice(0, cursor);
		const pos = before.lastIndexOf("{{");
		if (pos === -1) return -1;
		const between = before.slice(pos + 2);
		if (between.includes("}}")) return -1;
		return pos;
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		const cursor = e.target.selectionStart ?? val.length;
		const openPos = getOpenBracePos(val, cursor);

		if (openPos !== -1) {
			const q = val.slice(openPos + 2, cursor);
			setQuery(q);
			setShowDropdown(true);
		} else {
			setShowDropdown(false);
		}

		onChange(val);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Escape") setShowDropdown(false);
	};

	const handleSelect = (varName: string) => {
		const input = inputRef.current;
		if (!input) return;
		const cursor = input.selectionStart ?? value.length;
		const openPos = getOpenBracePos(value, cursor);
		if (openPos === -1) return;
		const newVal = value.slice(0, openPos) + `{{${varName}}}` + value.slice(cursor);
		onChange(newVal);
		setShowDropdown(false);
		setTimeout(() => {
			const newCursor = openPos + varName.length + 4;
			input.setSelectionRange(newCursor, newCursor);
			input.focus();
		}, 0);
	};

	const filtered = useMemo(() => {
		if (!query) return envVars;
		const lower = query.toLowerCase();
		return envVars.filter((v) => v.name.toLowerCase().includes(lower));
	}, [query, envVars]);

	return (
		<div className="relative flex-1 min-w-0">
			<input
				ref={inputRef}
				value={value}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
				onFocus={onFocus}
				placeholder={placeholder}
				className={className}
			/>
			{showDropdown && filtered.length > 0 && (
				<div className="absolute top-full left-0 mt-1 z-50 bg-surface border border-border rounded-lg shadow-lg overflow-hidden min-w-48 max-h-48 overflow-y-auto">
					{filtered.map((v) => (
						<button
							key={v.id}
							onMouseDown={(e) => { e.preventDefault(); handleSelect(v.name); }}
							className="w-full text-left px-3 py-1.5 text-xs hover:bg-elevated transition-colors flex items-center justify-between gap-4"
						>
							<span className="font-medium text-primary">{v.name}</span>
							<span className="text-muted truncate max-w-32">{v.value || "—"}</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
};
