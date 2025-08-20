import React, { useRef } from 'react';

/**
 * Component for exporting and importing localStorage historical data
 */
const LocalStorageExportImport: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export localStorage data as JSON file
  const handleExport = () => {
    try {
      const data = localStorage.getItem('historicalData');
      if (!data) {
        alert('Không có dữ liệu để xuất.');
        return;
      }
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'historicalData.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Lỗi khi xuất dữ liệu: ' + error);
    }
  };

  // Import JSON file and save to localStorage
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        localStorage.setItem('historicalData', JSON.stringify(parsed));
        alert('Nhập dữ liệu thành công!');
      } catch (error) {
        alert('Lỗi khi nhập dữ liệu: ' + error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl shadow-lg bg-gray-800 border border-gray-700 items-center w-full">
      <div className="text-lg font-semibold text-white mb-2">Quản lý dữ liệu lịch sử</div>
      <button
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-150"
        onClick={handleExport}
      >
        <span className="inline-block mr-2">📤</span> Xuất dữ liệu lịch sử
      </button>
      <input
        type="file"
        accept="application/json"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleImport}
      />
      <button
        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors duration-150"
        onClick={() => fileInputRef.current?.click()}
      >
        <span className="inline-block mr-2">📥</span> Nhập dữ liệu lịch sử
      </button>
      <div className="text-xs text-gray-400 mt-2 text-center">Bạn có thể xuất file JSON để sao lưu hoặc nhập lại khi cần khôi phục dữ liệu.</div>
    </div>
  );
};

export default LocalStorageExportImport;
