import { create } from "zustand";

export const THEMES = [
	{ id: "light", label: "Light", bg: "#f8fafc", surface: "#ffffff", primary: "#3b82f6", fg: "#0f172a" },
	{ id: "dark", label: "Dark", bg: "#0d1117", surface: "#161b22", primary: "#388bfd", fg: "#e6edf3" },
	{ id: "monokai", label: "Monokai", bg: "#272822", surface: "#2c2d27", primary: "#66d9e8", fg: "#f8f8f2" },
	{ id: "catppuccin", label: "Catppuccin", bg: "#1e1e2e", surface: "#181825", primary: "#89b4fa", fg: "#cdd6f4" },
	{ id: "dracula", label: "Dracula", bg: "#282a36", surface: "#21222c", primary: "#bd93f9", fg: "#f8f8f2" },
	{ id: "solarized", label: "Solarized", bg: "#002b36", surface: "#073642", primary: "#268bd2", fg: "#839496" },
] as const;

export type ThemeId = typeof THEMES[number]["id"];

interface ThemeStore {
	theme: ThemeId;
	setTheme: (theme: ThemeId) => void;
	compact: boolean;
	setCompact: (compact: boolean) => void;
}

const stored = (localStorage.getItem("limon-theme") ?? "light") as ThemeId;
const storedCompact = localStorage.getItem("limon-compact") === "true";
document.documentElement.setAttribute("data-theme", stored);
if (storedCompact) document.documentElement.setAttribute("data-compact", "true");

export const useThemeStore = create<ThemeStore>((set) => ({
	theme: stored,
	setTheme: (theme) => {
		document.documentElement.setAttribute("data-theme", theme);
		localStorage.setItem("limon-theme", theme);
		set({ theme });
	},
	compact: storedCompact,
	setCompact: (compact) => {
		if (compact) {
			document.documentElement.setAttribute("data-compact", "true");
		} else {
			document.documentElement.removeAttribute("data-compact");
		}
		localStorage.setItem("limon-compact", String(compact));
		set({ compact });
	},
}));
