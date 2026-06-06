import { useEffect, useRef } from "react";

interface ModalWrapperProps {
	children: React.ReactNode;
	onOutsideClick: () => void;
	width?: string;
	noPadding?: boolean;
}

export const ModalWrapperComponent = ({ children, onOutsideClick, width, noPadding }: ModalWrapperProps) => {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				onOutsideClick();
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [onOutsideClick]);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div ref={ref} className={`bg-surface rounded-2xl shadow-xl ${width || 'max-w-md w-full'} ${noPadding ? 'overflow-hidden' : 'p-6'}`}>
				{children}
			</div>
		</div>
	);
};
