import { useEffect, useMemo, useState } from 'react';

export const CHART_COLORS = {
  primary: '#2563eb',
  primaryDark: '#60a5fa',
  comparison: '#64748b',
  comparisonDark: '#cbd5e1',
  critical: '#dc2626',
  criticalDark: '#f87171',
  warning: '#d97706',
  warningDark: '#fbbf24',
  success: '#16a34a',
  successDark: '#4ade80',
};

export const useChartTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    () => document.documentElement.classList.contains('dark'),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return useMemo(() => ({
    isDarkMode,
    primary: isDarkMode ? CHART_COLORS.primaryDark : CHART_COLORS.primary,
    comparison: isDarkMode ? CHART_COLORS.comparisonDark : CHART_COLORS.comparison,
    critical: isDarkMode ? CHART_COLORS.criticalDark : CHART_COLORS.critical,
    warning: isDarkMode ? CHART_COLORS.warningDark : CHART_COLORS.warning,
    success: isDarkMode ? CHART_COLORS.successDark : CHART_COLORS.success,
    text: isDarkMode ? '#e2e8f0' : '#334155',
    mutedText: isDarkMode ? '#94a3b8' : '#64748b',
    grid: isDarkMode ? '#334155' : '#e2e8f0',
    tooltipBackground: isDarkMode ? '#111827' : '#ffffff',
  }), [isDarkMode]);
};
