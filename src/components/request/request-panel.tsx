import { useState } from "react";
import { BodyTab } from "./tabs/body";
import { HeadersTab } from "./tabs/headers";
import { ParamsTab } from "./tabs/params";
import { useThemeStore } from "../../store/theme-store";

const TABS = ["Params", "Headers", "Body"] as const;
type Tab = (typeof TABS)[number];

export const RequestPanel = () => {
	const [tab, setTab] = useState<Tab>("Params");
	const { compact } = useThemeStore();

	return (
		<div className="flex flex-col flex-1 min-w-0 min-h-0">
			<div className="flex items-center border-b border-border px-3 shrink-0">
				{TABS.map((t) => (
					<button
						key={t}
						onClick={() => setTab(t)}
						className={`px-3 text-xs font-medium transition-colors border-b-2 -mb-px ${compact ? "py-1.5" : "py-2.5"} ${
							tab === t
								? "border-primary text-primary"
								: "border-transparent text-muted hover:text-fg"
						}`}
					>
						{t}
					</button>
				))}
			</div>

			<div className="flex-1 p-3 overflow-auto">
				{tab === "Params" && <ParamsTab />}
				{tab === "Headers" && <HeadersTab />}
				{tab === "Body" && <BodyTab />}

			</div>
		</div>
	);
};

