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
    <div className="flex flex-col gap-2 p-4 border rounded bg-white shadow">
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={handleExport}
      >
        Xuất dữ liệu lịch sử (Export)
      </button>
      <input
        type="file"
        accept="application/json"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleImport}
      />
      <button
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        onClick={() => fileInputRef.current?.click()}
      >
        Nhập dữ liệu lịch sử (Import)
      </button>
    </div>
  );
};

export default LocalStorageExportImport;
