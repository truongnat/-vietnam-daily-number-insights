import React, { useState, useEffect, useMemo } from 'react';
import { getAllHistoricalData, getVietnamDateKey } from '@/utils/storage';
import { FrequencyChart } from '@/components/FrequencyChart';
import { StatCard } from '@/components/StatCard';

const FireIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071 1.071l9 9a.75.75 0 001.071-1.071l-9-9zM12 3a.75.75 0 01.75.75v6.19l1.72-1.72a.75.75 0 111.06 1.06l-3 3a.75.75 0 01-1.06 0l-3-3a.75.75 0 111.06-1.06l1.72 1.72V3.75A.75.75 0 0112 3zM15.963 15a.75.75 0 00-1.071 1.071l4.5 4.5a.75.75 0 001.071-1.071l-4.5-4.5zM17.625 15.328a9 9 0 10-11.25 0 8.966 8.966 0 005.625 5.672 8.966 8.966 0 005.625-5.672zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
    </svg>
);

const SnowflakeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 1.5a.75.75 0 01.75.75v3.536l1.22-.814a.75.75 0 01.914 1.2l-1.964 1.309 1.964 1.309a.75.75 0 11-.914 1.2l-1.22-.814v3.536a.75.75 0 01-1.5 0v-3.536l-1.22.814a.75.75 0 11-.914-1.2l1.964-1.309-1.964-1.309a.75.T5 0 01.914-1.2l1.22.814V2.25A.75.75 0 0112 1.5zM4.636 7.19a.75.75 0 011.06 0l2.122 2.12.814-1.22a.75.75 0 011.2.914l-1.31 1.964 1.31 1.964a.75.75 0 11-1.2.914l-.814-1.22-2.121 2.121a.75.75 0 11-1.06-1.06l2.12-2.121-2.12-2.121a.75.75 0 010-1.06zM19.364 7.19a.75.75 0 00-1.06 0l-2.122 2.12-.814-1.22a.75.75 0 10-1.2.914l1.31 1.964-1.31 1.964a.75.75 0 101.2.914l.814-1.22 2.121 2.121a.75.75 0 101.06-1.06l-2.12-2.121 2.12-2.121a.75.75 0 000-1.06z" />
    </svg>
);

const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.435A.75.75 0 0115.75 15.75v-1.846a.75.75 0 00-.58-.727c-1.952-.447-3.527-1.464-4.663-2.618a.75.75 0 01.22-1.223zM11.25 10.5a.75.75 0 00-1.5 0v2.068a.75.75 0 01-.75.75H7.5a.75.75 0 000 1.5h1.068a.75.75 0 01.75.75v1.068a.75.75 0 001.5 0v-1.068a.75.75 0 01.75-.75h1.068a.75.75 0 000-1.5H12a.75.75 0 01-.75-.75V10.5zM3 4.5a.75.75 0 01.75.75V7.5a.75.75 0 01-1.5 0V5.25A.75.75 0 013 4.5zM4.5 3a.75.75 0 00-.75.75V5.25a.75.75 0 001.5 0V3.75A.75.75 0 004.5 3zM7.5 3a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 017.5 3z" clipRule="evenodd" />
    </svg>
);

export const FrequencyDashboard: React.FC = () => {
    const [dateRange, setDateRange] = useState(30);
    const [stats, setStats] = useState<{hot?: string; cold?: string; potential?: string;}>({});
    const [frequencyData, setFrequencyData] = useState<Map<string, number>>(new Map());

    useEffect(() => {
        const fetchAndAnalyzeData = async () => {
            try {
                const historicalData = await getAllHistoricalData();
                const rangeCutoff = new Date();
                rangeCutoff.setDate(rangeCutoff.getDate() - dateRange);

                const freqMap = new Map<string, number>();

                Object.entries(historicalData).forEach(([dateStr, data]) => {
                    const entryDate = new Date(dateStr);
                    if (entryDate >= rangeCutoff) {
                        data.analysis.topNumbers.forEach(num => {
                            const currentCount = freqMap.get(num.number) || 0;
                            freqMap.set(num.number, currentCount + 1);
                        });
                    }
                });

                if (freqMap.size > 0) {
                    const hotNumber = [...freqMap.entries()].reduce((a, b) => a[1] > b[1] ? a : b)[0];

                    let coldNumber: string | undefined = undefined;
                    const allNumbers = Array.from({ length: 100 }, (_, i) => String(i).padStart(2, '0'));
                    const appearedNumbers = new Set(freqMap.keys());
                    const coldNumbers = allNumbers.filter(n => !appearedNumbers.has(n));
                    if (coldNumbers.length > 0) {
                        coldNumber = coldNumbers[Math.floor(Math.random() * coldNumbers.length)];
                    }

                    let potentialNumber: string | undefined = undefined;
                    const yesterdayKey = getVietnamDateKey(new Date(Date.now() - 864e5));
                    const yesterdayData = historicalData[yesterdayKey];
                    if (yesterdayData) {
                        const yesterdayNumbers = yesterdayData.analysis.topNumbers.map(n => n.number);
                        const candidates = yesterdayNumbers.filter(n => (freqMap.get(n) || 0) <= 2);
                        if (candidates.length > 0) {
                            potentialNumber = candidates[0];
                        }
                    }

                    setStats({ hot: hotNumber, cold: coldNumber, potential: potentialNumber });
                } else {
                    setStats({});
                }

                setFrequencyData(freqMap);
            } catch (error) {
                console.error("Error fetching and analyzing historical data:", error);
                setStats({});
                setFrequencyData(new Map());
            }
        };

        fetchAndAnalyzeData();
    }, [dateRange]);

    const hasData = useMemo(() => frequencyData.size > 0, [frequencyData]);

    const DateRangeButton: React.FC<{range: number}> = ({ range }) => {
        const baseClasses = "px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";
        const activeClasses = "bg-blue-600 text-white shadow-md";
        const inactiveClasses = "bg-gray-700 text-gray-300 hover:bg-gray-600";
        return (
             <button
                onClick={() => setDateRange(range)}
                className={`${baseClasses} ${dateRange === range ? activeClasses : inactiveClasses}`}
              >
                {range} ngày
            </button>
        );
    };

    return (
        <div className="w-full max-w-6xl animate-fade-in text-center">
            <h2 className="text-2xl font-semibold mb-2 text-teal-300">Bảng Phân Tích Tần Suất</h2>
            <p className="text-gray-400 mb-4">
                Phân tích số lần các con số xuất hiện trong top 4 tin tức hàng ngày.
            </p>
            
            <div className="flex items-center justify-center p-1 bg-gray-800 rounded-full mb-8 shadow-inner w-fit mx-auto space-x-2">
                <DateRangeButton range={7} />
                <DateRangeButton range={30} />
                <DateRangeButton range={90} />
            </div>

            {hasData ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 text-left">
                       <StatCard 
                           icon={<FireIcon className="w-6 h-6"/>}
                           label="Số Nóng"
                           number={stats.hot}
                           description={`Xuất hiện nhiều nhất trong ${dateRange} ngày qua.`}
                           colorClass="bg-orange-500/20 text-orange-400"
                       />
                       <StatCard 
                           icon={<SnowflakeIcon className="w-6 h-6"/>}
                           label="Số Lạnh"
                           number={stats.cold}
                           description={`Chưa xuất hiện trong ${dateRange} ngày qua.`}
                           colorClass="bg-cyan-500/20 text-cyan-400"
                       />
                       <StatCard 
                           icon={<SparklesIcon className="w-6 h-6"/>}
                           label="Số Tiềm Năng"
                           number={stats.potential}
                           description="Mới nổi gần đây sau thời gian im ắng."
                           colorClass="bg-violet-500/20 text-violet-400"
                       />
                    </div>
                    <FrequencyChart data={frequencyData} stats={stats} />
                </>
            ) : (
                <div className="mt-16 text-gray-500 bg-gray-800/50 p-8 rounded-lg">
                    <p className="text-lg">Không có đủ dữ liệu lịch sử để hiển thị phân tích.</p>
                    <p className="text-sm mt-2">Hãy quay lại vào ngày mai sau khi có thêm dữ liệu được thu thập.</p>
                </div>
            )}
        </div>
    );
};