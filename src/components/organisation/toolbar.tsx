import { Plus, Search } from "lucide-react"
import { useThemeStore } from "../../store/theme-store";

interface Props {
	onNewClick: () => void;
	onTextChange: (value: string) => void;
}

export const SidebarToolbar = ({ onNewClick, onTextChange }: Props) => {
	const { compact } = useThemeStore();
	return (
		<div className={`flex items-center gap-2 px-3 border-b border-border ${compact ? "py-1" : "py-2"}`}>
			<div className="relative flex-1">
				<Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
				<input
					onChange={(e) => onTextChange(e.target.value)}
					placeholder="Search..."
					className="w-full text-xs bg-elevated border border-border rounded-lg pl-7 pr-2 py-1.5 text-fg placeholder:text-muted outline-none focus:border-primary transition-colors"
				/>
			</div>
			<button
				className="p-1.5 rounded-lg hover:bg-elevated text-muted hover:text-fg transition-colors shrink-0"
				title="New folder"
				onClick={() => onNewClick()}
			>
				<Plus size={14} />
			</button>
		</div>
	)
}