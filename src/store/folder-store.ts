import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";

export interface FolderModel {
	id: number;
	organisation_id: number;
	parent_folder_id: number | null;
	name: string;
	created_at: string;
}

interface FolderStore {
	folders: FolderModel[];
	expandedFolderIds: number[];
	subFoldersByParent: Record<number, FolderModel[]>;

	getFolders: (orgId: number) => Promise<void>;
	createFolder: (orgId: number, name: string, parentFolderId?: number | null) => Promise<void>;
	toggleFolder: (folder: FolderModel) => Promise<void>;
	deleteFolder: (id: number) => Promise<void>;
}

export const useFolderStore = create<FolderStore>((set, get) => ({
	folders: [],
	expandedFolderIds: [],
	subFoldersByParent: {},

	getFolders: async (orgId) => {
		try {
			const folders = await invoke<FolderModel[]>("get_folders", { organisationId: orgId });
			set({ folders, expandedFolderIds: [], subFoldersByParent: {} });
		} catch (err) {
			console.error("Failed to fetch folders:", err);
		}
	},

	createFolder: async (orgId, name, parentFolderId = null) => {
		try {
			const newFolder = await invoke<FolderModel>("create_folder", {
				organisationId: orgId,
				parentFolderId,
				name,
			});

			if (parentFolderId === null) {
				set((state) => ({ folders: [newFolder, ...state.folders] }));
			} else {
				set((state) => ({
					subFoldersByParent: {
						...state.subFoldersByParent,
						[parentFolderId]: [newFolder, ...(state.subFoldersByParent[parentFolderId] ?? [])],
					},
					expandedFolderIds: state.expandedFolderIds.includes(parentFolderId)
						? state.expandedFolderIds
						: [...state.expandedFolderIds, parentFolderId],
				}));
			}
		} catch (err) {
			console.error("Failed to create folder:", err);
		}
	},

	toggleFolder: async (folder) => {
		const { expandedFolderIds, subFoldersByParent } = get();

		if (expandedFolderIds.includes(folder.id)) {
			set({ expandedFolderIds: expandedFolderIds.filter((id) => id !== folder.id) });
			return;
		}

		// Fetch children only if not already cached
		if (!subFoldersByParent[folder.id]) {
			try {
				const children = await invoke<FolderModel[]>("get_child_folders", {
					parentFolderId: folder.id,
				});
				set((state) => ({
					subFoldersByParent: { ...state.subFoldersByParent, [folder.id]: children },
				}));
			} catch (err) {
				console.error("Failed to fetch subfolders:", err);
				return;
			}
		}

		set((state) => ({ expandedFolderIds: [...state.expandedFolderIds, folder.id] }));
	},

	deleteFolder: async (id) => {
		try {
			await invoke("delete_folder", { id });
			set((state) => {
				const { [id]: _removed, ...restSubs } = state.subFoldersByParent;
				return {
					folders: state.folders.filter((f) => f.id !== id),
					expandedFolderIds: state.expandedFolderIds.filter((fId) => fId !== id),
					subFoldersByParent: Object.fromEntries(
						Object.entries(restSubs).map(([k, v]) => [k, v.filter((f) => f.id !== id)])
					),
				};
			});
		} catch (err) {
			console.error("Failed to delete folder:", err);
		}
	},
}));
