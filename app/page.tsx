import Projects from "@/components/Projects";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 md:px-12">
        <div className="max-w-5xl w-full">
          <h1 className="text-6xl md:text-8xl font-bold text-black dark:text-white mb-6">
            Ardijan Curi
          </h1>
          <p className="text-2xl md:text-3xl text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl">
            Software Developer
          </p>
          <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-500 mb-12 max-w-2xl">
            Building modern web applications with clean code and thoughtful design.
          </p>
          <div className="flex gap-6 text-lg">
            <a
              href="https://github.com/ardijancuri"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black dark:text-white hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors font-medium"
            >
              GitHub
            </a>
            <a
              href="mailto:your.email@example.com"
              className="text-black dark:text-white hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors font-medium"
            >
              Contact
            </a>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="min-h-screen px-6 md:px-12 py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-black dark:text-white mb-16">
            Projects
          </h2>
          <Projects username="ardijancuri" />
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-12 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto text-center text-zinc-500 dark:text-zinc-500">
          <p>&copy; {new Date().getFullYear()} Ardijan Curi. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
