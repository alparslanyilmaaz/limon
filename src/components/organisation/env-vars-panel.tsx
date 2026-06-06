import { useState } from "react";
import { Plus, Trash, Check, AlertTriangle } from "lucide-react";
import { ModalWrapperComponent } from "../modals/modal-wrapper";
import { useEnvVarStore, type EnvVar } from "../../store/env-var-store";
import { useOrganisationStore } from "../../store/organisation-store";

type SettingsTab = "General" | "Variables";

interface Props {
	orgId: number;
	orgName: string;
	onClose: () => void;
}

const EnvVarRow = ({ v }: { v: EnvVar }) => {
	const { updateEnvVar, deleteEnvVar } = useEnvVarStore();
	const [name, setName] = useState(v.name);
	const [value, setValue] = useState(v.value);
	const dirty = name !== v.name || value !== v.value;

	return (
		<div className="flex gap-3 items-center py-2 border-b border-border-soft">
			<input
				value={name}
				onChange={(e) => setName(e.target.value)}
				placeholder="NAME"
				className="w-36 shrink-0 bg-elevated border border-border focus:border-primary outline-none px-3 py-1.5 rounded-lg text-fg placeholder:text-muted text-sm font-mono transition-colors"
			/>
			<input
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder="value"
				className="flex-1 min-w-0 bg-elevated border border-border focus:border-primary outline-none px-3 py-1.5 rounded-lg text-fg placeholder:text-muted text-sm transition-colors"
			/>
			{dirty && (
				<button
					onClick={() => updateEnvVar(v.id, name, value)}
					className="p-1.5 rounded-lg hover:bg-elevated text-primary transition-colors shrink-0"
					title="Save"
				>
					<Check size={14} />
				</button>
			)}
			<button
				onClick={() => deleteEnvVar(v.id)}
				className="p-1.5 rounded-lg hover:bg-elevated text-muted hover:text-red-500 transition-colors shrink-0"
				title="Delete"
			>
				<Trash size={14} />
			</button>
		</div>
	);
};

const ConfirmDeleteModal = ({ orgName, onConfirm, onCancel }: { orgName: string; onConfirm: () => void; onCancel: () => void }) => (
	<div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
		<div className="bg-surface rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
			<div className="flex items-center gap-3 mb-3">
				<div className="p-2 rounded-lg bg-red-500/10">
					<AlertTriangle size={16} className="text-red-500" />
				</div>
				<h3 className="text-sm font-semibold text-fg">Delete Organisation</h3>
			</div>
			<p className="text-sm text-muted mb-5">
				<span className="font-medium text-fg">"{orgName}"</span> and all its folders, requests, and variables will be permanently deleted.
			</p>
			<div className="flex gap-2 justify-end">
				<button
					onClick={onCancel}
					className="px-4 py-2 rounded-xl text-sm text-muted hover:text-fg hover:bg-elevated transition-colors"
				>
					Cancel
				</button>
				<button
					onClick={onConfirm}
					className="px-4 py-2 rounded-xl text-sm bg-red-500 text-white hover:bg-red-600 transition-colors"
				>
					Delete
				</button>
			</div>
		</div>
	</div>
);

const GeneralTab = ({ orgId, orgName, onClose }: { orgId: number; orgName: string; onClose: () => void }) => {
	const { renameOrganisation, deleteOrganisation } = useOrganisationStore();
	const [name, setName] = useState(orgName);
	const [saving, setSaving] = useState(false);
	const [renameError, setRenameError] = useState<string | null>(null);
	const [deleting, setDeleting] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const dirty = name.trim().length > 0 && name.trim() !== orgName;

	const handleRename = async () => {
		if (!dirty) return;
		setSaving(true);
		setRenameError(null);
		try {
			await renameOrganisation(orgId, name.trim());
		} catch (e) {
			setRenameError(String(e));
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async () => {
		setShowConfirm(false);
		setDeleting(true);
		try {
			await deleteOrganisation(orgId);
			onClose();
		} catch (e) {
			setDeleting(false);
		}
	};

	return (
		<>
			<div className="px-6 py-5 flex flex-col gap-8 flex-1">
				<div>
					<label className="text-xs font-semibold text-muted uppercase tracking-widest mb-2 block">Name</label>
					<div className="flex gap-2">
						<input
							value={name}
							onChange={(e) => setName(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleRename()}
							className="flex-1 min-w-0 bg-elevated border border-border focus:border-primary outline-none px-3 py-1.5 rounded-lg text-fg text-sm transition-colors"
						/>
						<button
							onClick={handleRename}
							disabled={!dirty || saving}
							className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0"
						>
							{saving ? "Saving…" : "Save"}
						</button>
					</div>
					{renameError && <p className="text-xs text-red-500 mt-1.5">{renameError}</p>}
				</div>

				<div>
					<label className="text-xs font-semibold text-muted uppercase tracking-widest mb-2 block">Danger Zone</label>
					<div className="border border-red-500/30 rounded-xl p-4 flex items-center justify-between gap-4">
						<div>
							<p className="text-sm font-medium text-fg">Delete this organisation</p>
							<p className="text-xs text-muted mt-0.5">Permanently removes all folders, requests, and variables.</p>
						</div>
						<button
							onClick={() => setShowConfirm(true)}
							disabled={deleting}
							className="px-3 py-1.5 text-sm text-red-500 border border-red-500/40 rounded-lg hover:bg-red-500/10 transition-colors shrink-0 disabled:opacity-40"
						>
							{deleting ? "Deleting…" : "Delete"}
						</button>
					</div>
				</div>
			</div>

			{showConfirm && (
				<ConfirmDeleteModal
					orgName={orgName}
					onConfirm={handleDelete}
					onCancel={() => setShowConfirm(false)}
				/>
			)}
		</>
	);
};

const VariablesTab = ({ orgId }: { orgId: number }) => {
	const { envVars, createEnvVar } = useEnvVarStore();
	const [newName, setNewName] = useState("");
	const [newValue, setNewValue] = useState("");

	const handleAdd = async () => {
		const trimmed = newName.trim();
		if (!trimmed) return;
		await createEnvVar(orgId, trimmed, newValue);
		setNewName("");
		setNewValue("");
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") handleAdd();
	};

	return (
		<>
			<div className="flex-1 overflow-y-auto px-6 py-4">
				{envVars.length === 0 && (
					<p className="text-sm text-muted text-center py-8">No variables yet</p>
				)}
				{envVars.map((v) => (
					<EnvVarRow key={v.id} v={v} />
				))}
			</div>

			<div className="px-6 pb-5 pt-3 border-t border-border flex gap-3 items-center">
				<input
					value={newName}
					onChange={(e) => setNewName(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="NAME"
					className="w-36 shrink-0 bg-elevated border border-border focus:border-primary outline-none px-3 py-1.5 rounded-lg text-fg placeholder:text-muted text-sm font-mono transition-colors"
				/>
				<input
					value={newValue}
					onChange={(e) => setNewValue(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="value"
					className="flex-1 min-w-0 bg-elevated border border-border focus:border-primary outline-none px-3 py-1.5 rounded-lg text-fg placeholder:text-muted text-sm transition-colors"
				/>
				<button
					onClick={handleAdd}
					disabled={!newName.trim()}
					className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
				>
					<Plus size={14} />
					Add
				</button>
			</div>
		</>
	);
};

export const EnvVarsModal = ({ orgId, orgName, onClose }: Props) => {
	const [tab, setTab] = useState<SettingsTab>("General");

	const NAV: SettingsTab[] = ["General", "Variables"];

	return (
		<ModalWrapperComponent onOutsideClick={onClose} width="max-w-2xl w-full" noPadding>
			<div className="flex h-120">
				<aside className="w-52 border-r border-border flex flex-col shrink-0">
					<div className="px-4 pt-5 pb-3">
						<p className="text-xs font-semibold text-muted uppercase tracking-widest">Settings</p>
					</div>
					<nav className="flex-1 px-2 pb-4">
						{NAV.map((t) => (
							<button
								key={t}
								onClick={() => setTab(t)}
								className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm w-full text-left transition-colors ${
									tab === t
										? "bg-primary-soft text-primary font-medium"
										: "text-muted hover:text-fg hover:bg-elevated"
								}`}
							>
								{t}
							</button>
						))}
					</nav>
				</aside>

				<div className="flex-1 flex flex-col min-w-0">
					<div className="flex items-center justify-between px-6 pt-5 pb-3 shrink-0 border-b border-border">
						<div>
							<h2 className="text-base font-semibold text-fg">{tab}</h2>
							{tab === "Variables" && (
								<p className="text-xs text-muted mt-0.5">
									Use <code className="bg-elevated px-1 py-0.5 rounded text-primary">{"{{NAME}}"}</code> in URLs, headers and params
								</p>
							)}
						</div>
						<button
							onClick={onClose}
							className="p-1.5 rounded-lg hover:bg-elevated text-muted hover:text-fg transition-colors"
						>
							<Plus size={15} className="rotate-45" />
						</button>
					</div>

					{tab === "General" && <GeneralTab orgId={orgId} orgName={orgName} onClose={onClose} />}
					{tab === "Variables" && <VariablesTab orgId={orgId} />}
				</div>
			</div>
		</ModalWrapperComponent>
	);
};
