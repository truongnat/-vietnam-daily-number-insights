
import React, { useState, useEffect, useMemo } from 'react';
import { getAllHistoricalData } from '../utils/storage';
import { FrequencyChart } from './FrequencyChart';

export const FrequencyDashboard: React.FC = () => {
    const [frequencyData, setFrequencyData] = useState<Map<string, number>>(new Map());
    const [dateRange, setDateRange] = useState(30);

    useEffect(() => {
        const historicalData = getAllHistoricalData();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - dateRange);

        const freqMap = new Map<string, number>();

        Object.entries(historicalData).forEach(([dateStr, data]) => {
            const entryDate = new Date(dateStr);
            if (entryDate >= thirtyDaysAgo) {
                data.analysis.topNumbers.forEach(num => {
                    const currentCount = freqMap.get(num.number) || 0;
                    freqMap.set(num.number, currentCount + 1);
                });
            }
        });

        setFrequencyData(freqMap);
    }, [dateRange]);

    const hasData = useMemo(() => frequencyData.size > 0, [frequencyData]);

    return (
        <div className="w-full max-w-6xl animate-fade-in text-center">
            <h2 className="text-2xl font-semibold mb-2 text-teal-300">Thống kê tần suất xuất hiện</h2>
            <p className="text-gray-400 mb-8">
                Biểu đồ thể hiện số lần mỗi con số (00-99) xuất hiện trong top 4 hàng ngày, trong vòng {dateRange} ngày qua.
            </p>

            {hasData ? (
                <FrequencyChart data={frequencyData} />
            ) : (
                <div className="mt-16 text-gray-500">
                    <p>Không có đủ dữ liệu lịch sử để hiển thị biểu đồ.</p>
                    <p className="text-sm">Hãy quay lại vào ngày mai sau khi có thêm dữ liệu được thu thập.</p>
                </div>
            )}
        </div>
    );
};
