import { useRequestStore } from "../../../store/request-store";
import { KeyValueComponent } from "../../key-value";

export const ParamsTab = () => {
	const { params, setParams } = useRequestStore();

	return (
		<KeyValueComponent pairs={params} onChange={setParams} envVars />
	);
};