import { Plus, Settings } from "lucide-react"
import { memo, useEffect, useState } from "react"
import { Organisation, useOrganisationStore } from "../store/organisation-store";
import OrganisationCreateModal from "./organisation/create-modal";
import { SettingsModal } from "./modals/settings-modal";

export const ComponentOrganisationList = () => {
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const organisations = useOrganisationStore((s) => s.organisations);
	const fetchOrganisations = useOrganisationStore((s) => s.fetchOrganisations);
	const selectedOrganisationId = useOrganisationStore((s) => s.selectedOrganisation?.id);
	const selectOrganisation = useOrganisationStore((s) => s.selectOrganisation);

	useEffect(() => {
		fetchOrganisations();
	}, []);

	return (
		<div className="flex flex-col h-full border-r border-border bg-bg">
			<div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col items-center gap-3 py-3 w-16">
				{organisations.map((org) => (
					<OrganisationCard
						key={org.id}
						org={org}
						isSelected={selectedOrganisationId === org.id}
						onSelect={selectOrganisation}
					/>
				))}
			</div>

			<div className="w-16 flex flex-col items-center gap-2 py-2 border-t border-border">
				<button
					className="w-12 h-12 rounded-lg border border-border flex items-center justify-center hover:bg-elevated transition-colors text-muted hover:text-fg"
					title="Settings"
					onClick={() => setIsSettingsOpen(true)}
				>
					<Settings size={18} />
				</button>
				<button
					className="w-12 h-12 rounded-lg border border-border flex items-center justify-center hover:bg-elevated transition-colors text-muted hover:text-fg"
					onClick={() => setIsCreateOpen(true)}
					title="New Organisation"
				>
					<Plus size={18} />
				</button>
			</div>

			{isCreateOpen && (
				<OrganisationCreateModal
					onClose={() => setIsCreateOpen(false)}
					onSuccess={fetchOrganisations}
				/>
			)}

			{isSettingsOpen && (
				<SettingsModal onClose={() => setIsSettingsOpen(false)} />
			)}
		</div>
	)
}

interface OrganisationCardProps {
	org: Organisation;
	isSelected: boolean;
	onSelect: (org: Organisation) => void;
}

const OrganisationCard = memo(({ org, isSelected, onSelect }: OrganisationCardProps) => (
	<button
		onClick={() => onSelect(org)}
		title={org.name}
		className={`
			w-12 min-h-12 max-h-12 rounded-lg
			border text-sm font-medium
			transition-colors
			${isSelected
				? "border-primary bg-primary-soft text-primary"
				: "border-border text-fg hover:bg-elevated"
			}
		`}
	>
		{org.name.charAt(0).toUpperCase()}
	</button>
));