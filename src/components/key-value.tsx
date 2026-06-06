import { Plus, X } from "lucide-react";
import { EnvVarInput } from "./env-var-input";

export type KeyValuePair = {
	id: string;
	key: string;
	value: string;
};

interface KeyValueProps {
	pairs: KeyValuePair[];
	onChange: (pairs: KeyValuePair[]) => void;
	keyPlaceholder?: string;
	valuePlaceholder?: string;
	envVars?: boolean;
}

export const KeyValueComponent = ({
	pairs,
	onChange,
	keyPlaceholder = "Key",
	valuePlaceholder = "Value",
	envVars = false,
}: KeyValueProps) => {
	const add = () => {
		onChange([...pairs, { id: crypto.randomUUID(), key: "", value: "" }]);
	};

	const remove = (id: string) => {
		onChange(pairs.filter((p) => p.id !== id));
	};

	const update = (id: string, field: "key" | "value", val: string) => {
		onChange(pairs.map((p) => (p.id === id ? { ...p, [field]: val } : p)));
	};

	const onValueFocus = (index: number) => {
		if (index === pairs.length - 1) {
			onChange([...pairs, { id: crypto.randomUUID(), key: "", value: "" }]);
		}
	};

	return (
		<div className="flex flex-col gap-2">
			{pairs.map((pair, index) => (
				<div key={pair.id} className="flex gap-2 items-center">
					<input
						value={pair.key}
						onChange={(e) => update(pair.id, "key", e.target.value)}
						placeholder={keyPlaceholder}
						className="flex-1 bg-elevated hover:bg-border-soft focus:bg-border-soft border border-border focus:border-primary outline-none px-3 py-2 rounded-lg text-fg placeholder:text-muted transition-colors text-sm"
					/>
					{envVars ? (
						<EnvVarInput
							value={pair.value}
							onChange={(val) => update(pair.id, "value", val)}
							onFocus={() => onValueFocus(index)}
							placeholder={valuePlaceholder}
							className="w-full bg-elevated hover:bg-border-soft focus:bg-border-soft border border-border focus:border-primary outline-none px-3 py-2 rounded-lg text-fg placeholder:text-muted transition-colors text-sm"
						/>
					) : (
						<input
							value={pair.value}
							onChange={(e) => update(pair.id, "value", e.target.value)}
							onFocus={() => onValueFocus(index)}
							placeholder={valuePlaceholder}
							className="flex-1 bg-elevated hover:bg-border-soft focus:bg-border-soft border border-border focus:border-primary outline-none px-3 py-2 rounded-lg text-fg placeholder:text-muted transition-colors text-sm"
						/>
					)}
					<button
						onClick={() => remove(pair.id)}
						className="text-muted hover:text-fg transition-colors p-1 rounded shrink-0"
					>
						<X size={14} />
					</button>
				</div>
			))}
			<button
				onClick={add}
				className="flex items-center gap-1.5 text-sm text-muted hover:text-fg transition-colors self-start mt-1"
			>
				<Plus size={14} />
				<span>Add</span>
			</button>
		</div>
	);
};
