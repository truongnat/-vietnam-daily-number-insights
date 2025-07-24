import React, { useMemo } from 'react';

interface FrequencyChartProps {
    data: Map<string, number>;
    stats: {
        hot?: string;
        cold?: string;
        potential?: string;
    };
}

const ChartBar: React.FC<{ 
    number: string; 
    count: number; 
    maxHeight: number; 
    highlight: 'hot' | 'cold' | 'potential' | null;
}> = ({ number, count, maxHeight, highlight }) => {
    const heightPercentage = maxHeight > 0 ? (count / maxHeight) * 100 : 0;

    let barColor = "bg-gray-700 group-hover:bg-teal-400";
    let labelColor = "text-gray-500 group-hover:text-teal-300";
    let tooltipText = `Số ${number}: ${count} lần`;

    if (highlight === 'hot') {
        barColor = "bg-orange-500 group-hover:bg-orange-400";
        labelColor = "text-orange-400 font-bold";
        tooltipText = `Số Nóng: ${number} (${count} lần)`;
    } else if (highlight === 'potential') {
        barColor = "bg-violet-500 group-hover:bg-violet-400";
        labelColor = "text-violet-400 font-bold";
        tooltipText = `Số Tiềm Năng: ${number} (${count} lần)`;
    } else if (highlight === 'cold') {
        labelColor = "text-cyan-400 font-bold";
        tooltipText = `Số Lạnh: ${number} (0 lần)`;
    }

    return (
        <div className="flex flex-col items-center justify-end h-48 group relative" title={tooltipText}>
            <div 
                className={`w-full rounded-t-sm transition-all duration-300 ease-out ${barColor}`}
                style={{ height: `${heightPercentage}%`, minHeight: count > 0 ? '2px' : '0' }}
            >
            </div>
             <div 
                className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block px-2 py-1 bg-gray-900 border border-gray-600 text-white text-xs rounded-md shadow-lg z-10 whitespace-nowrap"
            >
                {tooltipText}
            </div>
            <span className={`text-xs mt-1 transition-colors ${labelColor}`}>{number}</span>
        </div>
    );
};


export const FrequencyChart: React.FC<FrequencyChartProps> = ({ data, stats }) => {
    const maxCount = useMemo(() => {
        if (data.size === 0) return 0;
        return Math.max(...Array.from(data.values()), 1); // use 1 as min max height to avoid division by zero
    }, [data]);

    return (
        <div className="bg-gray-800/50 p-4 sm:p-6 rounded-xl border border-gray-700">
            <div className="grid grid-cols-10 sm:grid-cols-20 md:grid-cols-25 lg:grid-cols-25 gap-x-1 gap-y-4">
                 {Array.from({ length: 100 }, (_, i) => {
                    const numStr = String(i).padStart(2, '0');
                    const count = data.get(numStr) || 0;
                    
                    let highlight: 'hot' | 'cold' | 'potential' | null = null;
                    if (numStr === stats.hot) highlight = 'hot';
                    else if (numStr === stats.potential) highlight = 'potential';
                    else if (numStr === stats.cold) highlight = 'cold';

                    return <ChartBar key={numStr} number={numStr} count={count} maxHeight={maxCount} highlight={highlight} />;
                })}
            </div>
             <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-6 text-xs text-gray-400">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div>Số Nóng</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-violet-500"></div>Số Tiềm Năng</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2 border-cyan-400"></div>Số Lạnh</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-700"></div>Khác</div>
            </div>
        </div>
    );
};