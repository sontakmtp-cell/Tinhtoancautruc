import React from 'react';

interface ChartFrameProps {
  id?: string;
  title: string;
  description?: string;
  insight?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const ChartFrame: React.FC<ChartFrameProps> = ({
  id,
  title,
  description,
  insight,
  children,
  footer,
}) => (
  <section
    id={id}
    aria-label={title}
    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
  >
    <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-700 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-lg">
            {title}
          </h3>
          {description && (
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
        {insight && (
          <div className="shrink-0 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
            {insight}
          </div>
        )}
      </div>
    </div>
    <div className="px-2 py-4 sm:px-4">{children}</div>
    {footer && (
      <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-700 sm:px-6">
        {footer}
      </div>
    )}
  </section>
);

