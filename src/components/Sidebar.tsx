"use client";

import { Home, Folder, Monitor, Zap, Settings, PieChart, FileText, Upload, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
	currentTab: "home" | "projects" | "devices";
	setCurrentTab: (tab: "home" | "projects" | "devices") => void;
	fileName: string | null;
	onFileUpload: (file: File) => void;
}

export function Sidebar({ currentTab, setCurrentTab, fileName, onFileUpload }: SidebarProps) {
	const [isCollapsed, setIsCollapsed] = useState(false);

	const menuItems = [
		{ id: "home", label: "Dashboard", icon: Home },
		{ id: "projects", label: "Projects", icon: Folder },
		{ id: "devices", label: "Chargers", icon: Monitor },
	] as const;

	return (
		<aside
			className={`bg-white dark:bg-zinc-900 border-r border-gray-100 dark:border-zinc-800 flex-shrink-0 flex flex-col h-screen font-sans transition-all duration-300 ease-in-out ${
				isCollapsed ? "w-20" : "w-64"
			}`}
		>
			{/* Logo Section */}
			<div
				className={`h-16 shrink-0 flex items-center border-b border-gray-100 dark:border-zinc-800 transition-all duration-300 ${isCollapsed ? "justify-center px-0" : "px-6 justify-between"}`}
			>
				<div className="flex items-center gap-3 overflow-hidden">
					<div className="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded-lg flex-shrink-0">
						<Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-current" />
					</div>
					{!isCollapsed && (
						<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
							<h1 className="font-bold text-lg tracking-tight text-gray-900 dark:text-white leading-none">WaveFuel</h1>
							<p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">EV Fleet Manager</p>
						</motion.div>
					)}
				</div>

				{/* Collapse Toggle */}
				{!isCollapsed && (
					<button
						onClick={() => setIsCollapsed(!isCollapsed)}
						className="p-1 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
					>
						<ChevronsLeft className="w-4 h-4" />
					</button>
				)}
			</div>

			{/* Collapsed Toggle (Centered when collapsed) */}
			{isCollapsed && (
				<div className="flex justify-center py-2 border-b border-gray-100 dark:border-zinc-800">
					<button
						onClick={() => setIsCollapsed(!isCollapsed)}
						className="p-1 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
					>
						<ChevronsRight className="w-4 h-4" />
					</button>
				</div>
			)}

			{/* Navigation */}
			<nav className={`flex-grow space-y-2 py-4 ${isCollapsed ? "px-2" : "px-4"}`}>
				{!isCollapsed && <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Menu</div>}

				{menuItems.map((item) => {
					const Icon = item.icon;
					const isActive = currentTab === item.id;
					return (
						<button
							key={item.id}
							onClick={() => setCurrentTab(item.id)}
							title={isCollapsed ? item.label : undefined}
							className={`w-full flex items-center transition-all duration-200 group relative ${
								isCollapsed ? "justify-center p-3 rounded-lg" : "gap-3 px-4 py-3 rounded-xl"
							} ${
								isActive
									? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-semibold shadow-sm ring-1 ring-emerald-100 dark:ring-emerald-800"
									: "text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-zinc-200"
							}`}
						>
							<Icon
								className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-zinc-500 group-hover:text-gray-600 dark:group-hover:text-zinc-300"}`}
							/>
							{!isCollapsed && <span className="whitespace-nowrap overflow-hidden text-sm">{item.label}</span>}

							{/* Tooltip for collapsed state (optional aesthetic touch) */}
							{isCollapsed && (
								<span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
									{item.label}
								</span>
							)}
						</button>
					);
				})}
			</nav>

			{/* File Management Section */}
			<div className={`p-4 border-t border-gray-100 dark:border-zinc-800 ${isCollapsed ? "flex justify-center" : ""}`}>
				<label className="cursor-pointer block w-full">
					<input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0])} accept=".json" />
					<div
						className={`flex items-center transition-colors group relative overflow-hidden rounded-xl border border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 hover:bg-gray-100 dark:hover:bg-zinc-800 ${
							isCollapsed ? "justify-center p-2 border-0 bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800" : "gap-3 p-3"
						}`}
					>
						<div
							className={`w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0`}
						>
							{fileName ? <FileText className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
						</div>
						{!isCollapsed && (
							<div className="flex-1 min-w-0 z-10">
								<p className="text-sm font-bold text-gray-900 dark:text-zinc-200 truncate">{fileName || "Upload Data"}</p>
								<p className="text-xs text-gray-500 dark:text-zinc-500 truncate">
									{fileName ? "Change Source File" : "Select JSON File"}
								</p>
							</div>
						)}
					</div>
				</label>
			</div>
		</aside>
	);
}
