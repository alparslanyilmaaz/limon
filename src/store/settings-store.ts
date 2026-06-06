import { create } from "zustand";

interface SettingsStore {
	followRedirects: boolean;
	verifySsl: boolean;
	proxyUrl: string;
	timeout: number;
	maxRedirects: number;
	userAgent: string;
	responseSizeLimit: number;
	setFollowRedirects: (v: boolean) => void;
	setVerifySsl: (v: boolean) => void;
	setProxyUrl: (v: string) => void;
	setTimeout: (v: number) => void;
	setMaxRedirects: (v: number) => void;
	setUserAgent: (v: string) => void;
	setResponseSizeLimit: (v: number) => void;
}

const stored = <T>(key: string, fallback: T): T => {
	const raw = localStorage.getItem(key);
	if (raw === null) return fallback;
	try { return JSON.parse(raw) as T; } catch { return fallback; }
};

const persist = <T>(key: string, value: T) =>
	localStorage.setItem(key, JSON.stringify(value));

export const useSettingsStore = create<SettingsStore>((set) => ({
	followRedirects: stored("limon-follow-redirects", true),
	verifySsl: stored("limon-verify-ssl", false),
	proxyUrl: stored("limon-proxy-url", ""),
	timeout: stored("limon-timeout", 30000),
	maxRedirects: stored("limon-max-redirects", 10),
	userAgent: stored("limon-user-agent", ""),
	responseSizeLimit: stored("limon-response-size-limit", 10),
	setFollowRedirects: (v) => { persist("limon-follow-redirects", v); set({ followRedirects: v }); },
	setVerifySsl: (v) => { persist("limon-verify-ssl", v); set({ verifySsl: v }); },
	setProxyUrl: (v) => { persist("limon-proxy-url", v); set({ proxyUrl: v }); },
	setTimeout: (v) => { persist("limon-timeout", v); set({ timeout: v }); },
	setMaxRedirects: (v) => { persist("limon-max-redirects", v); set({ maxRedirects: v }); },
	setUserAgent: (v) => { persist("limon-user-agent", v); set({ userAgent: v }); },
	setResponseSizeLimit: (v) => { persist("limon-response-size-limit", v); set({ responseSizeLimit: v }); },
}));
