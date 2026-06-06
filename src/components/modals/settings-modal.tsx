import { Check, Globe, Palette, Settings, X } from "lucide-react";
import { useState } from "react";
import { ModalWrapperComponent } from "./modal-wrapper";
import { THEMES, useThemeStore, type ThemeId } from "../../store/theme-store";
import { useSettingsStore } from "../../store/settings-store";

type SettingsTab = "general" | "appearance" | "network";

const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
	{ id: "general", label: "General", icon: <Settings size={15} /> },
	{ id: "appearance", label: "Appearance", icon: <Palette size={15} /> },
	{ id: "network", label: "Network", icon: <Globe size={15} /> },
];

interface SettingsModalProps {
	onClose: () => void;
}

export const SettingsModal = ({ onClose }: SettingsModalProps) => {
	const [activeTab, setActiveTab] = useState<SettingsTab>("general");

	return (
		<ModalWrapperComponent onOutsideClick={onClose} width="max-w-3xl w-full" noPadding>
			<div className="flex h-135">
				<aside className="w-52 border-r border-border flex flex-col shrink-0">
					<div className="px-4 pt-5 pb-3">
						<p className="text-xs font-semibold text-muted uppercase tracking-widest">Settings</p>
					</div>
					<nav className="flex-1 overflow-y-auto px-2 pb-4 flex flex-col gap-0.5">
						{tabs.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`
									flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm w-full text-left transition-colors
									${activeTab === tab.id
										? "bg-primary-soft text-primary font-medium"
										: "text-muted hover:bg-elevated hover:text-fg"
									}
								`}
							>
								{tab.icon}
								{tab.label}
							</button>
						))}
					</nav>
				</aside>

				<div className="flex-1 flex flex-col min-w-0">
					<div className="flex items-center justify-between px-6 pt-5 pb-3 shrink-0">
						<h2 className="text-base font-semibold text-fg">
							{tabs.find((t) => t.id === activeTab)?.label}
						</h2>
						<button
							onClick={onClose}
							className="p-1.5 rounded-lg hover:bg-elevated text-muted hover:text-fg transition-colors"
						>
							<X size={15} />
						</button>
					</div>
					<div className="flex-1 overflow-y-auto px-6 pb-6">
						{activeTab === "general" && <GeneralSettings />}
						{activeTab === "appearance" && <AppearanceSettings />}
						{activeTab === "network" && <NetworkSettings />}
					</div>
				</div>
			</div>
		</ModalWrapperComponent>
	);
};

const GeneralSettings = () => {
	const { followRedirects, setFollowRedirects, verifySsl, setVerifySsl } = useSettingsStore();
	return (
		<div className="flex flex-col gap-4 pt-1">
			<SettingsRow label="Follow redirects" description="Automatically follow 3xx redirect responses">
				<Toggle on={followRedirects} onChange={setFollowRedirects} />
			</SettingsRow>
			<SettingsRow label="Verify SSL certificates" description="Reject requests with invalid or self-signed certificates">
				<Toggle on={verifySsl} onChange={setVerifySsl} />
			</SettingsRow>
		</div>
	);
};

const ThemeCard = ({ theme, selected, onSelect }: { theme: typeof THEMES[number]; selected: boolean; onSelect: () => void }) => (
	<button
		onClick={onSelect}
		className={`relative flex flex-col gap-2 p-2.5 rounded-xl border-2 transition-all text-left ${
			selected ? "border-primary" : "border-border hover:border-muted/40"
		}`}
	>
		{selected && (
			<div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
				<Check size={10} className="text-white" strokeWidth={3} />
			</div>
		)}
		{/* Mini preview */}
		<div className="rounded-lg overflow-hidden h-20 flex flex-col" style={{ background: theme.bg }}>
			{/* Top bar */}
			<div className="h-5 flex items-center gap-1 px-2" style={{ background: theme.surface }}>
				<div className="w-1.5 h-1.5 rounded-full opacity-50" style={{ background: theme.fg }} />
				<div className="flex-1 h-1 rounded-full opacity-20" style={{ background: theme.fg }} />
			</div>
			{/* Content area */}
			<div className="flex-1 flex gap-1.5 p-1.5">
				{/* Sidebar */}
				<div className="w-8 flex flex-col gap-1" style={{ background: theme.surface, borderRadius: 4, padding: 4 }}>
					<div className="h-1 rounded-full" style={{ background: theme.primary, width: "80%" }} />
					<div className="h-1 rounded-full opacity-30" style={{ background: theme.fg, width: "60%" }} />
					<div className="h-1 rounded-full opacity-30" style={{ background: theme.fg, width: "70%" }} />
				</div>
				{/* Main */}
				<div className="flex-1 flex flex-col gap-1 p-1.5" style={{ background: theme.surface, borderRadius: 4 }}>
					<div className="h-1 rounded-full" style={{ background: theme.primary, width: "60%", opacity: 0.7 }} />
					<div className="h-1 rounded-full opacity-20" style={{ background: theme.fg, width: "90%" }} />
					<div className="h-1 rounded-full opacity-20" style={{ background: theme.fg, width: "75%" }} />
				</div>
			</div>
		</div>
		<span className="text-xs font-medium text-fg text-center block">{theme.label}</span>
	</button>
);

const AppearanceSettings = () => {
	const { theme, setTheme, compact, setCompact } = useThemeStore();

	return (
		<div className="flex flex-col gap-6 pt-1">
			<div>
				<p className="text-sm font-medium text-fg mb-1">Theme</p>
				<p className="text-xs text-muted mb-4">Choose your preferred color scheme</p>
				<div className="grid grid-cols-3 gap-3">
					{THEMES.map((t) => (
						<ThemeCard
							key={t.id}
							theme={t}
							selected={theme === t.id}
							onSelect={() => setTheme(t.id as ThemeId)}
						/>
					))}
				</div>
			</div>
			<div className="border-t border-border-soft pt-4">
				<SettingsRow label="Compact mode" description="Reduce spacing to fit more content on screen">
					<Toggle on={compact} onChange={setCompact} />
				</SettingsRow>
			</div>
		</div>
	);
};

const NetworkSettings = () => {
	const {
		proxyUrl, setProxyUrl,
		timeout, setTimeout,
		maxRedirects, setMaxRedirects,
		userAgent, setUserAgent,
		responseSizeLimit, setResponseSizeLimit,
	} = useSettingsStore();
	return (
		<div className="flex flex-col gap-4 pt-1">
			<SettingsRow label="Timeout (ms)" description="Maximum wait time for a request before it fails">
				<input
					type="number"
					min={0}
					value={timeout}
					onChange={(e) => setTimeout(Number(e.target.value))}
					className="text-sm bg-elevated border border-border rounded-lg px-3 py-1.5 text-fg outline-none focus:border-primary transition-colors w-28"
				/>
			</SettingsRow>
			<SettingsRow label="Max redirects" description="Maximum number of redirects to follow before stopping">
				<input
					type="number"
					min={0}
					max={100}
					value={maxRedirects}
					onChange={(e) => setMaxRedirects(Number(e.target.value))}
					className="text-sm bg-elevated border border-border rounded-lg px-3 py-1.5 text-fg outline-none focus:border-primary transition-colors w-28"
				/>
			</SettingsRow>
			<SettingsRow label="Response size limit (MB)" description="Stop reading the response body after this many megabytes">
				<input
					type="number"
					min={1}
					max={1000}
					value={responseSizeLimit}
					onChange={(e) => setResponseSizeLimit(Number(e.target.value))}
					className="text-sm bg-elevated border border-border rounded-lg px-3 py-1.5 text-fg outline-none focus:border-primary transition-colors w-28"
				/>
			</SettingsRow>
			<SettingsRow label="User-Agent" description="Sent as the User-Agent header on every request (leave blank to omit)">
				<input
					placeholder="my-app/1.0"
					value={userAgent}
					onChange={(e) => setUserAgent(e.target.value)}
					className="text-sm bg-elevated border border-border rounded-lg px-3 py-1.5 text-fg placeholder:text-muted outline-none focus:border-primary transition-colors w-48"
				/>
			</SettingsRow>
			<SettingsRow label="Proxy URL" description="Route requests through a custom proxy server">
				<input
					placeholder="http://proxy:8080"
					value={proxyUrl}
					onChange={(e) => setProxyUrl(e.target.value)}
					className="text-sm bg-elevated border border-border rounded-lg px-3 py-1.5 text-fg placeholder:text-muted outline-none focus:border-primary transition-colors w-48"
				/>
			</SettingsRow>
		</div>
	);
};

interface SettingsRowProps {
	label: string;
	description: string;
	children: React.ReactNode;
}

const SettingsRow = ({ label, description, children }: SettingsRowProps) => (
	<div className="flex items-center justify-between gap-6 py-3 border-b border-border-soft">
		<div className="flex flex-col gap-0.5">
			<span className="text-sm font-medium text-fg">{label}</span>
			<span className="text-xs text-muted">{description}</span>
		</div>
		{children}
	</div>
);

const Toggle = ({ on: controlledOn, onChange }: { on?: boolean; onChange?: (v: boolean) => void }) => {
	const [localOn, setLocalOn] = useState(false);
	const on = controlledOn ?? localOn;
	const toggle = () => onChange ? onChange(!on) : setLocalOn((v) => !v);
	return (
		<button
			onClick={toggle}
			className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${on ? "bg-primary" : "bg-border"}`}
		>
			<span
				className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? "translate-x-4" : "translate-x-0"}`}
			/>
		</button>
	);
};
