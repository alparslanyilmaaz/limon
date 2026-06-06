import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { type KeyValuePair } from "../components/key-value";
import { useEnvVarStore } from "./env-var-store";
import { useSettingsStore } from "./settings-store";

export type BodyType = "none" | "raw" | "json";

export interface HttpResponse {
	status: number;
	headers: [string, string][];
	body: string;
	elapsed_ms: number;
	size_bytes: number;
}

export interface SavedRequestFull {
	id: number;
	folder_id: number;
	name: string;
	method: string;
	url: string;
	headers: string | null;
	body: string | null;
	body_type: string;
}

export interface RequestStore {
	method: string;
	url: string;
	params: KeyValuePair[];
	headers: KeyValuePair[];
	bodyType: BodyType;
	body: string;
	response: HttpResponse | null;
	error: string | null;
	isLoading: boolean;

	setMethod: (method: string) => void;
	setUrl: (url: string) => void;
	setParams: (params: KeyValuePair[]) => void;
	setHeaders: (headers: KeyValuePair[]) => void;
	setBodyType: (bodyType: BodyType) => void;
	setBody: (body: string) => void;
	loadSavedRequest: (request: SavedRequestFull) => Promise<void>;
	sendRequest: () => Promise<void>;
	cancelRequest: () => Promise<void>;
}

const emptyRow = (): KeyValuePair => ({ id: crypto.randomUUID(), key: "", value: "" });

function normalizeUrl(url: string): string {
	if (!url.trim()) return url;
	if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(url)) {
		return `https://${url}`;
	}
	return url;
}

function normalizeError(raw: string, timeoutMs: number): string {
	const lower = raw.toLowerCase();
	if (lower.includes("timed out") || lower.includes("deadline elapsed")) {
		return `Request timed out after ${timeoutMs}ms`;
	}
	// Strip verbose reqwest wrapper: "error sending request for url (...): <detail>"
	const match = raw.match(/error sending request for url \([^)]*\)(?:: (.+))?/is);
	if (match) {
		const detail = match[1]?.trim();
		return detail || raw;
	}
	return raw;
}

export const useRequestStore = create<RequestStore>((set, get) => ({
	method: "GET",
	url: "",
	params: [emptyRow()],
	headers: [emptyRow()],
	bodyType: "none",
	body: "",
	response: null,
	error: null,
	isLoading: false,

	loadSavedRequest: async (request) => {
		if (get().isLoading) {
			await invoke("cancel_request");
		}
		// Parse saved headers
		let headers: KeyValuePair[] = [];
		if (request.headers) {
			try {
				const parsed: [string, string][] = JSON.parse(request.headers);
				headers = parsed.map(([key, value]) => ({ id: crypto.randomUUID(), key, value }));
			} catch {}
		}
		headers.push(emptyRow());

		// Parse query params from URL
		let params: KeyValuePair[] = [];
		try {
			const parsed = new URL(request.url);
			parsed.searchParams.forEach((value, key) => {
				params.push({ id: crypto.randomUUID(), key, value });
			});
		} catch {}
		params.push(emptyRow());

		set({
			method: request.method,
			url: request.url,
			headers,
			params,
			body: request.body ?? "",
			bodyType: (request.body_type as BodyType) ?? "none",
			response: null,
			error: null,
		});
	},

	sendRequest: async () => {
		const { method, url, headers, body, bodyType } = get();
		const resolve = useEnvVarStore.getState().resolveVars;
		const { timeout, followRedirects, verifySsl, proxyUrl, maxRedirects, userAgent, responseSizeLimit } = useSettingsStore.getState();
		set({ isLoading: true, response: null, error: null });
		try {
			const activeHeaders = headers
				.filter((h) => h.key.trim())
				.map<[string, string]>((h) => [h.key, resolve(h.value)]);
			const hasBody = bodyType !== "none" && body.trim();
			const response = await invoke<HttpResponse>("send_request", {
				method,
				url: normalizeUrl(resolve(url)),
				headers: activeHeaders,
				body: hasBody ? resolve(body) : null,
				timeoutMs: timeout > 0 ? timeout : null,
				followRedirects,
				verifySsl,
				proxyUrl: proxyUrl.trim() || null,
				maxRedirects,
				userAgent: userAgent.trim() || null,
				responseSizeLimitMb: responseSizeLimit,
			});
			set({ response });
		} catch (e) {
			set({ error: normalizeError(String(e), timeout) });
		} finally {
			set({ isLoading: false });
		}
	},

	cancelRequest: async () => {
		await invoke("cancel_request");
		set({ isLoading: false });
	},
	setMethod: (method) => set({ method }),
	setUrl: (url) => set((state) => {
		let newParams: KeyValuePair[] = [];
		try {
			const parsed = new URL(url);
			parsed.searchParams.forEach((value, key) => {
				const existing = state.params.find((p) => p.key === key && p.value === value);
				newParams.push(existing ?? { id: crypto.randomUUID(), key, value });
			});
		} catch {}
		newParams.push(emptyRow());
		return { url, params: newParams };
	}),
	setParams: (params) => set((state) => {
		let parsed: URL;
		try {
			parsed = new URL(state.url);
		} catch {
			parsed = new URL("http://localhost");
		}
		parsed.search = "";
		params.filter((p) => p.key.trim()).forEach((p) => {
			parsed.searchParams.set(p.key, p.value);
		});
		return { params, url: parsed.toString() };
	}),
	setHeaders: (headers) => set({ headers }),
	setBodyType: (bodyType) => set((state) => {
		const CONTENT_TYPES: Partial<Record<BodyType, string>> = {
			json: "application/json",
			raw: "text/plain",
		};
		const contentType = CONTENT_TYPES[bodyType];
		let headers = state.headers;
		const existingIdx = headers.findIndex((h) => h.key.toLowerCase() === "content-type");

		if (!contentType) {
			if (existingIdx !== -1) {
				headers = headers.filter((_, i) => i !== existingIdx);
				if (headers.length === 0 || headers.every((h) => h.key.trim())) {
					headers = [...headers, emptyRow()];
				}
			}
		} else if (existingIdx !== -1) {
			headers = headers.map((h, i) =>
				i === existingIdx ? { ...h, value: contentType } : h
			);
		} else {
			const lastIdx = headers.length - 1;
			const last = headers[lastIdx];
			const newPair = { id: crypto.randomUUID(), key: "Content-Type", value: contentType };
			headers = last && !last.key.trim()
				? [...headers.slice(0, lastIdx), newPair, last]
				: [...headers, newPair];
		}

		return { bodyType, headers };
	}),
	setBody: (body) => set({ body }),
}));
