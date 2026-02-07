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
}

async function fetchGitHubRepos(username: string): Promise<GitHubRepo[]> {
  try {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 3600 }, // Revalidate every hour
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch repositories");
    }

    const repos = await response.json();

    // Filter out forks and sort by stars
    return repos
      .filter((repo: GitHubRepo) => !repo.name.includes("fork"))
      .sort((a: GitHubRepo, b: GitHubRepo) => b.stargazers_count - a.stargazers_count);
  } catch (error) {
    console.error("Error fetching GitHub repos:", error);
    return [];
  }
}

export default async function Projects({ username }: { username: string }) {
  const repos = await fetchGitHubRepos(username);

  if (repos.length === 0) {
    return (
      <div className="text-zinc-500 dark:text-zinc-500">
        No projects found or unable to fetch repositories.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {repos.map((repo) => (
        <a
          key={repo.id}
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="group p-6 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-colors"
        >
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
              <span className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                {repo.language}
              </span>
            )}
            {repo.topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
              >
                {topic}
              </span>
            ))}
          </div>

          <div className="flex gap-4 text-sm text-zinc-500 dark:text-zinc-500">
            {repo.stargazers_count > 0 && (
              <span>★ {repo.stargazers_count}</span>
            )}
            {repo.forks_count > 0 && (
              <span>⑂ {repo.forks_count}</span>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}
