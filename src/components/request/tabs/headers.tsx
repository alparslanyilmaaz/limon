import { useRequestStore } from "../../../store/request-store";
import { KeyValueComponent } from "../../key-value";

export const HeadersTab = () => {
	const { headers, setHeaders } = useRequestStore();

	return (
		<KeyValueComponent pairs={headers} onChange={setHeaders} envVars />
	);
};
