
import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CraneBeamCalculator } from './components/CraneBeamCalculator';
import { TiktokFollowOverlay, TiktokFollowPreview } from './components/TiktokFollowPreview';
import GeoStructuredData from './components/GeoStructuredData';
import {
  buildBreadcrumbListJsonLd,
  buildOrganizationJsonLd,
  buildRouteJsonLd,
  buildWebApplicationJsonLd,
  buildWebSiteJsonLd,
  getRouteMetadata,
  routeMetadata,
  type RouteMetadata,
} from './src/geo/seo';

// Các trang nội dung được lazy-load để giữ bundle ban đầu nhẹ
const GeoFAQPage = lazy(() => import('./components/GeoFAQPage'));
const GeoGuidePage = lazy(() => import('./components/GeoGuidePage'));
const GuideArticleButtons = lazy(() => import('./components/GuideArticleButtons'));

const getCurrentPath = () => {
  if (typeof window === 'undefined') {
    return '/';
  }

  const path = window.location.pathname;
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
};

const homeRoute = routeMetadata.find((route) => route.path === '/') as RouteMetadata;

const RouteLoadingFallback: React.FC = () => (
  <div className="container mx-auto px-4 py-16 text-center text-sm text-gray-500 dark:text-gray-400">
    Đang tải nội dung…
  </div>
);

const calculatorInputRows = [
  {
    group: 'Hình học tiết diện',
    fields: 'b, h, t1, t2, t3, b1, b3, L',
    purpose: 'Tính diện tích, mô men quán tính, mô đun chống uốn và độ cứng của dầm.',
  },
  {
    group: 'Tải trọng cầu trục',
    fields: 'P_nang, P_thietbi, q',
    purpose: 'Tính nội lực, ứng suất uốn, ứng suất cắt và độ võng do tải nâng và tải thiết bị.',
  },
  {
    group: 'Vật liệu thép',
    fields: 'SS400, CT3, A36 hoặc CUSTOM',
    purpose: 'Tự điền ứng suất cho phép, giới hạn chảy, mô đun đàn hồi và hệ số Poisson.',
  },
  {
    group: 'Kết quả kiểm tra',
    fields: 'K_sigma, n_f, K_buckling, f, Mx, Jx, Jy',
    purpose: 'Hiển thị đạt hoặc không đạt cho ứng suất, độ võng, ổn định và các thông số tính chính.',
  },
];

const calculatorChecks = [
  'Kiểm tra ứng suất uốn và ứng suất cắt của dầm cầu trục.',
  'Kiểm tra độ võng đứng theo nhịp dầm và độ cứng tiết diện.',
  'Kiểm tra ổn định tổng thể, ổn định cục bộ và gợi ý sườn tăng cứng.',
  'Vẽ biểu đồ nội lực, phân bố ứng suất và hình dạng võng sau khi bấm tính.',
  'Xuất báo cáo PDF có dữ liệu đầu vào, kết quả kiểm tra và biểu đồ kỹ thuật.',
];

const HomeCalculatorEvidence: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => (
  <section className="container mx-auto px-4 pb-10 sm:px-6 lg:px-8" aria-labelledby="calculator-evidence-title">
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          Công cụ tính toán đang hiển thị trên trang chủ
        </p>
        <h2 id="calculator-evidence-title" className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          Trang này không chỉ là bài giới thiệu, mà có form nhập liệu và module tính thật
        </h2>
        <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
          Crane Beam Design Studio có các ô nhập số cho hình học tiết diện, tải trọng nâng, tải thiết bị,
          vật liệu thép và nhịp dầm. Khi người dùng bấm nút tính, app chạy phép kiểm tra kết cấu và trả về
          ứng suất, độ võng, ổn định, biểu đồ nội lực và báo cáo PDF. Phần dưới đây mô tả rõ các trường
          input để crawler và AI bot nhận diện đây là một calculator, không phải trang nội dung mỏng.
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
            <caption className="sr-only">Bảng mô tả trường nhập liệu và kết quả của công cụ tính dầm cầu trục</caption>
            <thead className="bg-gray-50 dark:bg-gray-900/60">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">
                  Nhóm dữ liệu
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">
                  Tên trường trong calculator
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">
                  Dùng để làm gì
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {calculatorInputRows.map((row) => (
                <tr key={row.group} className="align-top">
                  <th scope="row" className="px-4 py-4 text-left font-medium text-gray-900 dark:text-white">
                    {row.group}
                  </th>
                  <td className="px-4 py-4 font-mono text-xs text-gray-700 dark:text-gray-300">{row.fields}</td>
                  <td className="px-4 py-4 text-gray-600 dark:text-gray-300">{row.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <aside className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Máy tính dầm cầu trục kiểm tra những gì?
        </h2>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-700 dark:text-gray-300">
          {calculatorChecks.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <button
            type="button"
            onClick={() => onNavigate('/huong-dan/dam-cau-truc-la-gi')}
            className="rounded-md border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900 transition hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:text-white dark:hover:border-blue-500 dark:hover:bg-blue-950/30"
          >
            Đọc cấu tạo dầm cầu trục
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/huong-dan/tai-trong-dam-cau-truc')}
            className="rounded-md border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900 transition hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:text-white dark:hover:border-blue-500 dark:hover:bg-blue-950/30"
          >
            Xem cách xác định tải trọng
          </button>
        </div>
      </aside>
    </div>
  </section>
);

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(getCurrentPath);
  const [isDark, setIsDark] = useState(() => {
    // Kiểm tra localStorage trước, nếu không có thì mặc định là true (theme tối)
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const [showTiktokFollow, setShowTiktokFollow] = useState(false);

  useEffect(() => {
    // Set theme based on state changes
    const htmlElement = document.documentElement;
    
    // Lưu theme preference vào localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    if (isDark) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const { t, i18n } = useTranslation();
  const currentLanguage = (i18n.resolvedLanguage || i18n.language || 'vi').split('-')[0];
  const isTiktokPreview =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview') === 'tiktok-follow';

  useEffect(() => {
    const handleCalculationSubmit = (event: SubmitEvent) => {
      const form = event.target instanceof HTMLFormElement ? event.target : null;
      if (!form?.querySelector('.calc-button[type="submit"]')) {
        return;
      }

      setShowTiktokFollow(true);
    };

    document.addEventListener('submit', handleCalculationSubmit, true);

    return () => {
      document.removeEventListener('submit', handleCalculationSubmit, true);
    };
  }, []);

  useEffect(() => {
    if (!showTiktokFollow) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowTiktokFollow(false);
    }, 6_000);

    return () => window.clearTimeout(timeoutId);
  }, [showTiktokFollow]);

  const handleLanguageChange = (lang: 'en' | 'vi') => {
    i18n.changeLanguage(lang);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getCurrentPath());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    if (path === currentPath) {
      return;
    }

    window.history.pushState({}, '', path);
    setCurrentPath(getCurrentPath());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentRoute = getRouteMetadata(currentPath) ?? homeRoute;
  const isGuideRoute = currentRoute.type === 'article';
  // Trên route article, schema TechArticle + FAQ do GeoGuidePage (lazy) tự render,
  // để nội dung guide 53KB không phải tải ở lần load đầu. App chỉ render schema nền.
  const jsonLdSchemas =
    currentRoute.type === 'article'
      ? [
          buildOrganizationJsonLd(),
          buildWebSiteJsonLd(),
          buildWebApplicationJsonLd(),
          buildBreadcrumbListJsonLd(currentRoute.breadcrumb),
        ]
      : buildRouteJsonLd(currentRoute);

  useEffect(() => {
    document.title = currentRoute.title;

    const descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (descriptionMeta) {
      descriptionMeta.content = currentRoute.description;
    }

    const canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.href = currentRoute.canonicalUrl;
    }

    const setMetaContent = (selector: string, content: string) => {
      const meta = document.querySelector<HTMLMetaElement>(selector);
      if (meta) {
        meta.content = content;
      }
    };

    setMetaContent('meta[property="og:url"]', currentRoute.canonicalUrl);
    setMetaContent('meta[property="og:title"]', currentRoute.title);
    setMetaContent('meta[property="og:description"]', currentRoute.description);
    setMetaContent('meta[name="twitter:url"]', currentRoute.canonicalUrl);
    setMetaContent('meta[name="twitter:title"]', currentRoute.title);
    setMetaContent('meta[name="twitter:description"]', currentRoute.description);
  }, [currentRoute]);

  const renderMainContent = () => {
    if (currentRoute.type === 'faq') {
      return (
        <Suspense fallback={<RouteLoadingFallback />}>
          <GeoFAQPage />
        </Suspense>
      );
    }

    if (isGuideRoute) {
      return (
        <Suspense fallback={<RouteLoadingFallback />}>
          <GeoGuidePage slug={currentPath} onBack={() => navigateTo('/')} onNavigate={navigateTo} />
        </Suspense>
      );
    }

    return (
      <>
        <CraneBeamCalculator />
        <HomeCalculatorEvidence onNavigate={navigateTo} />
        <section className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Kiến thức dầm cầu trục
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              Hướng dẫn và FAQ hỗ trợ tính toán
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300">
              Các trang nội dung dưới đây giải thích cách xác định tải trọng, chọn tiết diện, kiểm tra độ
              võng và đọc kết quả tính toán. Nội dung dùng để tra cứu sơ bộ, không thay thế hồ sơ thiết kế
              được kỹ sư kết cấu kiểm tra.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => navigateTo('/faq')}
                className="rounded-md border border-gray-200 p-4 text-left transition hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-500 dark:hover:bg-blue-950/30"
              >
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  Câu hỏi thường gặp
                </span>
                <span className="mt-1 block text-sm text-gray-600 dark:text-gray-300">
                  15 câu hỏi về dầm cầu trục, tiêu chuẩn, tải trọng và cách dùng công cụ.
                </span>
              </button>
              <Suspense
                fallback={
                  <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                    Đang tải danh sách bài viết…
                  </div>
                }
              >
                <GuideArticleButtons onNavigate={navigateTo} />
              </Suspense>
            </div>
          </div>
        </section>
      </>
    );
  };

  if (isTiktokPreview) {
    return <TiktokFollowPreview onClose={() => window.history.back()} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <GeoStructuredData schemas={jsonLdSchemas} />
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-16 flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => navigateTo('/')}
              className="text-left text-xl font-bold text-gray-900 dark:text-white sm:text-2xl"
            >
              {t('app.title')}
            </button>
            <div className="flex items-center gap-2">
              <nav className="hidden items-center gap-1 md:flex" aria-label="Nội dung GEO">
                <button
                  type="button"
                  onClick={() => navigateTo('/faq')}
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  FAQ
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('/huong-dan/tinh-toan-dam-cau-truc')}
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Hướng dẫn
                </button>
              </nav>
              <div className="inline-flex rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleLanguageChange('en')}
                  className={`px-2 py-1 text-xs font-semibold ${
                    currentLanguage === 'en' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300'
                  }`}
                  aria-pressed={currentLanguage === 'en'}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageChange('vi')}
                  className={`px-2 py-1 text-xs font-semibold ${
                    currentLanguage === 'vi' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300'
                  }`}
                  aria-pressed={currentLanguage === 'vi'}
                >
                  VI
                </button>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                aria-label={t('app.toggleTheme')}
              >
                {isDark ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>
      <main>
        {renderMainContent()}
      </main>
      {showTiktokFollow && <TiktokFollowOverlay onClose={() => setShowTiktokFollow(false)} />}
      <footer className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
        <p>{t('app.footer')}</p>
      </footer>
    </div>
  );
};

export default App;
