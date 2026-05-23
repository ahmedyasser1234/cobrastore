import React, { useState, useEffect } from 'react';
import { Timer, Zap } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface FlashSaleCountdownProps {
  endTime: Date;
  titleEn?: string;
  titleAr?: string;
}

const FlashSaleCountdown: React.FC<FlashSaleCountdownProps> = ({ 
  endTime, 
  titleEn = "Flash Sale Ends In", 
  titleAr = "ينتهي العرض خلال" 
}) => {
  const { lang } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +new Date(endTime) - +new Date();
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }
    return timeLeft;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const addZero = (num: number) => num < 10 ? `0${num}` : num;

  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    return null; // Sale ended
  }

  return (
    <div className="bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 rounded-2xl p-4 shadow-lg shadow-red-500/20 text-white flex flex-col sm:flex-row items-center justify-between gap-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm border border-white/30 animate-pulse">
          <Zap size={24} className="text-yellow-300 fill-yellow-300" />
        </div>
        <h3 className="font-black uppercase tracking-widest text-lg drop-shadow-md">
          {lang === 'ar' ? titleAr : titleEn}
        </h3>
      </div>

      <div className="flex items-center gap-3 font-mono">
        {timeLeft.days > 0 && (
          <>
            <div className="flex flex-col items-center bg-black/20 rounded-xl px-4 py-2 min-w-[70px] backdrop-blur-sm border border-white/10 shadow-inner">
              <span className="text-2xl font-black">{addZero(timeLeft.days)}</span>
              <span className="text-[9px] uppercase tracking-widest font-bold opacity-80">{lang === 'ar' ? 'يوم' : 'Days'}</span>
            </div>
            <span className="text-2xl font-black opacity-50 animate-pulse">:</span>
          </>
        )}
        <div className="flex flex-col items-center bg-black/20 rounded-xl px-4 py-2 min-w-[70px] backdrop-blur-sm border border-white/10 shadow-inner">
          <span className="text-2xl font-black">{addZero(timeLeft.hours)}</span>
          <span className="text-[9px] uppercase tracking-widest font-bold opacity-80">{lang === 'ar' ? 'ساعة' : 'Hours'}</span>
        </div>
        <span className="text-2xl font-black opacity-50 animate-pulse">:</span>
        <div className="flex flex-col items-center bg-black/20 rounded-xl px-4 py-2 min-w-[70px] backdrop-blur-sm border border-white/10 shadow-inner">
          <span className="text-2xl font-black">{addZero(timeLeft.minutes)}</span>
          <span className="text-[9px] uppercase tracking-widest font-bold opacity-80">{lang === 'ar' ? 'دقيقة' : 'Mins'}</span>
        </div>
        <span className="text-2xl font-black opacity-50 animate-pulse">:</span>
        <div className="flex flex-col items-center bg-black/20 rounded-xl px-4 py-2 min-w-[70px] backdrop-blur-sm border border-white/10 shadow-inner text-yellow-300">
          <span className="text-2xl font-black">{addZero(timeLeft.seconds)}</span>
          <span className="text-[9px] uppercase tracking-widest font-bold opacity-80 text-white">{lang === 'ar' ? 'ثانية' : 'Secs'}</span>
        </div>
      </div>
    </div>
  );
};

export default FlashSaleCountdown;
