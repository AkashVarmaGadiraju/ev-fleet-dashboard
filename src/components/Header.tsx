"use client";

import { Calendar, Search, Bell, Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface HeaderProps {
	currentTab: string;
	dateStart: string;
	setDateStart: (d: string) => void;
	dateEnd: string;
	setDateEnd: (d: string) => void;
	onReset: () => void;
	onSearchClick: () => void;
}

export function Header({ currentTab, dateStart, setDateStart, dateEnd, setDateEnd, onReset, onSearchClick }: HeaderProps) {
	const { setTheme, theme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const toggleTheme = () => {
		if (theme === "dark") setTheme("light");
		else setTheme("dark");
	};

	return (
		<header className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 h-16 shrink-0 px-6 flex justify-between items-center z-10 sticky top-0 backdrop-blur-3xl bg-white/90 dark:bg-zinc-900/90 transition-colors duration-300">
			<h2 className="text-lg font-bold capitalize text-slate-800 dark:text-gray-100 tracking-tight">
				{currentTab === "home" ? "Dashboard Overview" : currentTab}
			</h2>

			<div className="flex items-center gap-4">
				{/* Search Bar - Aesthetic Placeholder */}
				{/* Search Bar - Aesthetic Trigger */}
				<button
					onClick={onSearchClick}
					className="group relative hidden md:flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 w-64 h-9 px-3 rounded-lg border border-gray-200 dark:border-zinc-700 transition-all outline-none focus:ring-2 focus:ring-emerald-500/50"
				>
					<Search className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 group-hover:text-emerald-500 transition-colors" />
					<span className="text-xs font-medium text-gray-500 dark:text-gray-400">Search projects & devices...</span>
					<div className="ml-auto flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-gray-300 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-900 text-[10px] font-medium text-gray-400 dark:text-zinc-500">
						<span className="text-xs">⌘</span>K
					</div>
				</button>

				<div className="flex items-center gap-2 h-9 px-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg border border-gray-200 dark:border-zinc-700 transition-colors group">
					<Calendar className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 group-hover:text-emerald-500 transition-colors" />
					<div className="flex items-center gap-2 text-xs font-medium">
						<input
							type="date"
							value={dateStart}
							onChange={(e) => setDateStart(e.target.value)}
							className="bg-transparent outline-none text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors cursor-pointer"
						/>
						<span className="text-gray-300 dark:text-zinc-600">|</span>
						<input
							type="date"
							value={dateEnd}
							onChange={(e) => setDateEnd(e.target.value)}
							className="bg-transparent outline-none text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors cursor-pointer"
						/>
					</div>
				</div>

				<div className="flex items-center gap-2 pl-3 border-l border-gray-100 dark:border-zinc-700">
					{mounted && (
						<button
							onClick={toggleTheme}
							className="p-1.5 text-gray-400 hover:text-emerald-600 dark:text-gray-500 dark:hover:text-emerald-400 transition-colors"
						>
							{theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
						</button>
					)}

					{/* <button className="relative w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-gray-400 hover:text-emerald-500 transition-colors">
						<Bell className="w-4 h-4" />
						<span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-400 rounded-full border-2 border-white dark:border-zinc-900"></span>
					</button> */}
				</div>
			</div>
		</header>
	);
}
