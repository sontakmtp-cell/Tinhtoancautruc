import React from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, Clock, FileText, ListChecks, Ruler, ShieldCheck } from 'lucide-react';
import {
  getGuideArticleBySlug,
  guideArticles,
  type GuideArticle,
  type GuideFormula,
  type GuideSection,
  type GuideTable
} from '../src/geo/guideContent';
import GeoStructuredData from './GeoStructuredData';
import { buildFAQPageJsonLd, buildTechArticleJsonLd, getRouteMetadata } from '../src/geo/seo';

type GeoGuidePageProps = {
  slug?: string;
  article?: GuideArticle;
  onBack?: () => void;
  onNavigate?: (path: string) => void;
};

const slugToId = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const calculationPageSlug = '/huong-dan/tinh-toan-dam-cau-truc';
const formulaPageSlug = '/huong-dan/cong-thuc-tinh-dam-cau-truc';

const calculationProofPoints = [
  {
    label: 'Đầu vào',
    value: '9 nhóm dữ liệu',
    note: 'Tải bánh xe, nhịp dầm, vật liệu, tiết diện và chế độ vận hành.',
  },
  {
    label: 'Kiểm tra',
    value: '5 lớp an toàn',
    note: 'Bền, ổn định, độ võng, cấu tạo ray và chi tiết liên kết.',
  },
  {
    label: 'Đầu ra',
    value: 'PDF + biểu đồ',
    note: 'Nội lực, ứng suất, độ võng và bảng thông số để rà soát.',
  },
];

const quickChecklist = [
  'Có dữ liệu catalogue cầu trục trước khi chốt tải bánh xe.',
  'Tách riêng tải đứng, tải ngang và tải động khi lập tổ hợp.',
  'Không chốt tiết diện nếu mới kiểm tra ứng suất mà chưa kiểm tra độ võng.',
  'Ghi rõ giả thiết, tiêu chuẩn và nguồn số liệu trong thuyết minh.',
];

const renderParagraphs = (paragraphs?: string[]) => {
  if (!paragraphs?.length) return null;

  return paragraphs.map((paragraph) => (
    <p key={paragraph} className="max-w-[68ch] text-base leading-8 text-slate-700 dark:text-slate-300">
      {paragraph}
    </p>
  ));
};

const formatEquation = (equation: string): string => {
  const replacements: Array<[RegExp, string]> = [
    [/P_nang/g, 'Pₙâng'],
    [/P_thietbi/g, 'Pₜhiết bị'],
    [/gamma_thep/g, 'γₜhép'],
    [/Mmax/g, 'Mₘₐₓ'],
    [/Qmax/g, 'Qₘₐₓ'],
    [/Jxi/g, 'Jₓᵢ'],
    [/Jx/g, 'Jₓ'],
    [/Jy/g, 'Jᵧ'],
    [/Wx_tren/g, 'Wₓ,trên'],
    [/Wx_duoi/g, 'Wₓ,dưới'],
    [/Wx/g, 'Wₓ'],
    [/Wy/g, 'Wᵧ'],
    [/y_tren/g, 'yₜrên'],
    [/y_duoi/g, 'y_dưới'],
    [/yc/g, 'y꜀'],
    [/yi/g, 'yᵢ'],
    [/di/g, 'dᵢ'],
    [/Ai/g, 'Aᵢ'],
    [/A_web/g, 'Aweb'],
    [/f_allow/g, 'fₐllow'],
    [/sigma_allow/g, 'σₐllow'],
    [/sigma_cr/g, 'σ꜀r'],
    [/sigma_u/g, 'σᵤ'],
    [/K_sigma/g, 'Kσ'],
    [/K_buckling/g, 'Kᵦ'],
    [/n_f/g, 'nꜰ'],
    [/tau/g, 'τ'],
    [/sqrt/g, '√'],
    [/\^4/g, '⁴'],
    [/\^3/g, '³'],
    [/\^2/g, '²'],
    [/\btổng\b/gi, 'Σ'],
    [/\sx\s/g, ' × '],
  ];

  return replacements.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), equation);
};

const isFormulaTable = (table: GuideTable): boolean =>
  table.headers.some((header) => header.toLowerCase().includes('công thức')) &&
  table.rows.some((row) => row[1]?.includes('='));

const FormulaCard: React.FC<{ formula: GuideFormula }> = ({ formula }) => (
  <figure className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/70">
    <figcaption className="text-sm font-semibold text-slate-950 dark:text-white">{formula.title}</figcaption>
    <div className="mt-3 overflow-x-auto rounded-md bg-white px-4 py-5 text-center ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
      <p className="min-w-max font-serif text-2xl font-semibold italic leading-none text-slate-950 dark:text-white sm:text-3xl">
        {formatEquation(formula.equation)}
      </p>
    </div>
    <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">{formula.note}</p>
    {formula.variables?.length ? (
      <ul className="mt-3 flex flex-wrap gap-2">
        {formula.variables.map((variable) => (
          <li
            key={variable}
            className="rounded-md bg-white px-2.5 py-1 text-xs leading-5 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700"
          >
            {variable}
          </li>
        ))}
      </ul>
    ) : null}
  </figure>
);

const FormulaGrid: React.FC<{ formulas: GuideFormula[] }> = ({ formulas }) => (
  <div className="my-7 grid gap-4 lg:grid-cols-2">
    {formulas.map((formula) => (
      <FormulaCard key={`${formula.title}-${formula.equation}`} formula={formula} />
    ))}
  </div>
);

const FormulaTableBlock: React.FC<{ table: GuideTable }> = ({ table }) => {
  const formulas = table.rows.map((row) => ({
    title: row[0],
    equation: row[1],
    note: row[2],
  }));

  return (
    <div className="my-7">
      <div className="mb-4 border-l-2 border-blue-500 pl-4">
        <p className="text-sm font-semibold text-slate-950 dark:text-white">{table.caption}</p>
        {table.note && <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{table.note}</p>}
      </div>
      <FormulaGrid formulas={formulas} />
    </div>
  );
};

const GuideTableBlock: React.FC<{ table: GuideTable }> = ({ table }) => (
  <div className="my-7 overflow-hidden rounded-md bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)] ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700/80">
    <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
      <p className="text-sm font-semibold text-slate-950 dark:text-white">{table.caption}</p>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
        <thead className="bg-slate-100/80 dark:bg-slate-800">
          <tr>
            {table.headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-600 dark:text-slate-300"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {table.rows.map((row) => (
            <tr key={row.join('|')} className="align-top">
              {row.map((cell, index) => (
                <td
                  key={`${cell}-${index}`}
                  className="min-w-56 px-5 py-4 leading-6 text-slate-700 first:min-w-48 first:font-semibold first:text-slate-950 dark:text-slate-300 dark:first:text-white"
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
      <p className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs leading-5 text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
        {table.note}
      </p>
    )}
  </div>
);

const GuideSectionBlock: React.FC<{ section: GuideSection; index: number }> = ({ section, index }) => (
  <section
    aria-labelledby={slugToId(section.heading)}
    className="relative rounded-md bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700/80 sm:p-7"
  >
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start">
      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-slate-950 font-mono text-sm font-semibold text-white dark:bg-blue-500">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="min-w-0">
        <h2 id={slugToId(section.heading)} className="text-2xl font-bold leading-tight text-slate-950 dark:text-white sm:text-3xl">
          {section.heading}
        </h2>
        {section.bluf && (
          <p className="mt-3 max-w-[72ch] rounded-md bg-blue-50 px-4 py-3 text-base font-medium leading-7 text-blue-950 ring-1 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-100 dark:ring-blue-900/70">
            {section.bluf}
          </p>
        )}
      </div>
    </div>

    <div className="space-y-4">
      {renderParagraphs(section.paragraphs)}
      {section.bullets?.length ? (
        <ul className="grid gap-3 md:grid-cols-2">
          {section.bullets.map((item) => (
            <li
              key={item}
              className="flex gap-3 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700 ring-1 ring-slate-100 dark:bg-slate-950/70 dark:text-slate-300 dark:ring-slate-800"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {section.orderedSteps?.length ? (
        <ol className="space-y-3">
          {section.orderedSteps.map((step, stepIndex) => (
            <li
              key={step}
              className="grid grid-cols-[2.5rem_1fr] gap-3 rounded-md bg-slate-50 p-3 ring-1 ring-slate-100 dark:bg-slate-950/70 dark:ring-slate-800"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white font-mono text-xs font-semibold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700">
                {stepIndex + 1}
              </span>
              <span className="pt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">{step}</span>
            </li>
          ))}
        </ol>
      ) : null}
      {section.subsections?.map((subsection) => (
        <div key={subsection.heading} className="rounded-md border-l-2 border-slate-300 bg-slate-50 px-4 py-3 dark:border-slate-600 dark:bg-slate-950/70">
          <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{subsection.heading}</h3>
          <div className="mt-2 space-y-2">{renderParagraphs(subsection.paragraphs)}</div>
        </div>
      ))}
      {section.formulas?.length ? <FormulaGrid formulas={section.formulas} /> : null}
      {section.table && (isFormulaTable(section.table) ? <FormulaTableBlock table={section.table} /> : <GuideTableBlock table={section.table} />)}
    </div>
  </section>
);

const ArticleAside: React.FC<{ article: GuideArticle; sectionIds: string[] }> = ({ article, sectionIds }) => (
  <aside className="space-y-4 lg:sticky lg:top-24">
    <nav
      aria-label="Mục lục bài hướng dẫn"
      className="rounded-md bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
        Mục lục
      </p>
      <ol className="space-y-2">
        {article.sections.map((section, index) => (
          <li key={section.heading}>
            <a
              href={`#${sectionIds[index]}`}
              className="block rounded-md px-3 py-2 text-sm leading-5 text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {section.heading}
            </a>
          </li>
        ))}
      </ol>
    </nav>

    <section className="rounded-md bg-slate-950 p-4 text-white shadow-[0_18px_50px_rgba(15,23,42,0.2)] dark:bg-slate-800">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-blue-300" aria-hidden="true" />
        <h2 className="text-base font-semibold">Checklist trước khi tính</h2>
      </div>
      <ul className="mt-4 space-y-3">
        {quickChecklist.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-slate-200">
            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-300" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  </aside>
);

export const GeoGuidePage: React.FC<GeoGuidePageProps> = ({ slug, article, onBack, onNavigate }) => {
  const currentSlug =
    slug || (typeof window !== 'undefined' ? window.location.pathname : guideArticles[0]?.slug);
  const selectedArticle = article || getGuideArticleBySlug(currentSlug || '') || guideArticles[0];

  if (!selectedArticle) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Không tìm thấy bài hướng dẫn</h1>
        <p className="mt-3 text-slate-700 dark:text-slate-300">
          Đường dẫn này chưa có nội dung hướng dẫn. Vui lòng quay lại trang tính toán dầm cầu trục.
        </p>
      </main>
    );
  }

  const isCalculationGuide = selectedArticle.slug === calculationPageSlug;
  const sectionIds = selectedArticle.sections.map((section) => slugToId(section.heading));

  // Schema TechArticle + FAQ của bài viết được render ngay tại trang để App
  // không phải import 53KB nội dung guide ở lần load đầu.
  const routeMeta = getRouteMetadata(selectedArticle.slug);
  const articleSchemas = routeMeta
    ? [
        buildTechArticleJsonLd({
          headline: selectedArticle.title,
          description: selectedArticle.description,
          path: routeMeta.path,
          datePublished: selectedArticle.updatedAt,
          dateModified: selectedArticle.updatedAt,
          sections: selectedArticle.sections.map((section) => section.heading),
        }),
        ...(selectedArticle.faq.length > 0 ? [buildFAQPageJsonLd(selectedArticle.faq)] : []),
      ]
    : [];

  return (
    <main className="bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-200">
      <GeoStructuredData schemas={articleSchemas} />
      <article>
        <header className="relative overflow-hidden border-b border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950">
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                'radial-gradient(circle at 18% 12%, rgba(59,130,246,0.18), transparent 28%), radial-gradient(circle at 90% 18%, rgba(148,163,184,0.16), transparent 30%)',
            }}
            aria-hidden="true"
          />
          <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_25rem] lg:px-8 lg:py-12">
            <div>
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="mb-6 inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 active:translate-y-0 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700 dark:hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Quay lại
                </button>
              )}
              <div className="mb-5 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-400">
                <span className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                  <BookOpen className="h-4 w-4 text-blue-500" aria-hidden="true" />
                  Hướng dẫn kỹ thuật
                </span>
                <span className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                  <Clock className="h-4 w-4 text-blue-500" aria-hidden="true" />
                  {selectedArticle.readingTime}
                </span>
                <span className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                  <FileText className="h-4 w-4 text-blue-500" aria-hidden="true" />
                  Cập nhật {selectedArticle.updatedAt}
                </span>
              </div>
              <p className="mb-4 max-w-[68ch] text-sm leading-6 text-slate-600 dark:text-slate-400">
                Biên soạn bởi đội ngũ kỹ thuật Kỹ Thuật Vàng. Nội dung dùng cho tra cứu và kiểm tra sơ bộ,
                không thay thế hồ sơ thiết kế được kỹ sư kết cấu rà soát.
              </p>
              <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.05] text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
                {selectedArticle.title}
              </h1>
              <p className="mt-5 max-w-[66ch] text-lg leading-8 text-slate-700 dark:text-slate-300">
                {selectedArticle.description}
              </p>
            </div>

            <aside
              aria-label="Tóm tắt nhanh"
              className="self-end rounded-md bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"
            >
              <div className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-blue-500" aria-hidden="true" />
                <h2 className="text-base font-semibold text-slate-950 dark:text-white">Tóm tắt nhanh</h2>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">{selectedArticle.summary}</p>
              {isCalculationGuide && (
                <div className="mt-5 grid gap-3">
                  {calculationProofPoints.map((point) => (
                    <div key={point.label} className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-100 dark:bg-slate-950/70 dark:ring-slate-800">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                        {point.label}
                      </p>
                      <p className="mt-1 font-mono text-lg font-semibold text-slate-950 dark:text-white">{point.value}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">{point.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[17rem_1fr] lg:px-8 lg:py-12">
          <ArticleAside article={selectedArticle} sectionIds={sectionIds} />

          <div className="min-w-0 space-y-8">
            {isCalculationGuide && (
              <section className="rounded-md bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700 sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-600 dark:text-blue-400">
                      Quy trình đọc bài
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                      Đi từ dữ liệu thiết bị đến kết luận kiểm tra
                    </h2>
                  </div>
                  <Ruler className="h-10 w-10 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {['Xác định tải bánh xe', 'Chọn sơ đồ và tiết diện', 'Kiểm tra bền, võng, ổn định'].map((item, index) => (
                    <div key={item} className="rounded-md bg-slate-50 p-4 ring-1 ring-slate-100 dark:bg-slate-950/70 dark:ring-slate-800">
                      <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
                        0{index + 1}
                      </span>
                      <p className="mt-2 font-semibold text-slate-950 dark:text-white">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-md bg-blue-50 p-4 ring-1 ring-blue-100 dark:bg-blue-950/35 dark:ring-blue-900/70">
                  <p className="text-sm font-semibold text-blue-950 dark:text-blue-100">
                    Cần xem công thức chi tiết?
                  </p>
                  <p className="mt-2 max-w-[72ch] text-sm leading-6 text-blue-900 dark:text-blue-100/85">
                    Mở trang công thức để xem cách tính tải trọng, mô men, lực cắt, đặc trưng tiết diện,
                    ứng suất, độ võng và hệ số kiểm tra theo từng nhóm công thức.
                  </p>
                  <button
                    type="button"
                    onClick={() => (onNavigate ? onNavigate(formulaPageSlug) : (window.location.href = formulaPageSlug))}
                    className="mt-4 inline-flex items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 active:translate-y-0 dark:bg-blue-500 dark:hover:bg-blue-400"
                  >
                    Xem công thức tính chi tiết
                  </button>
                </div>
              </section>
            )}

            {selectedArticle.sections.map((section, index) => (
              <GuideSectionBlock key={section.heading} section={section} index={index} />
            ))}

            <section aria-labelledby="faq" className="rounded-md bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700 sm:p-7">
              <h2 id="faq" className="text-2xl font-bold text-slate-950 dark:text-white">
                Câu hỏi thường gặp
              </h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {selectedArticle.faq.map((item) => (
                  <section key={item.question} aria-labelledby={slugToId(item.question)} className="rounded-md bg-slate-50 p-4 ring-1 ring-slate-100 dark:bg-slate-950/70 dark:ring-slate-800">
                    <h3 id={slugToId(item.question)} className="text-lg font-semibold leading-snug text-slate-950 dark:text-white">
                      {item.question}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">{item.answer}</p>
                  </section>
                ))}
              </div>
            </section>

            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <section aria-labelledby="references" className="rounded-md bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                <h2 id="references" className="text-xl font-bold text-slate-950 dark:text-white">
                  Nguồn tham khảo
                </h2>
                <ul className="mt-4 space-y-3">
                  {selectedArticle.references.map((reference) => (
                    <li key={reference.label} className="rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700 ring-1 ring-slate-100 dark:bg-slate-950/70 dark:text-slate-300 dark:ring-slate-800">
                      <strong className="text-slate-950 dark:text-white">{reference.label}:</strong> {reference.note}
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="author-note" className="rounded-md bg-slate-950 p-5 text-white shadow-[0_18px_60px_rgba(15,23,42,0.16)] dark:bg-slate-800">
                <h2 id="author-note" className="text-xl font-bold">
                  Thông tin biên soạn
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  Bài viết được biên soạn và cập nhật bởi đội ngũ kỹ thuật Kỹ Thuật Vàng vào ngày{' '}
                  {selectedArticle.updatedAt}. Khi dùng cho công trình thật, hãy đối chiếu tiêu chuẩn gốc,
                  catalogue thiết bị và yêu cầu riêng của dự án trước khi ra quyết định thiết kế.
                </p>
              </section>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
};

export default GeoGuidePage;
