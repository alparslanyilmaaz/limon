import { type UseFormRegisterReturn } from "react-hook-form";
import { ErrorText } from "./error-text";

interface ValidationInputProps {
	message?: string | JSX.Element;
	register: UseFormRegisterReturn<string>;
	containerClassName?: string;
	placeholder: string;
}

const ValidationInput = ({ message, register, containerClassName, ...rest }: ValidationInputProps) => {
	return (
		<div className={`flex-col ${containerClassName}`}>
			<input
				maxLength={64}
				{...rest}
				{...register}
				autoFocus
				className="bg-elevated hover:bg-border-soft focus:bg-border-soft border border-border focus:border-primary outline-none px-4 py-3 rounded-xl text-fg w-full placeholder:text-muted transition-colors"
			/>
			<ErrorText
				message={message}
				extraClasses="ml-1 mt-1"
			/>
		</div>
	);
};

export default ValidationInput;