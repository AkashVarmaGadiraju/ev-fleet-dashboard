"use client";

import { useState, useMemo } from "react";
import { RawSession, SessionData } from "@/types/dashboard";

export function useDashboardData() {
	const [fileName, setFileName] = useState<string | null>(null);
	const [rawSessions, setRawSessions] = useState<SessionData[]>([]);
	const [hasData, setHasData] = useState(false);
	const [dateStart, setDateStart] = useState<string>("2025-11-01");
	const [dateEnd, setDateEnd] = useState<string>("2025-11-30");
	const [selectedProject, setSelectedProject] = useState<string | null>(null);
	const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
	const [deviceSearch, setDeviceSearch] = useState("");

	const calcEnergy = (s: RawSession) => {
		if (!s.meterValues || !Array.isArray(s.meterValues) || s.meterValues.length === 0) return 0;

		const readings = s.meterValues.flatMap((sampleBlock: any) => {
			const block = Array.isArray(sampleBlock) ? sampleBlock : [sampleBlock];
			const reading = block.find((m: any) => m.measurand === "Energy.Active.Import.Register");
			return reading ? [parseFloat(reading.value)] : [];
		});

		if (readings.length === 0) return 0;
		return Math.max(...readings) - Math.min(...readings);
	};

	const handleFileUpload = (file: File) => {
		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const result = event.target?.result as string;
				const data = JSON.parse(result);
				const sessions: SessionData[] = (Array.isArray(data) ? data : [data]).map((s: RawSession) => {
					const meta = s.metaData;
					const project = meta?.project;
					const device = meta?.device;
					const asset = meta?.asset;

					return {
						id: s._id?.$oid || Math.random().toString(36),
						date: s.createdAt?.$date ? new Date(s.createdAt.$date) : new Date(),
						projectName: project?.projectName || "Unassigned Project",
						deviceName: device?.deviceName || "Unknown Device",
						serial: asset?.boxSerialNumber || "N/A",
						amount: s.amount || 0,
						energy: calcEnergy(s),
						idTag: s.idTag || "Guest",
					};
				});

				if (sessions.length === 0) {
					alert("No valid sessions found in the file.");
					return;
				}

				setRawSessions(sessions);
				setFileName(file.name);
				setHasData(true);
			} catch (err: any) {
				console.error("Parse Error:", err);
				alert("Error reading JSON: " + err.message);
			}
		};
		reader.readAsText(file);
	};

	const filteredData = useMemo(() => {
		const start = new Date(dateStart);
		const end = new Date(dateEnd);
		end.setHours(23, 59, 59);
		return rawSessions.filter((s) => s.date >= start && s.date <= end);
	}, [rawSessions, dateStart, dateEnd]);

	const totalRevenue = useMemo(() => filteredData.reduce((sum, s) => sum + s.amount, 0), [filteredData]);
	const totalEnergy = useMemo(() => filteredData.reduce((sum, s) => sum + s.energy, 0), [filteredData]);
	const projectsList = useMemo(() => Array.from(new Set(filteredData.map((s) => s.projectName))), [filteredData]);

	const filteredDevices = useMemo(() => {
		const devMap: Record<string, { name: string; serial: string; count: number }> = {};
		filteredData.forEach((s) => {
			if (!devMap[s.deviceName]) devMap[s.deviceName] = { name: s.deviceName, serial: s.serial, count: 0 };
			devMap[s.deviceName].count++;
		});
		return Object.values(devMap).filter((d) => d.name.toLowerCase().includes(deviceSearch.toLowerCase()));
	}, [filteredData, deviceSearch]);

	const resetData = () => {
		setHasData(false);
		setRawSessions([]);
		setFileName(null);
	};

	return {
		hasData,
		fileName,
		handleFileUpload,
		rawSessions,
		filteredData,
		dateStart,
		setDateStart,
		dateEnd,
		setDateEnd,
		selectedProject,
		setSelectedProject,
		selectedDevice,
		setSelectedDevice,
		deviceSearch,
		setDeviceSearch,
		totalRevenue,
		totalEnergy,
		projectsList,
		filteredDevices,
		resetData,
	};
}
