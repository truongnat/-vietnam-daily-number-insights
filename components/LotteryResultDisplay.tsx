
import React from 'react';
import type { LotteryResult, LuckyNumber } from '../types';

interface LotteryResultDisplayProps {
  luckyNumbers: LuckyNumber[];
  lotteryResult: LotteryResult;
}

const ResultIcon: React.FC<{ status: 'de' | 'lo' | 'miss' }> = ({ status }) => {
  if (status === 'de') {
    return (
      <div className="flex items-center gap-2 text-amber-300 font-semibold">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 animate-pulse"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006a1 1 0 00.95.69h5.272c1.182 0 1.668 1.518.82 2.154l-4.26 3.087a1 1 0 00-.364 1.118l1.598 5.132c.394 1.268-.962 2.37-2.09 1.642l-4.24-3.08a1 1 0 00-1.18 0l-4.24 3.08c-1.128.728-2.484-.374-2.09-1.642l1.598-5.132a1 1 0 00-.364-1.118L2.04 11.06c-.848-.636-.362-2.154.82-2.154h5.272a1 1 0 00.95-.69L10.788 3.21z" clipRule="evenodd" /></svg>
        Trúng Đề
      </div>
    );
  }
  if (status === 'lo') {
    return (
      <div className="flex items-center gap-2 text-green-400 font-semibold">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12.75 6a.75.75 0 00-1.5 0v8.25H9.75a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5V6z" clipRule="evenodd" /><path d="M5.013 7.427a2.25 2.25 0 013.182 0l4.318 4.318a.75.75 0 001.06 0l4.318-4.318a2.25 2.25 0 013.182 3.182l-4.318 4.318a.75.75 0 000 1.06l4.318 4.318a2.25 2.25 0 01-3.182 3.182l-4.318-4.318a.75.75 0 00-1.06 0l-4.318 4.318a2.25 2.25 0 01-3.182-3.182l4.318-4.318a.75.75 0 000-1.06L5.013 10.61a2.25 2.25 0 010-3.182z" /></svg>
        Trúng Lô
      </div>
    );
  }
  return (
      <div className="flex items-center gap-2 text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2.25a.75.75 0 01.75.75v.756a49.106 49.106 0 019.166 4.382.75.75 0 01-.334 1.323l-3.344-.836a47.533 47.533 0 00-2.656 3.482.75.75 0 01-1.21-.673l.323-2.031a47.593 47.593 0 00-4.908 4.456.75.75 0 01-1.258-.55l.13-2.68a47.588 47.588 0 00-4.432 4.14.75.75 0 01-1.23-.711l.398-2.39a49.332 49.332 0 01-3.234 2.56.75.75 0 01-.62-1.282A49.023 49.023 0 0111.25 3.006V2.25A.75.75 0 0112 2.25z" /></svg>
        Trượt
      </div>
  );
};


export const LotteryResultDisplay: React.FC<LotteryResultDisplayProps> = ({ luckyNumbers, lotteryResult }) => {
    const results = luckyNumbers.map(ln => {
        const isSpecialPrizeWin = lotteryResult.specialPrize === ln.number;
        const isLotoWin = lotteryResult.allPrizes.includes(ln.number);
        let status: 'de' | 'lo' | 'miss' = 'miss';
        if(isSpecialPrizeWin) status = 'de';
        else if (isLotoWin) status = 'lo';
        return { ...ln, status };
    });

    const hasWin = results.some(r => r.status !== 'miss');

    return (
        <div className={`w-full max-w-2xl mx-auto my-12 p-6 relative rounded-2xl border ${hasWin ? 'border-green-400/50' : 'border-gray-700'} bg-gray-800/50 shadow-xl animate-fade-in`}>
             <h3 className="text-xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">
                Đối Chiếu Kết Quả Xổ Số
            </h3>
            <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                    <p className="text-gray-400">Hai số cuối Giải Đặc Biệt hôm nay:</p>
                    <p className="text-5xl font-bold text-white tracking-widest" style={{ textShadow: '0 0 10px rgba(255, 255, 255, 0.3)' }}>{lotteryResult.specialPrize}</p>
                </div>

                <div className="w-full my-4 border-t border-gray-700/50"></div>

                <div className="w-full space-y-3">
                    {results.map((res, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-900/50 p-3 rounded-lg">
                            <div className="flex items-center gap-4">
                               <p className="text-4xl font-bold text-gray-300">{res.number}</p>
                               <div>
                                   <p className="text-sm font-semibold text-white">{res.strategy}</p>
                                   <p className="text-xs text-gray-500">{res.strategyDescription}</p>
                               </div>
                            </div>
                            <ResultIcon status={res.status} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};