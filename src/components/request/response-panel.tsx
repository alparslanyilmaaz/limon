import { useState, useRef, useCallback, useEffect, useMemo, memo } from "react";
import { Search, X, ChevronUp, ChevronDown } from "lucide-react";
import { useRequestStore } from "../../store/request-store";

const TABS = ["Body", "Headers"] as const;
type Tab = (typeof TABS)[number];

function formatSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function statusColor(status: number): string {
	if (status < 300) return "text-emerald-500";
	if (status < 400) return "text-amber-500";
	return "text-red-500";
}

function escapeRegex(s: string) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countMatches(text: string, query: string): number {
	if (!query) return 0;
	return (text.match(new RegExp(escapeRegex(query), "gi")) ?? []).length;
}

// Uses split with a capturing group: odd indices in the result are the matched parts.
const HighlightedText = memo(({ text, query, activeIndex }: { text: string; query: string; activeIndex: number }) => {
	const regex = useMemo(
		() => (query ? new RegExp(`(${escapeRegex(query)})`, "gi") : null),
		[query]
	);

	if (!regex) return <>{text}</>;

	const parts = text.split(regex);
	let matchCount = 0;

	return (
		<>
			{parts.map((part, i) => {
				if (i % 2 === 1) {
					const idx = matchCount++;
					return (
						<mark
							key={i}
							data-match-index={idx}
							className={`rounded-sm px-px ${idx === activeIndex ? "bg-orange-400 text-black" : "bg-yellow-300 text-black"}`}
						>
							{part}
						</mark>
					);
				}
				return part;
			})}
		</>
	);
});

export const ResponsePanel = () => {
	const [tab, setTab] = useState<Tab>("Body");
	const [rawView, setRawView] = useState(false);
	const [prettyView, setPrettyView] = useState(true);
	const [searchOpen, setSearchOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [activeMatch, setActiveMatch] = useState(0);
	const searchInputRef = useRef<HTMLInputElement>(null);
	const preRef = useRef<HTMLPreElement>(null);
	const { response, error, isLoading } = useRequestStore();

	const contentType = useMemo(
		() => response?.headers.find(([k]) => k.toLowerCase() === "content-type")?.[1] ?? "",
		[response]
	);
	const isHtml = useMemo(() => contentType.includes("text/html"), [contentType]);
	const isJson = useMemo(
		() => contentType.includes("application/json") || contentType.includes("text/json"),
		[contentType]
	);
	const showRawText = !isHtml || rawView;

	const displayBody = useMemo(() => {
		if (!response) return "";
		if (isJson && prettyView) {
			try { return JSON.stringify(JSON.parse(response.body), null, 2); } catch { /* fall through */ }
		}
		return response.body;
	}, [response, isJson, prettyView]);

	const matchCount = useMemo(
		() => (showRawText && response ? countMatches(displayBody, searchQuery) : 0),
		[showRawText, response, displayBody, searchQuery]
	);

	const openSearch = useCallback(() => {
		setSearchOpen(true);
		setTimeout(() => searchInputRef.current?.focus(), 0);
	}, []);

	const closeSearch = useCallback(() => {
		setSearchOpen(false);
		setSearchQuery("");
		setActiveMatch(0);
	}, []);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "f") {
				e.preventDefault();
				if (tab === "Body" && showRawText) openSearch();
			}
			if (e.key === "Escape" && searchOpen) closeSearch();
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [tab, showRawText, searchOpen, openSearch, closeSearch]);

	useEffect(() => { setActiveMatch(0); }, [searchQuery]);

	useEffect(() => {
		if (!preRef.current || !searchQuery || matchCount === 0) return;
		preRef.current.querySelector(`[data-match-index="${activeMatch}"]`)?.scrollIntoView({ block: "nearest" });
	}, [activeMatch, searchQuery, matchCount]);

	const goNext = useCallback(() => setActiveMatch((i) => (i + 1) % matchCount), [matchCount]);
	const goPrev = useCallback(() => setActiveMatch((i) => (i - 1 + matchCount) % matchCount), [matchCount]);

	const handleSearchKey = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") { e.shiftKey ? goPrev() : goNext(); }
	};

	return (
		<div className="flex flex-col flex-1 min-w-0 min-h-0">
			<div className="flex items-center justify-between border-b border-border px-3 shrink-0">
				<div className="flex items-center">
					{TABS.map((t) => (
						<button
							key={t}
							onClick={() => setTab(t)}
							className={`px-3 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
								tab === t
									? "border-primary text-primary"
									: "border-transparent text-muted hover:text-fg"
							}`}
						>
							{t}
						</button>
					))}
				</div>

				<div className="flex items-center gap-2 text-xs text-muted">
					{response ? (
						<>
							<span className={`px-1.5 py-0.5 rounded bg-elevated font-semibold ${statusColor(response.status)}`}>
								{response.status}
							</span>
							<span>{response.elapsed_ms} ms</span>
							<span>{formatSize(response.size_bytes)}</span>
						</>
					) : (
						<>
							<span className="px-1.5 py-0.5 rounded bg-elevated">—</span>
							<span>— ms</span>
							<span>— B</span>
						</>
					)}
				</div>
			</div>

			<div className="flex-1 overflow-auto min-h-0">
				{isLoading && (
					<div className="h-full flex items-center justify-center text-muted text-xs">
						Sending...
					</div>
				)}

				{!isLoading && !response && !error && (
					<div className="h-full flex items-center justify-center text-muted text-xs">
						Send a request to see the response
					</div>
				)}

				{!isLoading && error && (
					<div className="p-3">
						<p className="text-xs text-red-500 font-mono break-all">{error}</p>
					</div>
				)}

				{!isLoading && response && tab === "Body" && (
					<div className="flex flex-col h-full">
						<div className="flex items-center gap-2 px-3 py-1.5 border-b border-border shrink-0">
							{isHtml && (
								<div className="flex items-center gap-1">
									<button
										onClick={() => setRawView(false)}
										className={`px-2 py-0.5 text-xs rounded transition-colors ${!rawView ? "bg-primary text-white" : "text-muted hover:text-fg"}`}
									>
										Preview
									</button>
									<button
										onClick={() => setRawView(true)}
										className={`px-2 py-0.5 text-xs rounded transition-colors ${rawView ? "bg-primary text-white" : "text-muted hover:text-fg"}`}
									>
										Raw
									</button>
								</div>
							)}
							{isJson && (
								<div className="flex items-center gap-1">
									<button
										onClick={() => setPrettyView(true)}
										className={`px-2 py-0.5 text-xs rounded transition-colors ${prettyView ? "bg-primary text-white" : "text-muted hover:text-fg"}`}
									>
										Pretty
									</button>
									<button
										onClick={() => setPrettyView(false)}
										className={`px-2 py-0.5 text-xs rounded transition-colors ${!prettyView ? "bg-primary text-white" : "text-muted hover:text-fg"}`}
									>
										Raw
									</button>
								</div>
							)}

							{showRawText && (
								<div className="flex items-center gap-1 ml-auto">
									{searchOpen ? (
										<>
											<input
												ref={searchInputRef}
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
												onKeyDown={handleSearchKey}
												placeholder="Search..."
												className="bg-elevated border border-border rounded px-2 py-0.5 text-xs text-fg placeholder:text-muted outline-none focus:border-primary w-40 transition-colors"
											/>
											{searchQuery && (
												<span className="text-xs text-muted whitespace-nowrap">
													{matchCount === 0 ? "No results" : `${activeMatch + 1} / ${matchCount}`}
												</span>
											)}
											<button onClick={goPrev} disabled={matchCount === 0} className="text-muted hover:text-fg disabled:opacity-30 transition-colors">
												<ChevronUp size={14} />
											</button>
											<button onClick={goNext} disabled={matchCount === 0} className="text-muted hover:text-fg disabled:opacity-30 transition-colors">
												<ChevronDown size={14} />
											</button>
											<button onClick={closeSearch} className="text-muted hover:text-fg transition-colors">
												<X size={14} />
											</button>
										</>
									) : (
										<button onClick={openSearch} className="text-muted hover:text-fg transition-colors">
											<Search size={14} />
										</button>
									)}
								</div>
							)}
						</div>

						{isHtml && !rawView ? (
							<iframe
								srcDoc={response.body}
								sandbox=""
								className="flex-1 border-none"
								title="Response"
							/>
						) : (
							<pre ref={preRef} className="flex-1 overflow-auto p-3 text-xs text-fg font-mono whitespace-pre-wrap break-all">
								<HighlightedText text={displayBody} query={searchQuery} activeIndex={activeMatch} />
							</pre>
						)}
					</div>
				)}

				{!isLoading && response && tab === "Headers" && (
					<table className="w-full text-xs">
						<tbody>
							{response.headers.map(([key, value], i) => (
								<tr key={i} className="border-b border-border">
									<td className="px-3 py-1.5 text-muted font-medium w-1/3 align-top">{key}</td>
									<td className="px-3 py-1.5 text-fg font-mono break-all">{value}</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
};
