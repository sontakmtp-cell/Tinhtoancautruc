import { useEffect, useState } from 'react';

const PLOTLY_CDN_URL = 'https://cdn.plot.ly/plotly-2.33.0.min.js';

let plotlyPromise: Promise<void> | null = null;

/**
 * Đảm bảo Plotly đã được tải (inject <script> một lần duy nhất).
 * Nếu tải thất bại, promise vẫn resolve để biểu đồ bỏ qua một cách im lặng
 * và có thể thử lại ở lần sau.
 */
export const ensurePlotly = (): Promise<void> => {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }
  if (typeof (window as any).Plotly !== 'undefined') {
    return Promise.resolve();
  }

  if (!plotlyPromise) {
    plotlyPromise = new Promise<void>((resolve) => {
      const script = document.createElement('script');
      script.src = PLOTLY_CDN_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        plotlyPromise = null; // cho phép thử lại ở lần dùng tiếp theo
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  return plotlyPromise;
};

/**
 * Hook cho các component biểu đồ: trả về true khi Plotly đã sẵn sàng.
 * Plotly được tải on-demand (khi biểu đồ đầu tiên xuất hiện sau lần tính),
 * thay vì chặn lần tải trang đầu bằng script CDN ~3,5 MB.
 */
export const usePlotlyReady = (): boolean => {
  const [ready, setReady] = useState(
    () => typeof window !== 'undefined' && typeof (window as any).Plotly !== 'undefined'
  );

  useEffect(() => {
    let mounted = true;
    ensurePlotly().then(() => {
      if (mounted) {
        setReady(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return ready;
};
