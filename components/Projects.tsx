"use client";

import { useState, useEffect } from "react";
import { defaultLocale, getDictionary, type Locale } from "@/lib/i18n";

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  fork: boolean;
  updated_at: string;
}

async function fetchGitHubRepos(username: string): Promise<GitHubRepo[]> {
  try {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch repositories");
    }

    const repos = await response.json();

    // Filter out forks and sort by date (latest to oldest)
    return repos
      .filter((repo: GitHubRepo) => !repo.fork)
      .sort((a: GitHubRepo, b: GitHubRepo) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
  } catch (error) {
    console.error("Error fetching GitHub repos:", error);
    return [];
  }
}

const languageColors: { [key: string]: string } = {
  JavaScript: "bg-yellow-400 dark:bg-yellow-500",
  TypeScript: "bg-blue-500 dark:bg-blue-600",
  Python: "bg-blue-400 dark:bg-blue-500",
  Java: "bg-red-500 dark:bg-red-600",
  HTML: "bg-orange-500 dark:bg-orange-600",
  CSS: "bg-purple-500 dark:bg-purple-600",
  Go: "bg-cyan-500 dark:bg-cyan-600",
  Rust: "bg-orange-600 dark:bg-orange-700",
  PHP: "bg-indigo-500 dark:bg-indigo-600",
  Ruby: "bg-red-600 dark:bg-red-700",
  C: "bg-gray-600 dark:bg-gray-700",
  "C++": "bg-pink-500 dark:bg-pink-600",
  "C#": "bg-green-600 dark:bg-green-700",
};

const ALL_CATEGORY = "__all__";

type PaginationItem = number | "ellipsis-start" | "ellipsis-end";

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function getPaginationItems(
  totalPages: number,
  currentPage: number,
  maxItems: number
): PaginationItem[] {
  if (totalPages <= maxItems) {
    return range(1, totalPages);
  }

  if (maxItems <= 5) {
    if (currentPage <= 3) {
      return [1, 2, 3, 4, "ellipsis-end", totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [
        1,
        "ellipsis-start",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "ellipsis-start",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis-end",
      totalPages,
    ];
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis-end", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis-start",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis-start",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis-end",
    totalPages,
  ];
}

export default function Projects({
  username,
  locale = defaultLocale,
}: {
  username: string;
  locale?: Locale;
}) {
  const t = getDictionary(locale).projects;
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [maxVisiblePages, setMaxVisiblePages] = useState(5);

  // Pagination settings
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchGitHubRepos(username).then((data) => {
      setRepos(data);
      setLoading(false);
    });
  }, [username]);

  useEffect(() => {
    const updateVisiblePages = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setMaxVisiblePages(7);
      } else if (window.matchMedia("(min-width: 640px)").matches) {
        setMaxVisiblePages(5);
      } else {
        setMaxVisiblePages(5);
      }
    };

    updateVisiblePages();
    window.addEventListener("resize", updateVisiblePages);

    return () => {
      window.removeEventListener("resize", updateVisiblePages);
    };
  }, []);

  if (loading) {
    return (
      <div className="text-zinc-500 dark:text-zinc-500">
        {t.loading}
      </div>
    );
  }

  if (repos.length === 0) {
    return (
      <div className="text-zinc-500 dark:text-zinc-500">
        {t.empty}
      </div>
    );
  }

  // Get unique languages for categorization
  const languages = Array.from(new Set(repos.map((repo) => repo.language).filter((lang): lang is string => Boolean(lang))));
  const categories = [ALL_CATEGORY, ...languages];

  // Filter repos by selected category
  const filteredRepos =
    selectedCategory === ALL_CATEGORY
      ? repos
      : repos.filter((repo) => repo.language === selectedCategory);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRepos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedRepos = filteredRepos.slice(startIndex, endIndex);
  const paginationItems = getPaginationItems(
    totalPages,
    currentPage,
    maxVisiblePages
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const projectsSection = document.getElementById('projects');
    projectsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div>
      {/* Category Filter - Scrollable on mobile */}
      <div className="mb-8 sm:mb-10 md:mb-12">
        <div className="overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-2 sm:gap-3 min-w-max sm:min-w-0 sm:flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap touch-manipulation cursor-pointer ${
                  selectedCategory === category
                    ? "bg-black dark:bg-white text-white dark:text-black"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 active:bg-zinc-300 dark:active:bg-zinc-700"
                }`}
              >
                {category === ALL_CATEGORY ? t.all : category || t.unknown} ({selectedCategory === category ? filteredRepos.length : category === ALL_CATEGORY ? repos.length : repos.filter(r => r.language === category).length})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mb-8 sm:mb-10 md:mb-12">
        {paginatedRepos.map((repo) => (
          <a
            key={repo.id}
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative p-4 sm:p-5 md:p-6 border-2 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white dark:bg-black touch-manipulation"
          >
            {/* Language indicator */}
            {repo.language && (
              <div className="absolute top-0 right-0 w-2 sm:w-3 h-full opacity-20 group-hover:opacity-30 transition-opacity">
                <div className={`w-full h-full ${languageColors[repo.language] || "bg-zinc-400"}`}></div>
              </div>
            )}

            <h3 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-2 sm:mb-3 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors pr-4">
              {repo.name}
            </h3>

            {repo.description && (
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
                {repo.description}
              </p>
            )}

            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              {repo.language && (
                <span className={`text-xs px-2 sm:px-3 py-1 font-medium text-white ${languageColors[repo.language] || "bg-zinc-500"}`}>
                  {repo.language}
                </span>
              )}
              {repo.topics.slice(0, 3).map((topic) => (
                <span
                  key={topic}
                  className="text-xs px-2 sm:px-3 py-1 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                >
                  {topic}
                </span>
              ))}
            </div>

          </a>
        ))}
      </div>

      {filteredRepos.length === 0 && (
        <div className="text-center text-zinc-500 dark:text-zinc-500 py-8 sm:py-10 md:py-12 text-sm sm:text-base">
          {t.emptyCategory}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-4 pt-4 sm:flex-row">
          <div className="text-sm text-zinc-500 dark:text-zinc-500">
            {t.showing} {startIndex + 1}-{Math.min(endIndex, filteredRepos.length)} {t.of} {filteredRepos.length} {t.projects}
          </div>

          <div className="flex w-full max-w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:gap-2">
            <div className="order-1 flex justify-center gap-1 sm:order-2">
              {paginationItems.map((item) =>
                typeof item === "number" ? (
                  <button
                    key={item}
                    onClick={() => handlePageChange(item)}
                    className={`h-9 w-9 cursor-pointer text-sm font-medium transition-colors ${
                      currentPage === item
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "border-2 border-zinc-200 text-black hover:border-black dark:border-zinc-800 dark:text-white dark:hover:border-white"
                    }`}
                  >
                    {item}
                  </button>
                ) : (
                  <span
                    key={item}
                    aria-hidden="true"
                    className="flex h-9 w-9 items-center justify-center text-sm font-medium text-zinc-500 dark:text-zinc-500"
                  >
                    ...
                  </span>
                )
              )}
            </div>

            <div className="order-2 flex justify-center gap-2 sm:contents">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label={t.previous}
                className="grid size-9 cursor-pointer place-items-center text-zinc-500 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-zinc-500 dark:text-zinc-400 dark:hover:text-white dark:disabled:hover:text-zinc-400 sm:order-1"
              >
                <svg
                  aria-hidden="true"
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="m15 18-6-6 6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label={t.next}
                className="grid size-9 cursor-pointer place-items-center text-zinc-500 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-zinc-500 dark:text-zinc-400 dark:hover:text-white dark:disabled:hover:text-zinc-400 sm:order-3"
              >
                <svg
                  aria-hidden="true"
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="m9 18 6-6-6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
