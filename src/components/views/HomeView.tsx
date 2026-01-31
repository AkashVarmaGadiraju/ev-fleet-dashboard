"use client";

import { Bar, Line } from "react-chartjs-2";
import { SessionData } from "@/types/dashboard";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import "@/lib/charts";
import { ArrowUpRight, Zap, TrendingUp, DollarSign, UploadCloud, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

interface HomeViewProps {
	filteredData: SessionData[];
	totalRevenue: number;
	totalEnergy: number;
	hasData: boolean; // Add this prop to handle empty state in view
}

export function HomeView({ filteredData, totalRevenue, totalEnergy, hasData }: HomeViewProps) {
	const activeSessions = filteredData.length;
	const avgCost = filteredData.length > 0 ? (totalRevenue / filteredData.length).toFixed(2) : "0.00";
	const { theme } = useTheme();
	const gridColor = theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";

	const [currentPage, setCurrentPage] = useState(1);
	const ITEMS_PER_PAGE = 10;
	const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

	const paginatedData = useMemo(() => {
		const start = (currentPage - 1) * ITEMS_PER_PAGE;
		return filteredData.slice(start, start + ITEMS_PER_PAGE);
	}, [filteredData, currentPage]);

	const revenueByProject = useMemo(() => {
		const projMap: Record<string, number> = {};
		filteredData.forEach((s) => (projMap[s.projectName] = (projMap[s.projectName] || 0) + s.amount));
		return projMap;
	}, [filteredData]);

	const dailyUsage = useMemo(() => {
		const daily: Record<string, number> = {};
		filteredData.forEach((s) => {
			const d = format(s.date, "yyyy-MM-dd");
			daily[d] = (daily[d] || 0) + s.energy;
		});
		return daily;
	}, [filteredData]);

	// Chart Styling - Minimal & Clean
	const barData = {
		labels: Object.keys(revenueByProject),
		datasets: [
			{
				label: "Revenue (INR)",
				data: Object.values(revenueByProject),
				backgroundColor: (context: any) => {
					const ctx = context.chart.ctx;
					const gradient = ctx.createLinearGradient(0, 0, 0, 400);
					gradient.addColorStop(0, "#10b981"); // Emerald 500
					gradient.addColorStop(1, "#059669"); // Emerald 600
					return gradient;
				},
				borderRadius: 4, // Slightly rounded
				barThickness: 20,
			},
		],
	};

	const lineData = {
		labels: Object.keys(dailyUsage),
		datasets: [
			{
				label: "Daily Energy (Wh)",
				data: Object.values(dailyUsage),
				borderColor: "#3b82f6", // Blue 500
				backgroundColor: (context: any) => {
					const ctx = context.chart.ctx;
					const gradient = ctx.createLinearGradient(0, 0, 0, 300);
					gradient.addColorStop(0, "rgba(59, 130, 246, 0.4)");
					gradient.addColorStop(1, "rgba(59, 130, 246, 0.0)");
					return gradient;
				},
				tension: 0.4,
				pointRadius: 0,
				pointHoverRadius: 6,
				fill: true,
				borderWidth: 3,
			},
		],
	};

	const chartOptionsBase = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: false },
			datalabels: { display: false },
		},
		scales: {
			x: {
				grid: { display: false, drawBorder: false },
				ticks: { color: "#9ca3af", font: { size: 10 } },
			},
			y: {
				grid: { color: gridColor, drawBorder: false }, // Very subtle grid
				border: { display: false },
				ticks: {
					color: "#9ca3af",
					font: { size: 10 },
					maxTicksLimit: 5,
					callback: function (value: any) {
						if (typeof value === "number") {
							if (value >= 1000000) return (value / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
							if (value >= 1000) return (value / 1000).toFixed(1).replace(/\.0$/, "") + "K";
						}
						return value;
					},
				},
			},
		},
		interaction: {
			mode: "nearest" as const,
			intersect: false,
		},
	};

	// Empty State Placeholder
	if (!hasData) {
		return (
			<div className="space-y-8">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="h-32 bg-gray-100 dark:bg-zinc-800 rounded-lg animate-pulse"></div>
					))}
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
					<div className="lg:col-span-2 h-80 bg-gray-100 dark:bg-zinc-800 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-zinc-700">
						<div className="p-4 rounded-full bg-white dark:bg-zinc-900 mb-4 shadow-sm">
							<UploadCloud className="w-8 h-8 text-gray-400" />
						</div>
						<h3 className="text-lg font-semibold text-gray-500 dark:text-zinc-400">No Data Available</h3>
						<p className="text-sm text-gray-400 dark:text-zinc-500">Upload a JSON file from the sidebar to view analytics.</p>
					</div>
					<div className="h-80 bg-gray-100 dark:bg-zinc-800 rounded-lg animate-pulse"></div>
				</div>
			</div>
		);
	}

	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-4">
			{/* KPI Row */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<KPICard
					title="Total Revenue"
					value={`₹${totalRevenue.toLocaleString("en-IN")}`}
					icon={<DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
					delay={0.1}
				/>
				<KPICard
					title="Energy Consumed"
					value={`${(totalEnergy / 1000).toFixed(2)} kWh`}
					icon={<Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
					delay={0.2}
				/>
				<KPICard
					title="Available Sessions"
					value={activeSessions}
					icon={<TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
					delay={0.3}
				/>
				<KPICard
					title="Avg Cost/Session"
					value={`₹${avgCost}`}
					icon={<Activity className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
					delay={0.4}
				/>
			</div>

			{/* Main Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				{/* Project Revenue - Takes 2 cols */}
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5, delay: 0.5 }}
					className="lg:col-span-2 bg-white dark:bg-zinc-900 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col h-80"
				>
					<div className="flex justify-between items-center mb-6">
						<div>
							<h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">Project Revenue</h3>
							<p className="text-gray-400 dark:text-zinc-500 text-xs mt-1">Gross earnings from all charging stations</p>
						</div>
						<div className="flex gap-2">
							<div className="flex items-center gap-1 text-xs text-gray-400 dark:text-zinc-500">
								<span className="w-2 h-2 rounded-full bg-emerald-500"></span>Current Period
							</div>
						</div>
					</div>
					<div className="flex-grow w-full h-full relative">
						<Bar data={barData} options={chartOptionsBase} />
					</div>
				</motion.div>

				{/* Daily Usage - Takes 1 col */}
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5, delay: 0.6 }}
					className="bg-white dark:bg-zinc-900 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col h-80"
				>
					<div className="mb-6">
						<h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">Energy Trend</h3>
						<p className="text-gray-400 dark:text-zinc-500 text-xs mt-1">Daily consumption metrics</p>
					</div>
					<div className="flex-grow w-full h-full relative">
						<Line data={lineData} options={chartOptionsBase} />
					</div>
				</motion.div>
			</div>

			{/* Recent Transactions Table */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.7 }}
				className="bg-white dark:bg-zinc-900 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden"
			>
				<div className="flex justify-between items-center mb-6">
					<h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">Recent Charging Sessions</h3>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-widest border-b border-gray-100 dark:border-zinc-800">
								<th className="pb-4 pl-4 font-bold">Date</th>
								<th className="pb-4 font-bold">Project</th>
								<th className="pb-4 font-bold">Device</th>
								<th className="pb-4 text-center font-bold">Tag ID</th>
								<th className="pb-4 text-right font-bold">Energy</th>
								<th className="pb-4 pr-4 text-right font-bold">Cost</th>
							</tr>
						</thead>
						<tbody className="text-sm">
							{paginatedData.map((session, i) => (
								<tr
									key={session.id}
									className="group hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors border-b border-gray-50 dark:border-zinc-800/50 last:border-0"
								>
									<td className="py-4 pl-4 font-medium text-gray-900 dark:text-gray-200">
										<div className="flex flex-col">
											<span>{format(session.date, "MMM dd, yyyy")}</span>
											<span className="text-xs text-gray-400 dark:text-zinc-500 font-normal">
												{format(session.date, "HH:mm")}
											</span>
										</div>
									</td>
									<td className="py-4 text-gray-600 dark:text-gray-400 font-medium">{session.projectName}</td>
									<td className="py-4 text-gray-500 dark:text-zinc-500">
										<div className="flex items-center gap-2">
											<div className={`w-2 h-2 rounded-full ${i % 3 === 0 ? "bg-emerald-400" : "bg-blue-400"}`}></div>
											{session.deviceName}
										</div>
									</td>
									<td className="py-4 text-center">
										<span className="px-2.5 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 rounded-md text-xs font-mono border border-gray-200 dark:border-zinc-700">
											{session.idTag}
										</span>
									</td>
									<td className="py-4 text-right font-semibold text-gray-700 dark:text-gray-300">
										{(session.energy / 1000).toFixed(2)}{" "}
										<span className="text-xs text-gray-400 dark:text-zinc-500 font-normal">kWh</span>
									</td>
									<td className="py-4 pr-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
										₹{session.amount.toFixed(2)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Pagination Footer */}
				{totalPages > 1 && (
					<div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
						<p className="text-xs text-gray-400 dark:text-zinc-500">
							Showing <span className="font-medium text-gray-900 dark:text-gray-200">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
							<span className="font-medium text-gray-900 dark:text-gray-200">
								{Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)}
							</span>{" "}
							of <span className="font-medium text-gray-900 dark:text-gray-200">{filteredData.length}</span> results
						</p>
						<div className="flex items-center gap-2">
							<button
								onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
								disabled={currentPage === 1}
								className="p-1 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 dark:text-zinc-400 transition-colors"
							>
								<ChevronLeft className="w-4 h-4" />
							</button>
							<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
								Page {currentPage} of {totalPages}
							</span>
							<button
								onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
								disabled={currentPage === totalPages}
								className="p-1 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 dark:text-zinc-400 transition-colors"
							>
								<ChevronRight className="w-4 h-4" />
							</button>
						</div>
					</div>
				)}
			</motion.div>
		</motion.div>
	);
}

function KPICard({ title, value, icon, delay }: { title: string; value: string | number; icon: any; delay: number }) {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5, delay }}
			className="bg-white dark:bg-zinc-900 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-800 hover:shadow-lg dark:hover:border-zinc-700 transition-all group cursor-default"
		>
			<div className="flex justify-between items-start mb-4">
				<div
					className={`p-3 rounded-md bg-gray-50 dark:bg-zinc-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors`}
				>
					{icon}
				</div>
			</div>
			<div>
				<p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">{title}</p>
				<h4 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</h4>
			</div>
		</motion.div>
	);
}
