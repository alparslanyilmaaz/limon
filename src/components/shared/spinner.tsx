interface Props {
	className?: string;
}

export const Spinner = ({ className }: Props) => {
	return <div className={`animate-spin rounded-full h-12 w-12 border-t-4 border-spinner border-solid border-8 ${className}`}></div>;
};
