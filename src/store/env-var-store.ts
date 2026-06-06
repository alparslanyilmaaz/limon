import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";

export interface EnvVar {
	id: number;
	organisation_id: number;
	name: string;
	value: string;
}

interface EnvVarStore {
	envVars: EnvVar[];
	loadEnvVars: (orgId: number) => Promise<void>;
	createEnvVar: (orgId: number, name: string, value: string) => Promise<void>;
	updateEnvVar: (id: number, name: string, value: string) => Promise<void>;
	deleteEnvVar: (id: number) => Promise<void>;
	resolveVars: (text: string) => string;
}

export const useEnvVarStore = create<EnvVarStore>((set, get) => ({
	envVars: [],

	loadEnvVars: async (orgId) => {
		try {
			const envVars = await invoke<EnvVar[]>("get_env_vars", { organisationId: orgId });
			set({ envVars });
		} catch (err) {
			console.error("Failed to load env vars:", err);
		}
	},

	createEnvVar: async (orgId, name, value) => {
		try {
			const created = await invoke<EnvVar>("create_env_var", {
				organisationId: orgId,
				name,
				value,
			});
			set((state) => ({ envVars: [...state.envVars, created] }));
		} catch (err) {
			console.error("Failed to create env var:", err);
		}
	},

	updateEnvVar: async (id, name, value) => {
		try {
			await invoke("update_env_var", { id, name, value });
			set((state) => ({
				envVars: state.envVars.map((v) => (v.id === id ? { ...v, name, value } : v)),
			}));
		} catch (err) {
			console.error("Failed to update env var:", err);
		}
	},

	deleteEnvVar: async (id) => {
		try {
			await invoke("delete_env_var", { id });
			set((state) => ({ envVars: state.envVars.filter((v) => v.id !== id) }));
		} catch (err) {
			console.error("Failed to delete env var:", err);
		}
	},

	resolveVars: (text) => {
		const { envVars } = get();
		return text.replace(/\{\{(\w+)\}\}/g, (_, name) => {
			const found = envVars.find((v) => v.name === name);
			return found !== undefined ? found.value : `{{${name}}}`;
		});
	},
}));
