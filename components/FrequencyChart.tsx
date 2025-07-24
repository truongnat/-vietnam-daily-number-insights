
import React, { useMemo } from 'react';

interface FrequencyChartProps {
    data: Map<string, number>;
}

const ChartBar: React.FC<{ number: string; count: number; maxHeight: number; }> = ({ number, count, maxHeight }) => {
    const heightPercentage = maxHeight > 0 ? (count / maxHeight) * 100 : 0;

    return (
        <div className="flex flex-col items-center justify-end h-48 group relative" title={`Số ${number}: ${count} lần`}>
            <div 
                className="w-full bg-gray-700 rounded-t-sm group-hover:bg-teal-400 transition-all duration-300 ease-out"
                style={{ height: `${heightPercentage}%`, minHeight: count > 0 ? '2px' : '0' }}
            >
            </div>
             <div 
                className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block px-2 py-1 bg-gray-900 border border-gray-600 text-white text-xs rounded-md shadow-lg z-10 whitespace-nowrap"
            >
                {`Số ${number}: ${count} lần`}
            </div>
            <span className="text-xs text-gray-500 mt-1">{number}</span>
        </div>
    );
};


export const FrequencyChart: React.FC<FrequencyChartProps> = ({ data }) => {
    const maxCount = useMemo(() => {
        if (data.size === 0) return 0;
        return Math.max(...Array.from(data.values()));
    }, [data]);

    return (
        <div className="bg-gray-800/50 p-4 sm:p-6 rounded-xl border border-gray-700">
            <div className="grid grid-cols-10 sm:grid-cols-20 md:grid-cols-25 lg:grid-cols-25 gap-x-1 gap-y-4">
                 {Array.from({ length: 100 }, (_, i) => {
                    const numStr = String(i).padStart(2, '0');
                    const count = data.get(numStr) || 0;
                    return <ChartBar key={numStr} number={numStr} count={count} maxHeight={maxCount} />;
                })}
            </div>
        </div>
    );
};
