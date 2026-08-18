import React from 'react';
import { guideArticles } from '../src/geo/guideContent';

type GuideArticleButtonsProps = {
  onNavigate: (path: string) => void;
};

/**
 * Danh sách nút bài hướng dẫn trên trang chủ.
 * Tách thành component lazy để không kéo 53KB nội dung guide vào bundle ban đầu.
 */
export const GuideArticleButtons: React.FC<GuideArticleButtonsProps> = ({ onNavigate }) => (
  <>
    {guideArticles.map((article) => (
      <button
        key={article.slug}
        type="button"
        onClick={() => onNavigate(article.slug)}
        className="rounded-md border border-gray-200 p-4 text-left transition hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-500 dark:hover:bg-blue-950/30"
      >
        <span className="text-base font-semibold text-gray-900 dark:text-white">{article.title}</span>
        <span className="mt-1 block text-sm text-gray-600 dark:text-gray-300">{article.description}</span>
      </button>
    ))}
  </>
);

export default GuideArticleButtons;
