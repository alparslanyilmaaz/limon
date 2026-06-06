import { useState } from "react";
import { Send, ChevronDown } from "lucide-react";
import { EnvVarInput } from "../env-var-input";
import { useRequestStore } from "../../store/request-store";
import { useSavedRequestStore } from "../../store/saved-request-store";
import { useThemeStore } from "../../store/theme-store";

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"] as const;
type HttpMethod = (typeof HTTP_METHODS)[number];

const METHOD_COLORS: Record<HttpMethod, string> = {
	GET: "text-emerald-600",
	POST: "text-blue-500",
	PUT: "text-amber-500",
	PATCH: "text-orange-500",
	DELETE: "text-red-500",
	HEAD: "text-purple-500",
	OPTIONS: "text-cyan-500",
};

export const Toolbar = () => {
	const { method, setMethod, url, setUrl, sendRequest, isLoading } = useRequestStore();
	const { saveCurrentRequest } = useSavedRequestStore();
	const { compact } = useThemeStore();
	const [open, setOpen] = useState(false);

	const handleSend = async () => {
		await sendRequest();
		await saveCurrentRequest();
	};

	return (
		<div className={`flex items-center gap-2 px-3 border-b border-border bg-surface shrink-0 ${compact ? "py-1" : "py-2"}`}>
			<div className="relative">
				<button
					onClick={() => setOpen((v) => !v)}
					className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-elevated hover:bg-border-soft text-xs font-semibold transition-colors min-w-22.5"
				>
					<span className={METHOD_COLORS[method as HttpMethod]}>{method}</span>
					<ChevronDown size={12} className="text-muted ml-auto" />
				</button>

				{open && (
					<div className="absolute top-full left-0 mt-1 z-20 bg-surface border border-border rounded-lg shadow-md overflow-hidden min-w-27.5">
						{HTTP_METHODS.map((m) => (
							<button
								key={m}
								onClick={() => { setMethod(m); setOpen(false); }}
								className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-elevated transition-colors ${METHOD_COLORS[m]} ${method === m ? "bg-elevated" : ""}`}
							>
								{m}
							</button>
						))}
					</div>
				)}
			</div>

			<EnvVarInput
				value={url}
				onChange={setUrl}
				placeholder="https://api.example.com/endpoint"
				className="w-full text-xs bg-elevated border border-border rounded-lg px-3 py-1.5 text-fg placeholder:text-muted outline-none focus:border-primary transition-colors"
			/>

			<button
					disabled={!url.trim() || isLoading}
					onClick={handleSend}
					className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:opacity-40"
				>
				<Send size={12} />
				{isLoading ? "Sending..." : "Send"}
			</button>
		</div>
	);
};
