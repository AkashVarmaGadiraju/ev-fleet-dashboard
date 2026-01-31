"use client";

import { useDashboardData } from "@/hooks/useDashboardData";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { HomeView } from "@/components/views/HomeView";
import { ProjectsView } from "@/components/views/ProjectsView";
import { DevicesView } from "@/components/views/DevicesView";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CommandPalette } from "@/components/CommandPalette";

// Custom Loader
const Loader = () => (
	<motion.div
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		exit={{ opacity: 0 }}
		className="fixed inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center"
	>
		<div className="flex flex-col items-center">
			<div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
			<p className="mt-4 text-emerald-600 dark:text-emerald-400 font-medium animate-pulse">Processing Data...</p>
		</div>
	</motion.div>
);

export default function Dashboard() {
	const {
		hasData,
		fileName,
		handleFileUpload: onFileUpload, // alias
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
	} = useDashboardData();

	const [currentTab, setCurrentTab] = useState<"home" | "projects" | "devices">("home");
	const [loading, setLoading] = useState(false);
	const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

	// Global Keyboard Shortcut for Command Palette
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setIsCommandPaletteOpen((prev) => !prev);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	const handleFileChange = async (file: File) => {
		setLoading(true);
		// Simulate a small delay for the loader effect
		await new Promise((resolve) => setTimeout(resolve, 800));
		onFileUpload(file);
		setLoading(false);
	};

	const handleReset = () => {
		if (confirm("Are you sure you want to clear the dashboard?")) {
			resetData();
		}
	};

	return (
		<div className="flex min-h-screen bg-gray-50 dark:bg-black font-sans text-gray-900 dark:text-gray-100 max-h-screen overflow-hidden selection:bg-emerald-100 dark:selection:bg-emerald-900 selection:text-emerald-900 dark:selection:text-white">
			<CommandPalette
				projects={projectsList}
				devices={filteredDevices}
				onSelectProject={(name) => {
					setSelectedProject(name);
					setCurrentTab("projects");
				}}
				onSelectDevice={(name) => {
					setSelectedDevice(name);
					setCurrentTab("devices");
				}}
				isOpen={isCommandPaletteOpen}
				onClose={() => setIsCommandPaletteOpen(false)}
			/>
			<AnimatePresence>{loading && <Loader />}</AnimatePresence>

			<Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} fileName={fileName} onFileUpload={handleFileChange} />

			<main className="flex-grow flex flex-col h-screen overflow-hidden relative">
				<Header
					currentTab={currentTab}
					dateStart={dateStart}
					setDateStart={setDateStart}
					dateEnd={dateEnd}
					setDateEnd={setDateEnd}
					onReset={handleReset}
					onSearchClick={() => setIsCommandPaletteOpen(true)}
				/>

				<div className="flex-grow overflow-y-auto p-5 scrollbar-hide">
					<div className="max-w-full mx-auto pb-10">
						{currentTab === "home" && (
							<HomeView filteredData={filteredData} totalRevenue={totalRevenue} totalEnergy={totalEnergy} hasData={hasData} />
						)}

						{currentTab === "projects" &&
							(hasData ? (
								<ProjectsView
									projectsList={projectsList}
									filteredData={filteredData}
									selectedProject={selectedProject}
									setSelectedProject={setSelectedProject}
								/>
							) : (
								<div className="flex items-center justify-center h-64 text-gray-400">Please upload data to view projects.</div>
							))}

						{currentTab === "devices" &&
							(hasData ? (
								<DevicesView
									filteredDevices={filteredDevices}
									filteredData={filteredData}
									selectedDevice={selectedDevice}
									setSelectedDevice={setSelectedDevice}
									deviceSearch={deviceSearch}
									setDeviceSearch={setDeviceSearch}
								/>
							) : (
								<div className="flex items-center justify-center h-64 text-gray-400">Please upload data to view devices.</div>
							))}
					</div>
				</div>
			</main>
		</div>
	);
}
