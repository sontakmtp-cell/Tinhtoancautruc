import type { GeoTechnicalTable, GeoTechnicalTableId } from '../src/geo/technicalTables';
import { geoTechnicalTables } from '../src/geo/technicalTables';

type GeoTechnicalTablesProps = {
  tables?: GeoTechnicalTable[];
  tableIds?: GeoTechnicalTableId[];
  className?: string;
};

const getVisibleTables = (
  tables: GeoTechnicalTable[],
  tableIds?: GeoTechnicalTableId[],
) => {
  if (!tableIds?.length) {
    return tables;
  }

  const allowedIds = new Set(tableIds);
  return tables.filter((table) => allowedIds.has(table.id));
};

export const GeoTechnicalTables = ({
  tables = geoTechnicalTables,
  tableIds,
  className = '',
}: GeoTechnicalTablesProps) => {
  const visibleTables = getVisibleTables(tables, tableIds);

  if (visibleTables.length === 0) {
    return null;
  }

  return (
    <section className={`space-y-8 ${className}`} aria-label="Bang ky thuat dam cau truc">
      {visibleTables.map((table) => (
        <article
          key={table.id}
          className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="space-y-2 border-b border-gray-200 px-4 py-4 dark:border-gray-700 sm:px-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {table.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">{table.guidanceNote}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <caption className="sr-only">{table.caption}</caption>
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600 dark:bg-gray-900/60 dark:text-gray-300">
                <tr>
                  {table.columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className={`border-b border-gray-200 px-4 py-3 font-semibold dark:border-gray-700 sm:px-6 ${
                        column.align === 'center' ? 'text-center' : 'text-left'
                      }`}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700 dark:divide-gray-700 dark:text-gray-200">
                {table.rows.map((row) => (
                  <tr key={row.id} className="bg-white align-top dark:bg-gray-800">
                    {table.columns.map((column) => {
                      const isRowHeader = column.key === table.rowHeaderKey;
                      const cellClassName = `px-4 py-4 sm:px-6 ${
                        column.align === 'center' ? 'text-center' : 'text-left'
                      }`;

                      if (isRowHeader) {
                        return (
                          <th
                            key={column.key}
                            scope="row"
                            className={`${cellClassName} min-w-44 font-semibold text-gray-900 dark:text-white`}
                          >
                            {row.cells[column.key]}
                          </th>
                        );
                      }

                      return (
                        <td key={column.key} className={`${cellClassName} min-w-56`}>
                          {row.cells[column.key]}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="border-t border-gray-200 bg-blue-50 px-4 py-3 text-xs text-blue-900 dark:border-gray-700 dark:bg-blue-950/30 dark:text-blue-100 sm:px-6">
            {table.caption}
          </p>
        </article>
      ))}
    </section>
  );
};

export default GeoTechnicalTables;
