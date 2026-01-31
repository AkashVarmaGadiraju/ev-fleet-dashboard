"use client";

import { Bar, Line, Doughnut } from "react-chartjs-2";
import { SessionData } from "@/types/dashboard";
import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, ChevronRight, ChevronLeft, Search, DollarSign, Zap, Activity, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { useTheme } from "next-themes";
import "@/lib/charts";
import { motion } from "framer-motion";

interface ProjectsViewProps {
	projectsList: string[];
	filteredData: SessionData[];
	selectedProject: string | null;
	setSelectedProject: (p: string | null) => void;
}

export function ProjectsView({ projectsList, filteredData, selectedProject, setSelectedProject }: ProjectsViewProps) {
	const getProjectStats = (name: string) => {
		const projectSessions = filteredData.filter((s) => s.projectName === name);
		return {
			revenue: projectSessions.reduce((a, b) => a + b.amount, 0).toFixed(2),
			energy: (projectSessions.reduce((a, b) => a + b.energy, 0) / 1000).toFixed(2),
			count: projectSessions.length,
		};
	};

	const pieData = useMemo(() => {
		if (!selectedProject) return null;
		const devMap: Record<string, number> = {};
		filteredData.filter((s) => s.projectName === selectedProject).forEach((s) => (devMap[s.deviceName] = (devMap[s.deviceName] || 0) + s.amount));

		return {
			labels: Object.keys(devMap),
			datasets: [
				{
					data: Object.values(devMap),
					backgroundColor: ["#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#f59e0b", "#10b981"],
					borderWidth: 1,
				},
			],
		};
	}, [selectedProject, filteredData]);

	// Pagination State
	const [currentPage, setCurrentPage] = useState(1);
	const ITEMS_PER_PAGE = 10;

	// Reset page when project changes
	useEffect(() => {
		setCurrentPage(1);
	}, [selectedProject]);

	// Search State
	const [projectSearch, setProjectSearch] = useState("");

	const filteredProjects = useMemo(() => {
		if (!projectSearch) return projectsList;
		return projectsList.filter((p) => p.toLowerCase().includes(projectSearch.toLowerCase()));
	}, [projectsList, projectSearch]);

	const projectSessions = useMemo(() => {
		if (!selectedProject) return [];
		return filteredData.filter((s) => s.projectName === selectedProject);
	}, [selectedProject, filteredData]);

	const totalPages = Math.ceil(projectSessions.length / ITEMS_PER_PAGE);
	const paginatedSessions = useMemo(() => {
		const start = (currentPage - 1) * ITEMS_PER_PAGE;
		return projectSessions.slice(start, start + ITEMS_PER_PAGE);
	}, [projectSessions, currentPage]);

	// Chart Data Preparation
	const { dailyRevenue, dailyEnergy } = useMemo(() => {
		if (!selectedProject) return { dailyRevenue: {}, dailyEnergy: {} };
		const rev: Record<string, number> = {};
		const en: Record<string, number> = {};

		filteredData
			.filter((s) => s.projectName === selectedProject)
			.forEach((s) => {
				const d = format(s.date, "yyyy-MM-dd");
				rev[d] = (rev[d] || 0) + s.amount;
				en[d] = (en[d] || 0) + s.energy;
			});
		return { dailyRevenue: rev, dailyEnergy: en };
	}, [selectedProject, filteredData]);

	const { theme } = useTheme();
	const gridColor = theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";

	// Chart Options
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
				grid: { color: gridColor, drawBorder: false },
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

	const revenueData = {
		labels: Object.keys(dailyRevenue),
		datasets: [
			{
				label: "Revenue (INR)",
				data: Object.values(dailyRevenue),
				backgroundColor: (context: any) => {
					const ctx = context.chart.ctx;
					const gradient = ctx.createLinearGradient(0, 0, 0, 300);
					gradient.addColorStop(0, "#10b981");
					gradient.addColorStop(1, "#059669");
					return gradient;
				},
				borderRadius: 4,
				barThickness: 20,
			},
		],
	};

	const energyData = {
		labels: Object.keys(dailyEnergy),
		datasets: [
			{
				label: "Energy (Wh)",
				data: Object.values(dailyEnergy),
				borderColor: "#3b82f6",
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

	if (selectedProject) {
		const stats = getProjectStats(selectedProject);
		const avgCost = stats.count > 0 ? (Number(stats.revenue) / stats.count).toFixed(2) : "0.00";

		return (
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
				<div className="flex items-center justify-between">
					<button
						onClick={() => setSelectedProject(null)}
						className="text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-medium hover:underline"
					>
						<ArrowLeft className="w-4 h-4" /> Back to Projects
					</button>
					<h2 className="text-2xl font-bold">{selectedProject}</h2>
				</div>

				{/* KPI Row */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<KPICard
						title="Total Revenue"
						value={`₹${Number(stats.revenue).toLocaleString()}`}
						icon={<DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
						delay={0}
					/>
					<KPICard
						title="Energy Consumed"
						value={`${stats.energy} kWh`}
						icon={<Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
						delay={0.1}
					/>
					<KPICard
						title="Total Sessions"
						value={stats.count}
						icon={<TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
						delay={0.2}
					/>
					<KPICard
						title="Avg Cost/Session"
						value={`₹${avgCost}`}
						icon={<Activity className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
						delay={0.3}
					/>
				</div>

				{/* Charts Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-gray-100 dark:border-zinc-800 shadow-sm h-80 flex flex-col">
						<h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Revenue Trend</h3>
						<div className="flex-grow relative w-full">
							<Bar data={revenueData} options={chartOptionsBase} />
						</div>
					</div>
					<div className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-gray-100 dark:border-zinc-800 shadow-sm h-80 flex flex-col">
						<h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Energy Trend</h3>
						<div className="flex-grow relative w-full">
							<Line data={energyData} options={chartOptionsBase} />
						</div>
					</div>
				</div>

				{/* Device Breakdown (Doughnut) */}
				<div className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-gray-100 dark:border-zinc-800 shadow-sm h-80">
					<h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Device Usage Contribution</h3>
					<div className="h-full pb-8 relative">
						{pieData && (
							<Doughnut
								data={pieData}
								options={{
									maintainAspectRatio: false,
									plugins: {
										legend: { position: "right" },
										datalabels: { display: false },
									},
								}}
							/>
						)}
					</div>
				</div>

				{/* Project Sessions Table with Pagination */}
				<div className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
					<h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg mb-6">Project Sessions</h3>

					<div className="overflow-x-auto">
						<table className="w-full text-left border-collapse">
							<thead>
								<tr className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-widest border-b border-gray-100 dark:border-zinc-800">
									<th className="pb-4 pl-4 font-bold">Date</th>
									<th className="pb-4 font-bold">Device</th>
									<th className="pb-4 text-center font-bold">Tag ID</th>
									<th className="pb-4 text-right font-bold">Energy</th>
									<th className="pb-4 pr-4 text-right font-bold">Cost</th>
								</tr>
							</thead>
							<tbody className="text-sm">
								{paginatedSessions.map((session, i) => (
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
								Showing <span className="font-medium text-gray-900 dark:text-gray-200">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>{" "}
								to{" "}
								<span className="font-medium text-gray-900 dark:text-gray-200">
									{Math.min(currentPage * ITEMS_PER_PAGE, projectSessions.length)}
								</span>{" "}
								of <span className="font-medium text-gray-900 dark:text-gray-200">{projectSessions.length}</span> results
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
				</div>
			</motion.div>
		);
	}

	return (
		<div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
			<div className="p-4 border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50 flex items-center gap-2">
				<Search className="text-gray-400 w-5 h-5" />
				<input
					type="text"
					value={projectSearch}
					onChange={(e) => setProjectSearch(e.target.value)}
					placeholder="Search projects..."
					className="w-full md:w-1/3 p-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100"
				/>
			</div>
			<table className="w-full text-left table-auto">
				<thead className="bg-gray-100 dark:bg-zinc-800 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
					<tr>
						<th className="p-4">Project Name</th>
						<th className="p-4">Total Sessions</th>
						<th className="p-4">Total Revenue</th>
						<th className="p-4">Total Energy</th>
						<th className="p-4">Action</th>
					</tr>
				</thead>
				<tbody>
					{filteredProjects.map((proj) => {
						const stats = getProjectStats(proj);
						return (
							<tr
								key={proj}
								className="border-t border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
							>
								<td className="p-4 font-medium text-gray-900 dark:text-gray-200">{proj}</td>
								<td className="p-4 text-gray-700 dark:text-zinc-400">{stats.count}</td>
								<td className="p-4 text-gray-700 dark:text-zinc-400">₹{stats.revenue}</td>
								<td className="p-4 text-gray-700 dark:text-zinc-400">{stats.energy} Wh</td>
								<td className="p-4">
									<button
										onClick={() => setSelectedProject(proj)}
										className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
									>
										Details
									</button>
								</td>
							</tr>
						);
					})}
					{filteredProjects.length === 0 && (
						<tr>
							<td colSpan={5} className="p-8 text-center text-gray-400">
								No projects found.
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
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
