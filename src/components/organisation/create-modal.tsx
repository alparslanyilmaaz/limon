import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import { useForm } from "react-hook-form";
import ModalHeader from "../modals/modal-header";
import { ModalWrapperComponent } from "../modals/modal-wrapper";
import ValidationInput from "../shared/input";

type FormValues = {
	organisationName: string;
};

interface OrganisationModalProps {
	onSuccess: () => void;
	onClose: () => void;
}

const OrganisationCreateModal = ({ onClose, onSuccess }: OrganisationModalProps) => {
	const [error, setError] = useState<string | null>(null);
	const {
		handleSubmit,
		register,
		formState: { errors, isSubmitting }
	} = useForm<FormValues>();

	const handleCreateOrganisation = async ({ organisationName }: FormValues) => {
		setError(null);
		try {
			await invoke("create_organisation", { name: organisationName });
			onSuccess();
			onClose();
		} catch (err) {
			setError(err as string);
		}
	};

	return (
		<ModalWrapperComponent onOutsideClick={onClose}>
			<ModalHeader onClose={onClose} title="Create Organisation" />
			<form onSubmit={handleSubmit(handleCreateOrganisation)}>
				<ValidationInput
					containerClassName="mb-4 mt-4"
					placeholder="Organisation Name"
					register={register("organisationName", {
						required: "Name is required",
						minLength: { value: 1, message: "Name is required" },
					})}
					message={errors.organisationName?.message ?? error ?? undefined}
				/>
				<div className="flex justify-end">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 rounded-xl text-sm text-muted hover:text-fg hover:bg-elevated transition-colors mr-2"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={isSubmitting}
						className="px-4 py-2 rounded-xl text-sm bg-primary text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						{isSubmitting ? "Creating…" : "Create"}
					</button>
				</div>
			</form>
		</ModalWrapperComponent>
	);
};

export default OrganisationCreateModal;