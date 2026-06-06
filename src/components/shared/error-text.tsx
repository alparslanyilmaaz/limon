import { HTMLProps } from "react";

interface ErrorTextProps extends HTMLProps<HTMLParagraphElement> {
	message?: string | JSX.Element;
	extraClasses?: string;
}

export const ErrorText = ({ message, extraClasses, ...rest }: ErrorTextProps) => {
	return (
		<p
			{...rest}
			className={`text-sm text-red-500 ${rest.className || ""} ${extraClasses || ""}`}
		>
			{message}
		</p>
	);
};
