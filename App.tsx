
import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CraneBeamCalculator } from './components/CraneBeamCalculator';
import { TiktokFollowOverlay, TiktokFollowPreview } from './components/TiktokFollowPreview';
import GeoFAQPage from './components/GeoFAQPage';
import GeoGuidePage from './components/GeoGuidePage';
import GeoStructuredData from './components/GeoStructuredData';
import { geoFaqItems } from './src/geo/faqContent';
import { getGuideArticleBySlug, guideArticles } from './src/geo/guideContent';
import { buildRouteJsonLd, getRouteMetadata, routeMetadata, type RouteMetadata } from './src/geo/seo';

const getCurrentPath = () => {
  if (typeof window === 'undefined') {
    return '/';
  }

  const path = window.location.pathname;
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
};

const homeRoute = routeMetadata.find((route) => route.path === '/') as RouteMetadata;

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
  const currentArticle = getGuideArticleBySlug(currentPath);
  const isGuideRoute = currentRoute.type === 'article';
  const jsonLdSchemas = buildRouteJsonLd(currentRoute, {
    faqItems: currentRoute.type === 'faq' ? geoFaqItems : undefined,
    article:
      currentRoute.type === 'article' && currentArticle
        ? {
            headline: currentArticle.title,
            description: currentArticle.description,
            datePublished: currentArticle.updatedAt,
            dateModified: currentArticle.updatedAt,
            sections: currentArticle.sections.map((section) => section.heading),
          }
        : undefined,
  });

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
  }, [currentRoute]);

  const renderMainContent = () => {
    if (currentRoute.type === 'faq') {
      return <GeoFAQPage />;
    }

    if (isGuideRoute) {
      return <GeoGuidePage slug={currentPath} onBack={() => navigateTo('/')} />;
    }

    return (
      <>
        <CraneBeamCalculator />
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
              {guideArticles.map((article) => (
                <button
                  key={article.slug}
                  type="button"
                  onClick={() => navigateTo(article.slug)}
                  className="rounded-md border border-gray-200 p-4 text-left transition hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-500 dark:hover:bg-blue-950/30"
                >
                  <span className="text-base font-semibold text-gray-900 dark:text-white">{article.title}</span>
                  <span className="mt-1 block text-sm text-gray-600 dark:text-gray-300">{article.description}</span>
                </button>
              ))}
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
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
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
