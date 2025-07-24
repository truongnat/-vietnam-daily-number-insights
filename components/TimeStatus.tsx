
import React from 'react';

interface TimeStatusProps {
    isAfterCutoff: boolean;
}

export const TimeStatus: React.FC<TimeStatusProps> = ({ isAfterCutoff }) => {
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
                {isAfterCutoff
                    ? "Phân tích dựa trên các sự kiện được báo cáo trước 4:00 chiều."
                    : "Đang chờ dữ liệu đầy đủ của ngày hôm nay. Phân tích sẽ hoàn tất sau 4:00 chiều giờ Việt Nam."}
            </p>
        </div>
    );
};
