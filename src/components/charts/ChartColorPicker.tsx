'use client';

import React from 'react';
import { useChartStyle } from '@/components/layout/ChartStyleProvider';

interface ChartColorPickerProps {
	chartKey: string;
	label?: string;
}

const PALETTES: Record<string, string[]> = {
	Azul: ['#0ea5e9', '#2563eb', '#60a5fa', '#93c5fd', '#bfdbfe'],
	Verde: ['#10b981', '#22c55e', '#34d399', '#86efac', '#bbf7d0'],
	Vermelho: ['#ef4444', '#dc2626', '#f87171', '#fca5a5', '#fecaca'],
	Roxo: ['#8b5cf6', '#7c3aed', '#a78bfa', '#c4b5fd', '#ddd6fe'],
	Coloridos: ['#ff0040', '#ff7a00', '#ffe600', '#7bd500', '#00a3ff', '#0033ff', '#00d92f'],
};

export const ChartColorPicker: React.FC<ChartColorPickerProps> = ({ chartKey, label = 'Cores do gráfico' }) => {
	const { getColorsForChart, setChartColors, clearChartColors } = useChartStyle();
	const [selectedPalette, setSelectedPalette] = React.useState<string>('');
	const [customColors, setCustomColors] = React.useState<string[]>(getColorsForChart(chartKey));
	const [newColor, setNewColor] = React.useState<string>('');
	const [open, setOpen] = React.useState<boolean>(false);

	React.useEffect(() => {
		setCustomColors(getColorsForChart(chartKey));
	}, [chartKey]);

	const applyPalette = (name: string) => {
		setSelectedPalette(name);
		const pal = PALETTES[name] || [];
		if (pal.length) {
			setCustomColors(pal);
		}
	};

	const addColor = () => {
		const c = newColor.trim();
		if (!c) return;
		setCustomColors((prev) => [...prev, c]);
		setNewColor('');
	};

	const removeColor = (idx: number) => {
		setCustomColors((prev) => prev.filter((_, i) => i !== idx));
	};

	const save = () => {
		setChartColors(chartKey, customColors);
	};

	const reset = () => {
		clearChartColors(chartKey);
		setSelectedPalette('');
		setCustomColors(getColorsForChart());
	};

	return (
		<div className="mt-2 border rounded-md p-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
			<div className="flex items-center justify-between gap-2">
				<div className="min-w-0 flex-1">
					<label className="text-xs font-medium text-gray-700 dark:text-gray-200">{label}</label>
					<div className="text-xs text-gray-500 truncate">{chartKey}</div>
				</div>
				<button onClick={() => setOpen((v) => !v)} className="px-2 py-1 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 whitespace-nowrap">
					{open ? 'Ocultar' : 'Editar'}
				</button>
			</div>

			{open && (
				<div className="mt-2 space-y-3">
					{/* Paletas - linha única */}
					<div>
						<div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Paletas</div>
						<select
							className="w-full rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs focus:border-blue-500 focus:ring-blue-500"
							value={selectedPalette}
							onChange={(e) => applyPalette(e.target.value)}
						>
							<option value="">Selecione…</option>
							{Object.keys(PALETTES).map((k) => (
								<option key={k} value={k}>{k}</option>
							))}
						</select>
					</div>

					{/* Cores atuais - linha única */}
					<div>
						<div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Cores atuais</div>
						<div className="flex flex-wrap gap-1">
							{customColors.map((c, i) => (
								<button
									key={`${c}-${i}`}
									title={c}
									onClick={() => removeColor(i)}
									className="h-5 w-5 rounded border"
									style={{ backgroundColor: c }}
								/>
							))}
						</div>
					</div>

					{/* Adicionar cor - layout responsivo */}
					<div>
						<div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Adicionar cor</div>
						<div className="flex gap-1 items-center">
							<input 
								type="color" 
								onChange={(e) => setNewColor(e.target.value)} 
								value={/^#/.test(newColor) ? newColor : '#000000'} 
								className="h-7 w-7 p-0 border border-gray-300 dark:border-gray-600 rounded"
							/>
							<input
								type="text"
								placeholder="#0066ff"
								value={newColor}
								onChange={(e) => setNewColor(e.target.value)}
								onKeyDown={(e) => { if (e.key === 'Enter') addColor(); }}
								className="flex-1 min-w-0 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs focus:border-blue-500 focus:ring-blue-500"
							/>
							<button onClick={addColor} className="px-2 py-1 rounded bg-blue-600 text-white text-xs whitespace-nowrap">+</button>
						</div>
					</div>
				</div>
			)}

			{/* Botões - layout responsivo */}
			<div className="mt-2 flex gap-1 flex-wrap">
				<button onClick={save} className="px-2 py-1 rounded bg-green-600 text-white text-xs flex-1 min-w-0">Aplicar</button>
				<button onClick={reset} className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 dark:text-gray-100 text-gray-800 text-xs flex-1 min-w-0">Limpar</button>
			</div>
		</div>
	);
};

export default ChartColorPicker;


