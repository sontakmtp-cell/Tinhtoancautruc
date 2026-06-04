import React from 'react';
import { geoFaqGroups, geoFaqItems, type GeoFAQGroup } from '../src/geo/faqContent';

const faqItemsByGroup = geoFaqItems.reduce<Record<GeoFAQGroup, typeof geoFaqItems>>(
  (acc, item) => {
    acc[item.group].push(item);
    return acc;
  },
  {
    'basic-knowledge': [],
    'calculation-design': [],
    'tool-usage': [],
    'comparison-evaluation': [],
  }
);

const quickReferenceRows = [
  {
    label: 'Tiêu chuẩn nên tham chiếu',
    value: 'TCVN 5575:2024, TCVN 2737:2023',
    note: 'Dùng để đối chiếu nguyên tắc thiết kế kết cấu thép và tải trọng tác động.',
  },
  {
    label: 'Kiểm tra chính',
    value: 'Ứng suất, độ võng, ổn định',
    note: 'Nên đọc từng mục kiểm tra, không chỉ nhìn kết luận đạt hoặc không đạt.',
  },
  {
    label: 'Đầu vào dễ sai nhất',
    value: 'Khẩu độ, đơn vị, tải trọng nâng',
    note: 'Sai một đơn vị có thể làm kết quả tính lệch rất lớn.',
  },
];

export const GeoFAQPage: React.FC = () => {
  return (
    <article className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          FAQ dầm cầu trục
        </p>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Câu hỏi thường gặp về tính dầm cầu trục
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-gray-600 dark:text-gray-300">
          Trang FAQ này tổng hợp các câu hỏi cốt lõi về dầm cầu trục, cách nhập liệu, cách đọc kết quả
          và cách so sánh phương án thiết kế. Nội dung được viết để hỗ trợ tra cứu nhanh, đồng thời
          giúp người dùng hiểu rõ vai trò của TCVN 5575:2024 và TCVN 2737:2023 khi tính toán thực tế.
        </p>
      </header>

      <section aria-labelledby="faq-quick-reference" className="mb-8">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
            <h2 id="faq-quick-reference" className="text-xl font-semibold text-gray-900 dark:text-white">
              Bảng tóm tắt nhanh
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/60">
                <tr>
                  <th scope="col" className="px-5 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">
                    Nội dung
                  </th>
                  <th scope="col" className="px-5 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">
                    Giá trị cần nhớ
                  </th>
                  <th scope="col" className="px-5 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">
                    Ghi chú
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {quickReferenceRows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row" className="px-5 py-4 text-left font-medium text-gray-900 dark:text-white">
                      {row.label}
                    </th>
                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300">{row.value}</td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="space-y-8">
        {geoFaqGroups.map((group) => (
          <section
            key={group.id}
            aria-labelledby={`faq-group-${group.id}`}
            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-5">
              <h2 id={`faq-group-${group.id}`} className="text-2xl font-bold text-gray-900 dark:text-white">
                {group.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">{group.description}</p>
            </div>

            <div className="space-y-5">
              {faqItemsByGroup[group.id].map((item) => (
                <section
                  key={item.id}
                  aria-labelledby={`faq-${item.id}`}
                  className="rounded-md border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50"
                >
                  <h3 id={`faq-${item.id}`} className="text-lg font-semibold text-gray-900 dark:text-white">
                    {item.question}
                  </h3>
                  <div className="mt-3 space-y-3 text-sm leading-6 text-gray-700 dark:text-gray-300">
                    {item.answer.split('\n\n').map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
};

export default GeoFAQPage;
