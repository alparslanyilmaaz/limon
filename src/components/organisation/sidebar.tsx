import { ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useOrganisationStore } from "../../store/organisation-store";
import { useEnvVarStore } from "../../store/env-var-store";
import { OrganisationProjects } from "./project";
import { EnvVarsModal } from "./env-vars-panel";

const MIN_WIDTH = 160;
const MAX_WIDTH = 480;
const COLLAPSE_THRESHOLD = 50;
const DEFAULT_WIDTH = 224;

export const OrganisationSidebar = () => {
	const { selectedOrganisation } = useOrganisationStore();
	const { loadEnvVars } = useEnvVarStore();
	const [collapsed, setCollapsed] = useState(false);
	const [width, setWidth] = useState(DEFAULT_WIDTH);
	const [showEnvVars, setShowEnvVars] = useState(false);

	const sidebarRef = useRef<HTMLDivElement>(null);
	const dragState = useRef<{ startX: number; startWidth: number } | null>(null);

	useEffect(() => {
		if (selectedOrganisation) {
			loadEnvVars(selectedOrganisation.id);
			setShowEnvVars(false);
		}
	}, [selectedOrganisation?.id]);

	const handlePointerDown = (e: React.PointerEvent) => {
		e.preventDefault();
		dragState.current = { startX: e.clientX, startWidth: width };
		(e.target as Element).setPointerCapture(e.pointerId);
	};

	const handlePointerMove = (e: React.PointerEvent) => {
		if (!dragState.current || !sidebarRef.current) return;
		const delta = e.clientX - dragState.current.startX;
		const newWidth = Math.max(COLLAPSE_THRESHOLD - 1, Math.min(MAX_WIDTH, dragState.current.startWidth + delta));
		sidebarRef.current.style.width = newWidth < COLLAPSE_THRESHOLD ? "0px" : `${newWidth}px`;
	};

	const handlePointerUp = (e: React.PointerEvent) => {
		if (!dragState.current || !sidebarRef.current) return;
		const delta = e.clientX - dragState.current.startX;
		const newWidth = Math.min(MAX_WIDTH, dragState.current.startWidth + delta);
		dragState.current = null;

		if (newWidth < COLLAPSE_THRESHOLD) {
			setCollapsed(true);
			setWidth(DEFAULT_WIDTH);
			sidebarRef.current.style.width = "";
		} else {
			const clamped = Math.max(MIN_WIDTH, newWidth);
			setCollapsed(false);
			setWidth(clamped);
			sidebarRef.current.style.width = "";
		}
	};

	if (!selectedOrganisation) return null;

	return (
		<div className="relative flex">
			<div
				ref={sidebarRef}
				style={{ width: collapsed ? 0 : width }}
				className="flex flex-col h-full border-r border-border bg-surface transition-none overflow-hidden"
			>
				<div className="flex items-center justify-between px-3 h-14 border-b border-border shrink-0">
					<span className="text-sm font-semibold text-fg truncate">
						{selectedOrganisation.name}
					</span>
					<div className="flex items-center gap-1 shrink-0">
						<button
							onClick={() => setShowEnvVars(true)}
							className="p-1.5 rounded-lg hover:bg-elevated text-muted hover:text-fg transition-colors"
							title="Environment variables"
						>
							<Settings size={14} />
						</button>
						<button
							onClick={() => setCollapsed(true)}
							className="p-1.5 rounded-lg hover:bg-elevated text-muted hover:text-fg transition-colors"
							title="Collapse"
						>
							<ChevronLeft size={14} />
						</button>
					</div>
				</div>

				<OrganisationProjects orgId={selectedOrganisation.id} />
			</div>

			{/* Drag handle */}
			{!collapsed && (
				<div
					onPointerDown={handlePointerDown}
					onPointerMove={handlePointerMove}
					onPointerUp={handlePointerUp}
					className="absolute top-0 right-0 w-1 h-full cursor-col-resize z-10 hover:bg-primary/40 active:bg-primary/60 transition-colors"
				/>
			)}

			{collapsed && (
				<button
					onClick={() => setCollapsed(false)}
					className="absolute left-0 top-3 z-10 flex items-center justify-center w-5 h-8 bg-surface border border-border rounded-r-lg text-muted hover:text-fg hover:bg-elevated transition-colors"
					title="Expand"
				>
					<ChevronRight size={12} />
				</button>
			)}

			{showEnvVars && (
				<EnvVarsModal orgId={selectedOrganisation.id} orgName={selectedOrganisation.name} onClose={() => setShowEnvVars(false)} />
			)}
		</div>
	);
};
