import { useState, useEffect } from 'react';

export function useCairoTime() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const cairoTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Cairo' }));
      const hours = cairoTime.getHours().toString().padStart(2, '0');
      const minutes = cairoTime.getMinutes().toString().padStart(2, '0');
      const seconds = cairoTime.getSeconds().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return time;
}