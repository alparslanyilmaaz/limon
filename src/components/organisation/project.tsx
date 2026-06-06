import { memo, useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, ChevronRight, FileText, Folder, Plus, Trash } from "lucide-react"
import { SidebarToolbar } from "./toolbar";
import { FolderModel, useFolderStore } from "../../store/folder-store";
import { useSavedRequestStore, RequestMinified } from "../../store/saved-request-store";
import { useThemeStore } from "../../store/theme-store";
import { ModalWrapperComponent } from "../modals/modal-wrapper";

const METHOD_COLORS: Record<string, string> = {
	GET: "text-emerald-600",
	POST: "text-blue-500",
	PUT: "text-amber-500",
	PATCH: "text-orange-500",
	DELETE: "text-red-500",
	HEAD: "text-purple-500",
	OPTIONS: "text-cyan-500",
};

interface Props {
	orgId: number;
}

export const OrganisationProjects = ({ orgId }: Props) => {
	const folders = useFolderStore((s) => s.folders);

	return (
		<div className="flex flex-col flex-1 min-h-0">
			<ProjectList orgId={orgId} folders={folders} />
		</div>
	)
}

const ProjectList = ({ orgId, folders }: { orgId: number; folders: FolderModel[] }) => {
	const createFolder = useFolderStore((s) => s.createFolder);
	const [search, setSearch] = useState("");
	const [isCreating, setIsCreating] = useState(false);

	const filtered = useMemo(() => {
		if (!search) return folders;
		const lower = search.toLowerCase();
		return folders.filter((f) => f.name.toLowerCase().includes(lower));
	}, [folders, search]);

	const handleCreate = async (name: string) => {
		const trimmed = name.trim();
		if (trimmed) await createFolder(orgId, trimmed);
		setIsCreating(false);
	};

	return (
		<div className="flex flex-col flex-1 min-h-0">
			<SidebarToolbar
				onNewClick={() => setIsCreating(true)}
				onTextChange={(value) => setSearch(value)}
			/>
			<div className="flex-1 overflow-y-auto min-h-0 py-1 px-1">
				{isCreating && (
					<NewInlineItem
						icon={<Folder size={13} className="text-primary shrink-0" />}
						placeholder="Folder name..."
						onCommit={handleCreate}
						onCancel={() => setIsCreating(false)}
					/>
				)}
				{filtered.map((folder) => (
					<FolderItem key={folder.id} folder={folder} orgId={orgId} />
				))}
			</div>
		</div>
	)
}

const NewInlineItem = memo(({
	icon,
	placeholder,
	onCommit,
	onCancel,
	depth = 0,
}: {
	icon: React.ReactNode;
	placeholder: string;
	onCommit: (name: string) => void;
	onCancel: () => void;
	depth?: number;
}) => {
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => { inputRef.current?.focus(); }, []);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") onCommit(e.currentTarget.value);
		if (e.key === "Escape") onCancel();
	};

	return (
		<div
			style={{ paddingLeft: depth * 16 + 8 }}
			className="flex items-center gap-1.5 pr-3 py-1.5 rounded-md bg-primary/10 border border-primary/25 mb-0.5"
		>
			<span className="w-3 shrink-0" />
			{icon}
			<input
				ref={inputRef}
				onKeyDown={handleKeyDown}
				onBlur={(e) => onCommit(e.currentTarget.value)}
				className="flex-1 min-w-0 text-xs text-fg bg-transparent outline-none placeholder:text-primary/50"
				placeholder={placeholder}
			/>
		</div>
	);
});

const FolderItem = memo(({ folder, orgId, depth = 0 }: { folder: FolderModel; orgId: number; depth?: number }) => {
	const createFolder = useFolderStore((s) => s.createFolder);
	const toggleFolder = useFolderStore((s) => s.toggleFolder);
	const deleteFolder = useFolderStore((s) => s.deleteFolder);
	const isExpanded = useFolderStore((s) => s.expandedFolderIds.includes(folder.id));
	const subFolders = useFolderStore((s) => s.subFoldersByParent[folder.id]);

	const getRequestsForFolder = useSavedRequestStore((s) => s.getRequestsForFolder);
	const createRequest = useSavedRequestStore((s) => s.createRequest);
	const selectRequest = useSavedRequestStore((s) => s.selectRequest);
	const requests = useSavedRequestStore((s) => s.requestsByFolder[folder.id]);

	const compact = useThemeStore((s) => s.compact);

	const [isCreatingFolder, setIsCreatingFolder] = useState(false);
	const [isCreatingRequest, setIsCreatingRequest] = useState(false);
	const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

	const handleToggle = async () => {
		const wasExpanded = isExpanded;
		await toggleFolder(folder);
		if (!wasExpanded) await getRequestsForFolder(folder.id);
	};

	const handleCreateFolder = async (name: string) => {
		const trimmed = name.trim();
		if (trimmed) await createFolder(orgId, trimmed, folder.id);
		setIsCreatingFolder(false);
	};

	const handleCreateRequest = async (name: string) => {
		const trimmed = name.trim();
		if (trimmed) {
			const newRequest = await createRequest(orgId, folder.id, trimmed);
			if (newRequest) await selectRequest(newRequest);
		}
		setIsCreatingRequest(false);
	};

	return (
		<>
			<div
				style={{ paddingLeft: depth * 16 + 8 }}
				className={`
					group flex items-center gap-1.5 pr-2 rounded-md cursor-pointer select-none mb-0.5
					transition-colors duration-100
					${compact ? "py-0.5" : "py-1.25"}
					${isExpanded ? "text-fg" : "text-muted hover:bg-fg/4 hover:text-fg"}
				`}
				onClick={handleToggle}
			>
				<span className="w-3 shrink-0 flex items-center justify-center">
					{isExpanded
						? <ChevronDown size={11} className="text-primary" />
						: <ChevronRight size={11} className="opacity-0 group-hover:opacity-40 transition-opacity" />
					}
				</span>
				<Folder
					size={13}
					className={`shrink-0 transition-colors duration-100 ${isExpanded ? "text-primary" : "text-muted/60 group-hover:text-muted"}`}
				/>
				<span className="truncate flex-1 text-xs font-medium">
					{folder.name}
				</span>
				<div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
					<button
						onClick={(e) => { e.stopPropagation(); setIsCreatingRequest(true); }}
						className="p-0.5 rounded hover:bg-fg/10 text-muted hover:text-fg transition-colors"
						title="New request"
					>
						<FileText size={11} />
					</button>
					<button
						onClick={(e) => { e.stopPropagation(); setIsCreatingFolder(true); }}
						className="p-0.5 rounded hover:bg-fg/10 text-muted hover:text-fg transition-colors"
						title="New subfolder"
					>
						<Plus size={11} />
					</button>
					<button
						onClick={(e) => { e.stopPropagation(); setIsConfirmingDelete(true); }}
						className="p-0.5 rounded hover:bg-fg/10 text-muted hover:text-red-500 transition-colors"
						title="Delete"
					>
						<Trash size={11} />
					</button>
				</div>
			</div>

			{isCreatingFolder && (
				<NewInlineItem
					depth={depth + 1}
					icon={<Folder size={13} className="text-primary shrink-0" />}
					placeholder="Folder name..."
					onCommit={handleCreateFolder}
					onCancel={() => setIsCreatingFolder(false)}
				/>
			)}
			{isCreatingRequest && (
				<NewInlineItem
					depth={depth + 1}
					icon={<FileText size={13} className="text-primary shrink-0" />}
					placeholder="Request name..."
					onCommit={handleCreateRequest}
					onCancel={() => setIsCreatingRequest(false)}
				/>
			)}

			{isExpanded && (
				<>
					{(subFolders ?? []).map((sf) => (
						<FolderItem key={sf.id} folder={sf} orgId={orgId} depth={depth + 1} />
					))}
					{(requests ?? []).map((r) => (
						<RequestItem key={r.id} request={r} depth={depth + 1} />
					))}
				</>
			)}

			{isConfirmingDelete && (
				<ModalWrapperComponent onOutsideClick={() => setIsConfirmingDelete(false)} width="max-w-sm w-full">
					<div className="flex flex-col gap-4">
						<div>
							<h2 className="text-base font-semibold text-fg mb-1">Delete folder?</h2>
							<p className="text-sm text-muted">
								<span className="font-medium text-fg">"{folder.name}"</span> and all its requests will be permanently deleted.
							</p>
						</div>
						<div className="flex justify-end gap-2">
							<button
								onClick={() => setIsConfirmingDelete(false)}
								className="px-4 py-2 rounded-xl text-sm text-muted hover:text-fg hover:bg-elevated transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={() => { deleteFolder(folder.id); setIsConfirmingDelete(false); }}
								className="px-4 py-2 rounded-xl text-sm bg-red-500 text-white hover:bg-red-600 transition-colors"
							>
								Delete
							</button>
						</div>
					</div>
				</ModalWrapperComponent>
			)}
		</>
	);
});

const RequestItem = memo(({ request, depth }: { request: RequestMinified; depth: number }) => {
	const selectRequest = useSavedRequestStore((s) => s.selectRequest);
	const deleteRequest = useSavedRequestStore((s) => s.deleteRequest);
	const isSelected = useSavedRequestStore((s) => s.selectedRequestId === request.id);
	const compact = useThemeStore((s) => s.compact);

	return (
		<div
			style={{ paddingLeft: depth * 16 + 8 }}
			onClick={() => selectRequest(request)}
			className={`
				group flex items-center gap-1.5 pr-2 rounded-md cursor-pointer select-none mb-0.5
				transition-colors duration-100
				${compact ? "py-0.5" : "py-1.25"}
				${isSelected ? "bg-fg/7 text-fg" : "text-muted hover:bg-fg/4 hover:text-fg"}
			`}
		>
			<span className="w-3 shrink-0" />
			<FileText size={13} className="shrink-0 text-muted/60" />
			<span className="truncate flex-1 text-xs font-medium text-fg">{request.name}</span>
			<div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
				<button
					onClick={(e) => { e.stopPropagation(); deleteRequest(request); }}
					className="p-0.5 rounded hover:bg-fg/10 text-muted hover:text-red-500 transition-colors"
					title="Delete"
				>
					<Trash size={11} />
				</button>
			</div>
			<span className={`text-xs font-bold shrink-0 group-hover:hidden ${METHOD_COLORS[request.method] ?? "text-muted"}`}>
				{request.method}
			</span>
		</div>
	);
});
