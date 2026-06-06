import { X } from "lucide-react";

interface ModalHeaderProps {
	title: string;
	onClose: () => void;
}

const ModalHeader = ({ title, onClose }: ModalHeaderProps) => {
	return (
		<div className="flex items-center justify-between mb-2">
			<h2 className="text-base font-semibold text-fg">{title}</h2>
			<button
				type="button"
				onClick={onClose}
				className="p-1 rounded-lg hover:bg-elevated text-muted hover:text-fg transition-colors"
			>
				<X size={16} />
			</button>
		</div>
	);
};

export default ModalHeader;
