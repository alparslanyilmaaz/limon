import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";
import { useRequestStore, type SavedRequestFull } from "./request-store";

export interface RequestMinified {
	id: number;
	folder_id: number;
	name: string;
	method: string;
}

interface SavedRequestStore {
	selectedRequestId: number | null;
	requestsByFolder: Record<number, RequestMinified[]>;

	getRequestsForFolder: (folderId: number) => Promise<void>;
	createRequest: (orgId: number, folderId: number, name: string) => Promise<RequestMinified | null>;
	deleteRequest: (request: RequestMinified) => Promise<void>;
	selectRequest: (request: RequestMinified) => Promise<void>;
	saveCurrentRequest: () => Promise<void>;
	reset: () => void;
}

export const useSavedRequestStore = create<SavedRequestStore>((set, get) => ({
	selectedRequestId: null,
	requestsByFolder: {},

	getRequestsForFolder: async (folderId) => {
		try {
			const requests = await invoke<RequestMinified[]>("get_requests_for_folder", { folderId });
			set((state) => ({
				requestsByFolder: { ...state.requestsByFolder, [folderId]: requests },
			}));
		} catch (err) {
			console.error("Failed to fetch requests:", err);
		}
	},

	createRequest: async (orgId, folderId, name) => {
		try {
			const newRequest = await invoke<RequestMinified>("create_saved_request", {
				organisationId: orgId,
				folderId,
				name,
			});
			set((state) => ({
				requestsByFolder: {
					...state.requestsByFolder,
					[folderId]: [...(state.requestsByFolder[folderId] ?? []), newRequest],
				},
			}));
			return newRequest;
		} catch (err) {
			console.error("Failed to create request:", err);
			return null;
		}
	},

	deleteRequest: async (request) => {
		try {
			await invoke("delete_saved_request", { id: request.id });
			set((state) => {
				const updated = { ...state.requestsByFolder };
				if (updated[request.folder_id]) {
					updated[request.folder_id] = updated[request.folder_id].filter((r) => r.id !== request.id);
				}
				return {
					requestsByFolder: updated,
					selectedRequestId: state.selectedRequestId === request.id ? null : state.selectedRequestId,
				};
			});
		} catch (err) {
			console.error("Failed to delete request:", err);
		}
	},

	selectRequest: async (request) => {
		const { selectedRequestId, saveCurrentRequest } = get();

		if (selectedRequestId === request.id) return;

		if (selectedRequestId !== null) {
			await saveCurrentRequest();
		}

		try {
			const full = await invoke<SavedRequestFull>("get_saved_request", { id: request.id });
			useRequestStore.getState().loadSavedRequest(full);
			set({ selectedRequestId: request.id });
		} catch (err) {
			console.error("Failed to load request:", err);
		}
	},

	saveCurrentRequest: async () => {
		const { selectedRequestId } = get();
		if (selectedRequestId === null) return;

		const { method, url, headers, body, bodyType } = useRequestStore.getState();
		const activeHeaders = headers
			.filter((h) => h.key.trim())
			.map<[string, string]>((h) => [h.key, h.value]);

		try {
			await invoke("update_saved_request", {
				id: selectedRequestId,
				method,
				url,
				headers: activeHeaders.length > 0 ? JSON.stringify(activeHeaders) : null,
				body: body.trim() || null,
				bodyType,
			});

			// Update the method badge in the list optimistically
			set((state) => ({
				requestsByFolder: Object.fromEntries(
					Object.entries(state.requestsByFolder).map(([fId, reqs]) => [
						fId,
						reqs.map((r) =>
							r.id === selectedRequestId ? { ...r, method } : r
						),
					])
				),
			}));
		} catch (err) {
			console.error("Failed to save request:", err);
		}
	},

	reset: () => set({ selectedRequestId: null, requestsByFolder: {} }),
}));
