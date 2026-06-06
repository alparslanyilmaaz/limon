import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useRequestStore, type BodyType } from "../../../store/request-store";

const BODY_TYPES: BodyType[] = ["none", "raw", "json"];

const BodyTypeSelect = ({ value, onChange }: { value: BodyType; onChange: (v: BodyType) => void }) => {
	const [open, setOpen] = useState(false);
	const [highlighted, setHighlighted] = useState<number>(-1);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [open]);

	const handleOpen = () => {
		setHighlighted(BODY_TYPES.indexOf(value));
		setOpen((o) => !o);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!open) {
			if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				setHighlighted(BODY_TYPES.indexOf(value));
				setOpen(true);
			}
			return;
		}
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setHighlighted((h) => (h + 1) % BODY_TYPES.length);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setHighlighted((h) => (h - 1 + BODY_TYPES.length) % BODY_TYPES.length);
		} else if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			if (highlighted >= 0) { onChange(BODY_TYPES[highlighted]); }
			setOpen(false);
		} else if (e.key === "Escape") {
			setOpen(false);
		}
	};

	return (
		<div ref={ref} className="relative self-start shrink-0">
			<button
				onClick={handleOpen}
				onKeyDown={handleKeyDown}
				className="flex items-center gap-1.5 bg-elevated border border-border text-fg text-sm rounded-lg px-3 py-1.5 outline-none hover:border-primary focus:border-primary transition-colors cursor-pointer"
			>
				{value}
				<ChevronDown size={12} className="text-muted" />
			</button>
			{open && (
				<div className="absolute top-full left-0 mt-1 z-50 bg-surface border border-border rounded-lg shadow-lg overflow-hidden min-w-full">
					{BODY_TYPES.map((t, i) => (
						<button
							key={t}
							onMouseEnter={() => setHighlighted(i)}
							onMouseDown={() => { onChange(t); setOpen(false); }}
							className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${i === highlighted ? "bg-elevated" : ""} ${t === value ? "text-primary" : "text-fg"}`}
						>
							{t}
						</button>
					))}
				</div>
			)}
		</div>
	);
};

export const BodyTab = () => {
	const { bodyType, body, setBodyType, setBody } = useRequestStore();

	return (
		<div className="flex flex-col gap-3 h-full">
			<BodyTypeSelect value={bodyType} onChange={setBodyType} />

			{bodyType === "none" && (
				<p className="text-sm text-muted">No body.</p>
			)}

			{(bodyType === "raw" || bodyType === "json") && (
				<textarea
					value={body}
					onChange={(e) => setBody(e.target.value)}
					placeholder={bodyType === "json" ? '{ "key": "value" }' : "Enter request body..."}
					spellCheck={false}
					className="flex-1 bg-elevated hover:bg-border-soft focus:bg-border-soft border border-border focus:border-primary outline-none px-3 py-2 rounded-lg text-fg placeholder:text-muted transition-colors text-sm font-mono resize-none"
				/>
			)}
		</div>
	);
};
