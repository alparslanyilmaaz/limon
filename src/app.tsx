import { ComponentOrganisationList } from "./components/organisation-list"
import { OrganisationSidebar } from "./components/organisation/sidebar"
import { RequestEditor } from "./components/request/editor"

export const App = () => {
	return (
		<div className="h-screen flex flex-col overflow-hidden">
			{/* Draggable title bar — traffic lights sit on this strip */}
			<div
				data-tauri-drag-region
				className="h-7 shrink-0 bg-surface border-b border-border flex items-center justify-center select-none"
			>
				<span data-tauri-drag-region className="text-xs text-muted font-medium">limon</span>
			</div>

			<div className="flex flex-1 min-h-0 overflow-hidden">
				<ComponentOrganisationList />
				<OrganisationSidebar />
				<RequestEditor />
			</div>
		</div>
	)
}
