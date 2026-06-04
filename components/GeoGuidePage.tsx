import React from 'react';
import { ArrowLeft, BookOpen, Clock, FileText } from 'lucide-react';
import {
  getGuideArticleBySlug,
  guideArticles,
  type GuideArticle,
  type GuideSection,
  type GuideTable
} from '../src/geo/guideContent';

type GeoGuidePageProps = {
  slug?: string;
  article?: GuideArticle;
  onBack?: () => void;
};

const slugToId = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const renderParagraphs = (paragraphs?: string[]) => {
  if (!paragraphs?.length) return null;

  return paragraphs.map((paragraph) => (
    <p key={paragraph} className="text-base leading-7 text-gray-700 dark:text-gray-300">
      {paragraph}
    </p>
  ));
};

const GuideTableBlock: React.FC<{ table: GuideTable }> = ({ table }) => (
  <div className="my-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
        <caption className="caption-top px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
          {table.caption}
        </caption>
        <thead className="bg-gray-50 dark:bg-gray-700/60">
          <tr>
            {table.headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {table.rows.map((row) => (
            <tr key={row.join('|')} className="align-top">
              {row.map((cell, index) => (
                <td
                  key={`${cell}-${index}`}
                  className="px-4 py-3 text-gray-700 first:font-medium first:text-gray-900 dark:text-gray-300 dark:first:text-white"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {table.note && (
      <p className="border-t border-gray-200 bg-gray-50 px-4 py-3 text-xs leading-5 text-gray-600 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-400">
        {table.note}
      </p>
    )}
  </div>
);

const GuideSectionBlock: React.FC<{ section: GuideSection }> = ({ section }) => (
  <section aria-labelledby={slugToId(section.heading)} className="space-y-4">
    <h2 id={slugToId(section.heading)} className="text-2xl font-bold text-gray-900 dark:text-white">
      {section.heading}
    </h2>
    {section.bluf && (
      <p className="rounded-lg border-l-4 border-blue-500 bg-blue-50 px-4 py-3 text-base font-medium leading-7 text-blue-950 dark:bg-blue-950/30 dark:text-blue-100">
        {section.bluf}
      </p>
    )}
    {renderParagraphs(section.paragraphs)}
    {section.bullets?.length ? (
      <ul className="list-disc space-y-2 pl-6 text-base leading-7 text-gray-700 dark:text-gray-300">
        {section.bullets.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    ) : null}
    {section.orderedSteps?.length ? (
      <ol className="list-decimal space-y-3 pl-6 text-base leading-7 text-gray-700 dark:text-gray-300">
        {section.orderedSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    ) : null}
    {section.subsections?.map((subsection) => (
      <div key={subsection.heading} className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{subsection.heading}</h3>
        {renderParagraphs(subsection.paragraphs)}
      </div>
    ))}
    {section.table && <GuideTableBlock table={section.table} />}
  </section>
);

export const GeoGuidePage: React.FC<GeoGuidePageProps> = ({ slug, article, onBack }) => {
  const currentSlug =
    slug || (typeof window !== 'undefined' ? window.location.pathname : guideArticles[0]?.slug);
  const selectedArticle = article || getGuideArticleBySlug(currentSlug || '') || guideArticles[0];

  if (!selectedArticle) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Không tìm thấy bài hướng dẫn</h1>
        <p className="mt-3 text-gray-700 dark:text-gray-300">
          Đường dẫn này chưa có nội dung hướng dẫn. Vui lòng quay lại trang tính toán dầm cầu trục.
        </p>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 py-8 dark:bg-gray-900">
      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 border-b border-gray-200 pb-6 dark:border-gray-700">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mb-5 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Quay lại
            </button>
          )}
          <div className="mb-4 flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
            <span className="inline-flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-500" aria-hidden="true" />
              Hướng dẫn kỹ thuật
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" aria-hidden="true" />
              {selectedArticle.readingTime}
            </span>
            <span className="inline-flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" aria-hidden="true" />
              Cập nhật {selectedArticle.updatedAt}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {selectedArticle.title}
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-700 dark:text-gray-300">{selectedArticle.description}</p>
          <aside
            aria-label="Tóm tắt nhanh"
            className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/70 dark:bg-blue-950/30"
          >
            <h2 className="text-base font-semibold text-blue-950 dark:text-blue-100">Tóm tắt nhanh</h2>
            <p className="mt-2 text-base leading-7 text-blue-950 dark:text-blue-100">{selectedArticle.summary}</p>
          </aside>
        </header>

        <div className="space-y-10">
          {selectedArticle.sections.map((section) => (
            <GuideSectionBlock key={section.heading} section={section} />
          ))}

          <section aria-labelledby="faq" className="space-y-4">
            <h2 id="faq" className="text-2xl font-bold text-gray-900 dark:text-white">
              Câu hỏi thường gặp
            </h2>
            <div className="space-y-4">
              {selectedArticle.faq.map((item) => (
                <section
                  key={item.question}
                  aria-labelledby={slugToId(item.question)}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <h3 id={slugToId(item.question)} className="text-lg font-semibold text-gray-900 dark:text-white">
                    {item.question}
                  </h3>
                  <p className="mt-2 text-base leading-7 text-gray-700 dark:text-gray-300">{item.answer}</p>
                </section>
              ))}
            </div>
          </section>

          <section aria-labelledby="references" className="space-y-4">
            <h2 id="references" className="text-2xl font-bold text-gray-900 dark:text-white">
              Nguồn tham khảo
            </h2>
            <ul className="space-y-3">
              {selectedArticle.references.map((reference) => (
                <li
                  key={reference.label}
                  className="rounded-lg border border-gray-200 bg-white p-4 text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  <strong className="text-gray-900 dark:text-white">{reference.label}:</strong> {reference.note}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </article>
    </main>
  );
};

export default GeoGuidePage;
