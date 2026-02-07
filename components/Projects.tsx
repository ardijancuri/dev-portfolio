"use client";

import { useState, useEffect } from "react";

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

    // Filter out forks and sort by stars
    return repos
      .filter((repo: GitHubRepo) => !repo.fork)
      .sort((a: GitHubRepo, b: GitHubRepo) => b.stargazers_count - a.stargazers_count);
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

export default function Projects({ username }: { username: string }) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGitHubRepos(username).then((data) => {
      setRepos(data);
      setLoading(false);
    });
  }, [username]);

  if (loading) {
    return (
      <div className="text-zinc-500 dark:text-zinc-500">
        Loading projects...
      </div>
    );
  }

  if (repos.length === 0) {
    return (
      <div className="text-zinc-500 dark:text-zinc-500">
        No projects found or unable to fetch repositories.
      </div>
    );
  }

  // Get unique languages for categorization
  const languages = Array.from(new Set(repos.map((repo) => repo.language).filter(Boolean)));
  const categories = ["All", ...languages];

  // Filter repos by selected category
  const filteredRepos =
    selectedCategory === "All"
      ? repos
      : repos.filter((repo) => repo.language === selectedCategory);

  return (
    <div>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 mb-12">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              selectedCategory === category
                ? "bg-black dark:bg-white text-white dark:text-black"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            }`}
          >
            {category || "Unknown"} ({selectedCategory === category ? filteredRepos.length : category === "All" ? repos.length : repos.filter(r => r.language === category).length})
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRepos.map((repo) => (
          <a
            key={repo.id}
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative p-6 border-2 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white dark:bg-black"
          >
            {/* Language indicator */}
            {repo.language && (
              <div className="absolute top-0 right-0 w-3 h-full opacity-20 group-hover:opacity-30 transition-opacity">
                <div className={`w-full h-full ${languageColors[repo.language] || "bg-zinc-400"}`}></div>
              </div>
            )}

            <h3 className="text-2xl font-bold text-black dark:text-white mb-3 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">
              {repo.name}
            </h3>

            {repo.description && (
              <p className="text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
                {repo.description}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              {repo.language && (
                <span className={`text-xs px-3 py-1 font-medium text-white ${languageColors[repo.language] || "bg-zinc-500"}`}>
                  {repo.language}
                </span>
              )}
              {repo.topics.slice(0, 3).map((topic) => (
                <span
                  key={topic}
                  className="text-xs px-3 py-1 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                >
                  {topic}
                </span>
              ))}
            </div>

            <div className="flex gap-4 text-sm text-zinc-500 dark:text-zinc-500">
              {repo.stargazers_count > 0 && (
                <span className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span> {repo.stargazers_count}
                </span>
              )}
              {repo.forks_count > 0 && (
                <span className="flex items-center gap-1">
                  <span>⑂</span> {repo.forks_count}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>

      {filteredRepos.length === 0 && (
        <div className="text-center text-zinc-500 dark:text-zinc-500 py-12">
          No projects found in this category.
        </div>
      )}
    </div>
  );
}
