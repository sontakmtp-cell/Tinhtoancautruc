
import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CraneBeamCalculator } from './components/CraneBeamCalculator';
import { TiktokFollowOverlay, TiktokFollowPreview } from './components/TiktokFollowPreview';
import RouteLink from './components/RouteLink';
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

  const path = window.location.pathname.replace(/\/index\.html$/, '') || '/';
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
    fields: 'P_nang, P_thietbi; tự trọng dầm tính tự động',
    purpose: 'Tải nâng và xe con quy đổi thành tải điểm giữa nhịp; tự trọng dầm tính từ tiết diện thành tải phân bố.',
  },
  {
    group: 'Vật liệu thép',
    fields: 'SS400, CT3, A36 hoặc CUSTOM',
    purpose: 'Tự điền ứng suất cho phép, giới hạn chảy, mô đun đàn hồi và hệ số Poisson.',
  },
  {
    group: 'Kết quả kiểm tra',
    fields: 'K_sigma, n_f, K_buckling, f, Mx, Jx, Jy',
    purpose: 'Hiển thị các chỉ số ứng suất, độ võng, độ mảnh bản cánh và đặc trưng tiết diện theo mô hình sơ bộ.',
  },
];

const calculatorChecks = [
  'Kiểm tra ứng suất uốn theo mô hình tải của dầm chính.',
  'Kiểm tra độ võng đứng theo nhịp dầm và độ cứng tiết diện.',
  'Kiểm tra độ mảnh bản cánh và gợi ý sườn tăng cứng theo mô hình hiện có.',
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
          Nhập thông số và xem kết quả tính sơ bộ dầm cầu trục
        </h2>
        <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
          Nhập hình học tiết diện, khẩu độ, tải nâng, tự trọng xe con và vật liệu để xem ứng suất,
          độ võng, độ mảnh bản cánh và biểu đồ nội lực. Bảng dưới đây mô tả dữ liệu đầu vào và kết quả.
          Mô hình dầm chính dùng tải điểm quy đổi giữa nhịp cùng tự trọng dầm phân bố; chưa quét
          hệ bánh xe di động, nhận tải ngang riêng hoặc kiểm tra mỏi, ổn định tổng thể và liên kết.
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
                  Trường nhập và đại lượng tính
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
          <RouteLink href="/huong-dan/dam-cau-truc-la-gi" onNavigate={onNavigate}
            className="rounded-md border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900 transition hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:text-white dark:hover:border-blue-500 dark:hover:bg-blue-950/30"
          >
            Phân biệt dầm chính và dầm đỡ ray
          </RouteLink>
          <RouteLink href="/huong-dan/tai-trong-dam-cau-truc" onNavigate={onNavigate}
            className="rounded-md border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900 transition hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:text-white dark:hover:border-blue-500 dark:hover:bg-blue-950/30"
          >
            Dữ liệu tải bánh xe cho dầm đỡ ray
          </RouteLink>
        </div>
      </aside>
    </div>
  </section>
);

const App: React.FC<{ initialPath?: string }> = ({ initialPath }) => {
  const [currentPath, setCurrentPath] = useState(() => initialPath ?? getCurrentPath());
  const [isDark, setIsDark] = useState(() => {
    // Kiểm tra localStorage trước, nếu không có thì mặc định là true (theme tối)
    const saved = typeof localStorage === 'undefined' ? null : localStorage.getItem('theme');
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
    setMetaContent('meta[property="og:type"]', currentRoute.type === 'article' ? 'article' : 'website');
    setMetaContent('meta[property="og:title"]', currentRoute.title);
    setMetaContent('meta[property="og:description"]', currentRoute.description);
    setMetaContent('meta[name="twitter:url"]', currentRoute.canonicalUrl);
    setMetaContent('meta[name="twitter:title"]', currentRoute.title);
    setMetaContent('meta[name="twitter:description"]', currentRoute.description);
    setMetaContent('meta[property="zalo:url"]', currentRoute.canonicalUrl);
    setMetaContent('meta[property="zalo:title"]', currentRoute.title);
    setMetaContent('meta[property="zalo:description"]', currentRoute.description);
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
        <section className="container mx-auto px-4 pt-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tính toán dầm cầu trục online</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-gray-600 dark:text-gray-300">
            Nhập kích thước tiết diện, khẩu độ, tải nâng và tự trọng xe con để tính sơ bộ dầm chính
            cầu trục, xem ứng suất, độ võng, độ mảnh bản cánh và xuất báo cáo PDF. Công cụ có mô đun
            dầm biên. Dầm chính đi cùng cầu trục; dầm đỡ ray cố định dọc nhà xưởng là cấu kiện khác.
          </p>
        </section>
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
              Các bài tải trọng và quy trình tập trung vào dầm đỡ ray cố định của nhà xưởng, nhận phản lực
              bánh xe cầu trục. Bài công thức và độ võng giải thích giả thiết cần đối chiếu khi tính sơ bộ.
              Quy trình tải bánh xe trong hướng dẫn cần mô hình riêng; công cụ trang chủ tính dầm chính.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <RouteLink href="/faq" onNavigate={navigateTo}
                className="rounded-md border border-gray-200 p-4 text-left transition hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-500 dark:hover:bg-blue-950/30"
              >
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  Câu hỏi thường gặp
                </span>
                <span className="mt-1 block text-sm text-gray-600 dark:text-gray-300">
                  15 câu hỏi về dầm cầu trục, tiêu chuẩn, tải trọng và cách dùng công cụ.
                </span>
              </RouteLink>
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
            <RouteLink href="/" onNavigate={navigateTo}
              className="text-left text-xl font-bold text-gray-900 dark:text-white sm:text-2xl"
            >
              {t('app.title')}
            </RouteLink>
            <div className="flex items-center gap-2">
              <nav className="hidden items-center gap-1 md:flex" aria-label="Điều hướng chính">
                <RouteLink href="/faq" onNavigate={navigateTo}
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  FAQ
                </RouteLink>
                <RouteLink href="/huong-dan/tinh-toan-dam-cau-truc" onNavigate={navigateTo}
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Hướng dẫn
                </RouteLink>
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
        {currentRoute.type !== 'home' && (
          <nav aria-label="Đường dẫn trang" className="container mx-auto px-4 pt-6 sm:px-6 lg:px-8">
            <ol className="flex flex-wrap gap-2 text-sm">
              {currentRoute.breadcrumb.map((item, index) => (
                <li key={item.path} className="flex gap-2">
                  {index > 0 && <span aria-hidden="true">/</span>}
                  {item.path === currentRoute.path ? <span aria-current="page">{item.name}</span> :
                    <RouteLink href={item.path} onNavigate={navigateTo} className="text-blue-600 underline dark:text-blue-400">{item.name}</RouteLink>}
                </li>
              ))}
            </ol>
          </nav>
        )}
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
