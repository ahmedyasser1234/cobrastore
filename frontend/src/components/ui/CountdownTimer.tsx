import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface Props {
  targetDate: string | Date;
}

const CountdownTimer: React.FC<Props> = ({ targetDate }) => {
  const { lang } = useTranslation();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      return timeLeft;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-2">
      {[
        { label: lang === 'ar' ? 'يوم' : 'Days', value: timeLeft.days },
        { label: lang === 'ar' ? 'ساعة' : 'Hours', value: timeLeft.hours },
        { label: lang === 'ar' ? 'دقيقة' : 'Mins', value: timeLeft.minutes },
        { label: lang === 'ar' ? 'ثانية' : 'Secs', value: timeLeft.seconds }
      ].map((item, idx) => (
        <div key={idx} className="bg-surface text-text-main px-2 py-1 rounded border border-border flex flex-col items-center">
          <span className="text-sm font-black text-primary">{item.value.toString().padStart(2, '0')}</span>
          <span className="text-[8px] uppercase tracking-widest text-text-muted font-bold">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;
