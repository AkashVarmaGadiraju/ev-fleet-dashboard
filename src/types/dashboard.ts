export interface SessionData {
	id: string;
	date: Date;
	projectName: string;
	deviceName: string;
	serial: string;
	amount: number;
	energy: number;
	idTag: string;
}

export interface RawSession {
	_id?: { $oid: string };
	createdAt?: { $date: string };
	metaData?: {
		project?: { projectName: string };
		device?: { deviceName: string };
		asset?: { boxSerialNumber: string };
	};
	amount?: number;
	meterValues?: Array<MeterValue | MeterValue[]>;
	idTag?: string;
}

export interface MeterValue {
	measurand?: string;
	value: string;
}

export type Tab = "home" | "projects" | "devices";
