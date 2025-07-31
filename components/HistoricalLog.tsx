
import React, { useState, useEffect } from 'react';
import { getAllHistoricalData } from '../utils/storage';
import type { HistoricalData } from '../types';
import { HistoricalLogItem } from './HistoricalLogItem';

export const HistoricalLog: React.FC = () => {
    const [historicalData, setHistoricalData] = useState<HistoricalData>({});
    const [sortedKeys, setSortedKeys] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAllHistoricalData();
                setHistoricalData(data);
                // Sort keys in descending order (most recent first)
                const keys = Object.keys(data).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
                setSortedKeys(keys);
            } catch (error) {
                console.error("Error fetching historical data:", error);
                setHistoricalData({});
                setSortedKeys([]);
            }
        };

        fetchData();
    }, []);

    if (sortedKeys.length === 0) {
        return (
            <div className="w-full max-w-4xl text-center mt-16 text-gray-500 bg-gray-800/50 p-8 rounded-lg">
                <p className="text-lg">Không có dữ liệu lịch sử nào được tìm thấy.</p>
                <p className="text-sm mt-2">Dữ liệu phân tích sẽ được lưu lại đây mỗi ngày để bạn có thể xem lại.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl animate-fade-in text-center">
            <h2 className="text-2xl font-semibold mb-2 text-teal-300">Nhật Ký Phân Tích</h2>
            <p className="text-gray-400 mb-8">
                Xem lại kết quả phân tích và độ chính xác của các gợi ý trong quá khứ.
            </p>
            <div className="space-y-4">
                {sortedKeys.map(dateKey => (
                    <HistoricalLogItem 
                        key={dateKey} 
                        dateKey={dateKey} 
                        storedData={historicalData[dateKey]} 
                    />
                ))}
            </div>
        </div>
    );
};