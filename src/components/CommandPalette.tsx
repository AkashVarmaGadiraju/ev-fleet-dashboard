"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Search, Monitor, Folder, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CommandPaletteProps {
	projects: string[];
	devices: { name: string; serial: string }[];
	onSelectProject: (name: string) => void;
	onSelectDevice: (name: string) => void;
	isOpen: boolean;
	onClose: () => void;
}

type SearchResult = { type: "project"; name: string } | { type: "device"; name: string; serial: string };

export function CommandPalette({ projects, devices, onSelectProject, onSelectDevice, isOpen, onClose }: CommandPaletteProps) {
	const [query, setQuery] = useState("");
	const [activeIndex, setActiveIndex] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLUListElement>(null);

	// Toggle with Cmd+K / Ctrl+K
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				if (isOpen) {
					onClose();
				} else {
					// This case is handled by parent usually, but we keep it symmetrical if needed
					// For now, parent handles opening via same shortcut or we just ignore here if closed
				}
			}
			if (e.key === "Escape") {
				onClose();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	// Auto-focus input when opened
	useEffect(() => {
		if (isOpen) {
			setTimeout(() => inputRef.current?.focus(), 50);
			setQuery("");
			setActiveIndex(0);
		}
	}, [isOpen]);

	// Filter results
	const filteredResults = useMemo<SearchResult[]>(() => {
		if (!query) {
			// Show all projects and devices by default
			const initialProjects = projects.map((p) => ({ type: "project" as const, name: p }));
			const initialDevices = devices.map((d) => ({ type: "device" as const, name: d.name, serial: d.serial }));
			return [...initialProjects, ...initialDevices];
		}

		const q = query.toLowerCase();
		const projResults = projects.filter((p) => p.toLowerCase().includes(q)).map((p) => ({ type: "project" as const, name: p }));
		const devResults = devices
			.filter((d) => d.name.toLowerCase().includes(q) || d.serial.toLowerCase().includes(q))
			.map((d) => ({ type: "device" as const, name: d.name, serial: d.serial }));

		return [...projResults, ...devResults];
	}, [query, projects, devices]);

	// Reset active index when query/results change
	useEffect(() => {
		setActiveIndex(0);
	}, [filteredResults]);

	// Handle navigation
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActiveIndex((prev) => (prev + 1) % filteredResults.length);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActiveIndex((prev) => (prev - 1 + filteredResults.length) % filteredResults.length);
		} else if (e.key === "Enter") {
			e.preventDefault();
			if (filteredResults[activeIndex]) {
				handleSelect(filteredResults[activeIndex]);
			}
		}
	};

	// Scroll active item into view
	useEffect(() => {
		if (listRef.current) {
			const activeElement = listRef.current.children[activeIndex] as HTMLElement;
			if (activeElement) {
				activeElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
			}
		}
	}, [activeIndex]);

	const handleSelect = (item: SearchResult) => {
		if (item.type === "project") {
			onSelectProject(item.name);
		} else {
			onSelectDevice(item.name);
		}
		onClose();
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 font-sans">
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
					/>

					{/* Modal */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: -10 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: -10 }}
						transition={{ duration: 0.15 }}
						className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 relative z-10 flex flex-col max-h-[60vh]"
					>
						{/* Search Input */}
						<div className="flex items-center px-4 py-4 border-b border-gray-100 dark:border-zinc-800">
							<Search className="w-5 h-5 text-gray-400 dark:text-zinc-500 mr-3" />
							<input
								ref={inputRef}
								type="text"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder="Search projects or chargers..."
								className="flex-grow bg-transparent border-none outline-none text-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-zinc-600"
							/>
							<div className="hidden sm:flex items-center gap-1">
								<kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-zinc-800 dark:text-zinc-400 rounded border border-gray-200 dark:border-zinc-700">
									ESC
								</kbd>
							</div>
						</div>

						{/* Results List */}
						<div className="flex-grow overflow-y-auto p-2">
							{filteredResults.length === 0 ? (
								<div className="py-12 text-center text-gray-400 dark:text-zinc-500">
									<p>No results found.</p>
								</div>
							) : (
								<ul ref={listRef} className="space-y-1">
									{filteredResults.map((item, index) => {
										const isSelected = index === activeIndex;
										return (
											<li
												key={`${item.type}-${item.name}-${index}`}
												onClick={() => handleSelect(item)}
												onMouseEnter={() => setActiveIndex(index)}
												className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors ${
													isSelected
														? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100"
														: "text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
												}`}
											>
												<div className="flex items-center gap-3 overflow-hidden">
													<div
														className={`p-2 rounded-md ${
															isSelected
																? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
																: "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-500"
														}`}
													>
														{item.type === "project" ? <Folder className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
													</div>
													<div className="flex flex-col min-w-0">
														<span className="font-medium truncate">{item.name}</span>
														{item.type === "device" && (
															<span className="text-xs opacity-70 truncate">SN: {item.serial}</span>
														)}
														{item.type === "project" && <span className="text-xs opacity-70">Project</span>}
													</div>
												</div>
												{isSelected && <ChevronRight className="w-4 h-4 opacity-50" />}
											</li>
										);
									})}
								</ul>
							)}
						</div>

						{/* Footer */}
						<div className="px-4 py-2 bg-gray-50 dark:bg-zinc-900/50 border-t border-gray-100 dark:border-zinc-800 text-xs text-gray-400 dark:text-zinc-500 flex justify-between">
							<span>Search for Projects & Chargers</span>
							<div className="flex gap-3">
								<span className="flex items-center gap-1">
									<kbd className="font-sans px-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded">
										↓
									</kbd>
									<kbd className="font-sans px-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded">
										↑
									</kbd>
									to navigate
								</span>
								<span className="flex items-center gap-1">
									<kbd className="font-sans px-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded">
										↵
									</kbd>
									to select
								</span>
							</div>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
