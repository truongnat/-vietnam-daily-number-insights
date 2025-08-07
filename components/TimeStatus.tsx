
import React from 'react';

interface TimeStatusProps {
    // No props needed anymore
}

export const TimeStatus: React.FC<TimeStatusProps> = () => {
    const getVietnamDateString = () => {
        const now = new Date();
        return new Intl.DateTimeFormat('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(now);
    };

    return (
        <div className="w-full max-w-4xl text-center mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-lg font-semibold text-gray-300">
                Ngày hôm nay (Việt Nam): {getVietnamDateString()}
            </p>
            <p className="text-sm text-gray-400 mt-1">
                Phân tích số may mắn dựa trên tin tức và dữ liệu thống kê hàng ngày.
            </p>
        </div>
    );
};
