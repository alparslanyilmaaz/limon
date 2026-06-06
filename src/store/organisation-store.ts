import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";
import { useFolderStore } from "./folder-store";
import { useSavedRequestStore } from "./saved-request-store";

export interface Organisation {
	id: number;
	name: string;
	created_at: string;
}

interface OrganisationStore {
	organisations: Organisation[];
	selectedOrganisation: Organisation | null;
	fetchOrganisations: () => Promise<void>;
	selectOrganisation: (org: Organisation) => void;
	renameOrganisation: (id: number, name: string) => Promise<void>;
	deleteOrganisation: (id: number) => Promise<void>;
}

export const useOrganisationStore = create<OrganisationStore>((set, get) => ({
	organisations: [],
	selectedOrganisation: null,

	fetchOrganisations: async () => {
		try {
			const data = await invoke<Organisation[]>("get_organisations");
			set({ organisations: data });
		} catch (err) {
			console.error("Failed to fetch organisations:", err);
		}
	},

	selectOrganisation: (org) => {
		useFolderStore.getState().getFolders(org.id);
		useSavedRequestStore.getState().reset();
		set({ selectedOrganisation: org });
	},

	renameOrganisation: async (id, name) => {
		await invoke("rename_organisation", { id, name });
		set((state) => ({
			organisations: state.organisations.map((o) => o.id === id ? { ...o, name } : o),
			selectedOrganisation: state.selectedOrganisation?.id === id
				? { ...state.selectedOrganisation, name }
				: state.selectedOrganisation,
		}));
	},

	deleteOrganisation: async (id) => {
		await invoke("delete_organisation", { id });
		const orgs = get().organisations.filter((o) => o.id !== id);
		const wasSelected = get().selectedOrganisation?.id === id;
		if (wasSelected) {
			useSavedRequestStore.getState().reset();
		}
		set({
			organisations: orgs,
			selectedOrganisation: wasSelected ? null : get().selectedOrganisation,
		});
	},
}));
