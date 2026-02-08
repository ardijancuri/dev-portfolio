import Projects from "@/components/Projects";
import ASCIILogo from "@/components/ASCIILogo";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-black">
      {/* Logo Header */}
      <header className="fixed top-0 left-0 right-0 z-50 pt-6 sm:pt-8 pb-4 sm:pb-6 px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="https://oninova.net" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-70 text-black dark:text-white">
            <svg className="w-12 h-11" viewBox="0 0 88 80" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M84.6736 0C78.6669 5.71521 72.448 13.859 71.9135 24.2362C71.3435 35.0719 76.3332 42.1423 82.3268 49.0801L88 55.6441C82.2206 48.9549 72.9434 40.4355 60.5261 39.8168C49.5652 39.2534 42.4131 44.1861 35.3952 50.1112L0 80C6.76651 74.2866 15.403 65.1357 16.0102 52.8399C16.5987 42.0244 11.5904 34.9338 5.61548 28.0181L0.0149001 21.5351C5.79428 28.2244 15.0715 36.7438 27.5075 37.3827C38.4683 37.9461 45.6036 32.9932 52.6197 27.0681L84.6736 0Z" />
            </svg>
          </a>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-[100svh] flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 pt-12 sm:pt-12 pb-12">
        <div className="max-w-7xl w-full">
          {/* Two columns: Bio (left) | ASCII (right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4 lg:gap-8 items-center">
            <div className="order-2 md:order-1 flex flex-col justify-center space-y-4 sm:space-y-6">
              {/* Name */}
              <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-7xl xl:text-8xl font-bold text-black dark:text-white leading-tight">
                Ardijan Curi
              </h1>
              <p className="text-xl sm:text-2xl md:text-2xl lg:text-3xl text-zinc-600 dark:text-zinc-400">
                Co-Founder & Software Engineer <br></br> Building Digital Products at <a href="https://oninova.net" target="_blank" rel="noopener noreferrer" className="text-black dark:text-white hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors underline decoration-2 underline-offset-4">Oninova</a>
              </p>
              <div className="text-sm sm:text-base md:text-sm lg:text-base text-zinc-500 dark:text-zinc-500 leading-relaxed space-y-4">
                <p>
                  Co-founder of Oninova, a software development and marketing agency helping businesses grow through digital products and performance-driven campaigns.
                </p>
                <p>
                  I lead the technical side — architecture, backend, and frontend. Turning business requirements into clean, scalable software.
                </p>
                <p>
                  We bring together engineering and marketing to drive measurable results through custom software, automation, and data-informed strategies.
                </p>
              </div>
              {/* Social Links */}
              <div className="mt-4 grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-4 text-sm sm:text-base">
                <a
                  href="https://www.linkedin.com/in/ardijan-curi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:w-36 flex items-center justify-start gap-2 px-5 py-2 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
                <a
                  href="https://oninova.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:w-36 flex items-center justify-start gap-2 px-5 py-2 border-2 border-white dark:border-white text-black dark:text-white hover:bg-white hover:text-black dark:hover:bg-white dark:hover:text-black transition-colors font-medium"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9" />
                  </svg>
                  Oninova
                </a>
                <a
                  href="https://github.com/ardijancuri"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:w-36 flex items-center justify-start gap-2 px-5 py-2 border-2 border-white dark:border-white text-black dark:text-white hover:bg-white hover:text-black dark:hover:bg-white dark:hover:text-black transition-colors font-medium"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
                <a
                  href="mailto:ardijan.curi@oninova.net"
                  className="sm:w-36 flex items-center justify-start gap-2 px-5 py-2 border-2 border-white dark:border-white text-black dark:text-white hover:bg-white hover:text-black dark:hover:bg-white dark:hover:text-black transition-colors font-medium"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </a>
              </div>
            </div>

            {/* ASCII Logo */}
            <div className="order-1 md:order-2 flex items-center justify-center md:justify-center mt-6 mb-6 ">
              <ASCIILogo />
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 py-16 sm:py-20 md:py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black dark:text-white mb-8 sm:mb-12 md:mb-16">
            Projects
          </h2>
          <Projects username="ardijancuri" />
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-10 md:py-12 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto text-center text-sm sm:text-base text-zinc-500 dark:text-zinc-500">
          <p>&copy; {new Date().getFullYear()} Ardijan Curi. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
