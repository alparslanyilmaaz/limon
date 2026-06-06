import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { Toolbar } from "./toolbar";
import { RequestPanel } from "./request-panel";
import { ResponsePanel } from "./response-panel";
import { useSavedRequestStore } from "../../store/saved-request-store";
import { useFolderStore } from "../../store/folder-store";
import { useOrganisationStore } from "../../store/organisation-store";
import { useThemeStore } from "../../store/theme-store";

const RequestBreadcrumb = () => {
	const selectedRequestId = useSavedRequestStore((s) => s.selectedRequestId);
	const requestsByFolder = useSavedRequestStore((s) => s.requestsByFolder);
	const folders = useFolderStore((s) => s.folders);
	const subFoldersByParent = useFolderStore((s) => s.subFoldersByParent);
	const selectedOrganisation = useOrganisationStore((s) => s.selectedOrganisation);
	const compact = useThemeStore((s) => s.compact);

	const breadcrumb = useMemo(() => {
		if (!selectedRequestId || !selectedOrganisation) return null;

		let requestName: string | null = null;
		let folderId: number | null = null;

		for (const [fid, reqs] of Object.entries(requestsByFolder)) {
			const match = reqs.find((r) => r.id === selectedRequestId);
			if (match) {
				requestName = match.name;
				folderId = Number(fid);
				break;
			}
		}

		if (!requestName || folderId === null) return null;

		// Build a flat id→folder map instead of spreading all arrays
		const folderMap = new Map(folders.map((f) => [f.id, f]));
		for (const subs of Object.values(subFoldersByParent)) {
			for (const f of subs) folderMap.set(f.id, f);
		}

		return { requestName, folder: folderMap.get(folderId) ?? null };
	}, [selectedRequestId, requestsByFolder, folders, subFoldersByParent, selectedOrganisation]);

	if (!breadcrumb || !selectedOrganisation) return null;

	return (
		<div className={`flex items-center gap-1 px-3 border-b border-border bg-surface text-xs text-muted shrink-0 ${compact ? "py-0.5" : "py-1"}`}>
			<span>{selectedOrganisation.name}</span>
			{breadcrumb.folder && (
				<>
					<ChevronRight size={11} className="opacity-40 shrink-0" />
					<span>{breadcrumb.folder.name}</span>
				</>
			)}
			<ChevronRight size={11} className="opacity-40 shrink-0" />
			<span className="text-fg">{breadcrumb.requestName}</span>
		</div>
	);
};

export const RequestEditor = () => {
	const { selectedRequestId } = useSavedRequestStore();

	if (!selectedRequestId) {
		return (
			<div className="flex-1 flex items-center justify-center bg-bg">
				<span className="text-sm text-muted select-none">Select a request to get started</span>
			</div>
		);
	}

	return (
		<div className="flex-1 flex flex-col min-w-0 min-h-0 bg-bg">
			<RequestBreadcrumb />
			<Toolbar />
			<div className="flex flex-1 min-h-0 divide-x divide-border">
				<RequestPanel />
				<ResponsePanel />
			</div>
		</div>
	);
};
