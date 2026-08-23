import type { BlogPost, BlogPostSummary } from "@/lib/blog-types";

export const locales = ["en", "sq"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const localeCookieName = "portfolio_locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.includes(value as Locale);
}

export const dictionaries = {
  en: {
    meta: {
      homeTitle: "Ardijan Curi | Entrepreneur & Software Engineer - Oninova",
      homeDescription:
        "Co-Founder & Software Engineer at Oninova. Building digital products, scalable web applications, and performance-driven solutions.",
      blogDescription:
        "Writing by Ardijan Curi on software engineering, digital products, and building at Oninova.",
      ogLocale: "en_US",
    },
    nav: {
      home: "Ardijan Curi home",
      blog: "Blog",
      projects: "Projects",
      language: "Language",
      english: "EN",
      albanian: "SQ",
    },
    theme: {
      toggle: "Toggle theme",
    },
    home: {
      role: "Entrepreneur & Software Engineer",
      buildingAt: "Co-Founder of",
      bio: [
        "Oninova helps businesses turn ideas into digital products and grow online.",
        "My role spans product and technology, from early strategy and architecture to development and launch.",
        "The focus is on practical, scalable solutions that save time, improve operations, and create measurable value.",
      ],
      blogEyebrow: "Blog",
      blogTitle: "Latest writing",
      viewAllPosts: "View all posts",
      blogSliderLabel: "Latest blog posts",
      previousPosts: "Previous posts",
      nextPosts: "Next posts",
      projectsTitle: "GitHub Projects",
      viewGithub: "View GitHub",
      footerRights: "All rights reserved.",
    },
    blog: {
      title: "Blog",
      heroTitle: "Notes from product engineering.",
      backHome: "Back home",
      empty: "No posts published yet.",
      fallbackLabel: "Blog",
    },
    post: {
      notFound: "Post not found",
      backToBlog: "Back to blog",
      by: "By",
      previous: "Previous post",
      next: "Next post",
      websitePreview: "Website preview",
      scrollToExplore: "Scroll to explore",
    },
    projects: {
      loading: "Loading projects...",
      empty: "No projects found or unable to fetch repositories.",
      all: "All",
      unknown: "Unknown",
      emptyCategory: "No projects found in this category.",
      showing: "Showing",
      of: "of",
      projects: "projects",
      previous: "Previous",
      next: "Next",
    },
    reading: {
      minRead: "min read",
    },
    login: {
      title: "Login",
      eyebrow: "Admin",
      heading: "Publish from the portfolio.",
      description:
        "Sign in with the approved owner account to create, edit, and remove blog posts.",
      adminError:
        "Your session is valid, but this account is not approved for blog publishing.",
      email: "Email",
      password: "Password",
      supabaseMissing: "Supabase environment variables are not configured.",
      unable: "Unable to sign in.",
      notAdmin: "This account is not approved for blog publishing.",
      signingIn: "Signing in...",
      signIn: "Sign in",
    },
    admin: {
      title: "Blog Admin",
      newMetaTitle: "New Blog Post",
      editMetaTitle: "Edit Blog Post",
      eyebrow: "Admin",
      postsHeading: "Blog posts",
      postsDescription:
        "Review published posts, update Markdown content, replace hero images, or remove posts from the live blog.",
      newPost: "New post",
      newPostHeading: "New blog post",
      editPostHeading: "Edit post",
      managePosts: "Manage posts",
      signOut: "Sign out",
      published: "Published",
      updated: "Updated",
      view: "View",
      edit: "Edit",
      delete: "Delete",
      deleting: "Deleting...",
      deleteConfirmStart: "Delete",
      deleteConfirmEnd: "This removes the post and its hero image.",
      empty: "No posts published yet.",
      form: {
        englishSection: "English version",
        albanianSection: "Albanian version",
        albanianHelp:
          "Optional. Complete all three Albanian fields to publish a translated version.",
        title: "Title",
        albanianTitle: "Albanian title",
        excerpt: "Excerpt",
        albanianExcerpt: "Albanian excerpt",
        content: "Markdown content",
        albanianContent: "Albanian Markdown content",
        markdownHelp: "Markdown links are supported. Max",
        characters: "characters.",
        author: "Author",
        projectLinkLabel: "Project link label",
        projectLinkLabelPlaceholder: "Live Website",
        projectLinkUrl: "Project redirect link",
        projectLinkUrlPlaceholder: "https://example.com",
        projectLinkHelp:
          "Optional. Add both fields to show a visible project link above the media preview.",
        heroMediaMode: "Scrollable website preview",
        heroMediaModeHelp:
          "Enable this to replace the image slider with a square window that scrolls through a full-page website screenshot.",
        imageSlider: "Image slider",
        scrollableWebsite: "Scrollable website",
        heroImage: "Hero image",
        replaceHeroImage: "Replace hero image",
        fullPageScreenshot: "Full-page website screenshot",
        replaceFullPageScreenshot: "Replace full-page website screenshot",
        fullPageScreenshotHelp:
          "Upload a tall screenshot of the complete website page. JPG, PNG, WebP, or GIF. Max 15 MB.",
        replaceFullPageScreenshotHelp:
          "Leave empty to keep the current screenshot. JPG, PNG, WebP, or GIF. Max 15 MB.",
        heroSliderImages: "Hero slider images",
        replaceHeroSliderImages: "Replace hero slider images",
        heroHelp: "JPG, PNG, WebP, or GIF. Max 5 MB.",
        replaceHeroHelp:
          "Leave empty to keep the current image. JPG, PNG, WebP, or GIF. Max 5 MB.",
        heroSliderHelp:
          "Optional. Add up to 5 images that appear after the main hero image. JPG, PNG, WebP, or GIF. Max 5 MB each.",
        replaceHeroSliderHelp:
          "Choose up to 5 images to replace the current slider. Leave empty to keep them.",
        removeHeroSliderImages: "Remove current slider images",
        selectedSliderImages: "Selected slider images",
        preview: "Preview",
        websitePreview: "Website preview",
        scrollPreview: "Scroll to preview",
        publishing: "Publishing...",
        publish: "Publish post",
        saving: "Saving...",
        save: "Save changes",
      },
      errors: {
        postIdRequired: "Post id is required.",
        titleLength: "Title must be between 3 and 160 characters.",
        excerptLength: "Excerpt must be between 10 and",
        excerptLengthEnd: "characters.",
        contentLength: "Markdown content must be at least 20 characters.",
        authorRequired: "Author is required.",
        heroRequired: "Hero image is required.",
        heroType: "Hero image must be a JPG, PNG, WebP, or GIF file.",
        heroSize: "Hero image must be 5 MB or smaller.",
        heroScrollSize:
          "The full-page website screenshot must be 15 MB or smaller.",
        heroUnsupported: "Unsupported hero image file type.",
        heroSliderLimit: "Upload up to 5 hero slider images.",
        heroSliderOrderInvalid: "Hero slider image order is invalid.",
        projectLinkIncomplete:
          "Add both the project link label and redirect link, or leave both empty.",
        projectLinkLabelLength:
          "Project link label must be 80 characters or fewer.",
        projectLinkUrlInvalid:
          "Project redirect link must be a valid http or https URL.",
        translationIncomplete:
          "Complete all Albanian translation fields, or leave them all empty.",
        albanianTitleLength:
          "Albanian title must be between 3 and 160 characters.",
        albanianExcerptLength: "Albanian excerpt must be between 10 and",
        albanianContentLength:
          "Albanian Markdown content must be at least 20 characters.",
        notFound: "Post not found.",
      },
    },
  },
  sq: {
    meta: {
      homeTitle: "Ardijan Curi | Sipërmarrës & Inxhinier Softueri - Oninova",
      homeDescription:
        "Bashkëthemelues dhe Inxhinier Softueri në Oninova. Ndërtoj produkte digjitale, aplikacione web të shkallëzueshme dhe zgjidhje të orientuara nga performanca.",
      blogDescription:
        "Shkrime nga Ardijan Curi për inxhinieri softuerike, produkte digjitale dhe ndërtim produktesh në Oninova.",
      ogLocale: "sq_AL",
    },
    nav: {
      home: "Faqja kryesore e Ardijan Curi",
      blog: "Blogu",
      projects: "Projektet",
      language: "Gjuha",
      english: "EN",
      albanian: "SQ",
    },
    theme: {
      toggle: "Ndrysho temën",
    },
    home: {
      role: "Sipërmarrës & Inxhinier Softueri",
      buildingAt: "Bashkëthemelues i",
      bio: [
        "Oninova ndihmon bizneset t'i kthejnë idetë në produkte digjitale dhe të rriten online.",
        "Roli im përfshin produktin dhe teknologjinë, nga strategjia dhe arkitektura te zhvillimi dhe lançimi.",
        "Fokusi është te zgjidhjet praktike dhe të shkallëzueshme që kursejnë kohë, përmirësojnë punën dhe krijojnë vlerë të matshme.",
      ],
      blogEyebrow: "Blogu",
      blogTitle: "Shkrimet e fundit",
      viewAllPosts: "Shiko të gjitha shkrimet",
      blogSliderLabel: "Postimet e fundit në blog",
      previousPosts: "Postimet e mëparshme",
      nextPosts: "Postimet e radhës",
      projectsTitle: "Projektet në GitHub",
      viewGithub: "Shiko GitHub",
      footerRights: "Të gjitha të drejtat e rezervuara.",
    },
    blog: {
      title: "Blogu",
      heroTitle: "Shënime nga inxhinieria e produkteve.",
      backHome: "Kthehu në fillim",
      empty: "Ende nuk ka postime të publikuara.",
      fallbackLabel: "Blog",
    },
    post: {
      notFound: "Postimi nuk u gjet",
      backToBlog: "Kthehu te blogu",
      by: "Nga",
      previous: "Postimi i meparshem",
      next: "Postimi i radhes",
      websitePreview: "Parapamja e faqes",
      scrollToExplore: "Lëviz për ta eksploruar",
    },
    projects: {
      loading: "Duke ngarkuar projektet...",
      empty: "Nuk u gjetën projekte ose depot nuk mund të merren.",
      all: "Të gjitha",
      unknown: "E panjohur",
      emptyCategory: "Nuk u gjetën projekte në këtë kategori.",
      showing: "Duke shfaqur",
      of: "nga",
      projects: "projekte",
      previous: "Para",
      next: "Pas",
    },
    reading: {
      minRead: "min lexim",
    },
    login: {
      title: "Hyrja",
      eyebrow: "Admin",
      heading: "Publiko nga portfolio.",
      description:
        "Hyr me llogarinë e miratuar të pronarit për të krijuar, ndryshuar dhe fshirë postime në blog.",
      adminError:
        "Seanca jote është e vlefshme, por kjo llogari nuk është e miratuar për publikim në blog.",
      email: "Email",
      password: "Fjalëkalimi",
      supabaseMissing: "Variablat e Supabase nuk janë konfiguruar.",
      unable: "Nuk ishte e mundur hyrja.",
      notAdmin: "Kjo llogari nuk është e miratuar për publikim në blog.",
      signingIn: "Duke hyrë...",
      signIn: "Hyr",
    },
    admin: {
      title: "Administrimi i Blogut",
      newMetaTitle: "Postim i Ri në Blog",
      editMetaTitle: "Ndrysho Postimin",
      eyebrow: "Admin",
      postsHeading: "Postimet në blog",
      postsDescription:
        "Rishiko postimet e publikuara, ndrysho përmbajtjen Markdown, zëvendëso imazhet kryesore ose largo postime nga blogu live.",
      newPost: "Postim i ri",
      newPostHeading: "Postim i ri në blog",
      editPostHeading: "Ndrysho postimin",
      managePosts: "Menaxho postimet",
      signOut: "Dil",
      published: "Publikuar",
      updated: "Përditësuar",
      view: "Shiko",
      edit: "Ndrysho",
      delete: "Fshi",
      deleting: "Duke fshirë...",
      deleteConfirmStart: "Të fshihet",
      deleteConfirmEnd: "Kjo e heq postimin dhe imazhin kryesor.",
      empty: "Ende nuk ka postime të publikuara.",
      form: {
        englishSection: "Versioni anglisht",
        albanianSection: "Versioni shqip",
        albanianHelp:
          "Opsionale. Plotëso të tri fushat shqip për të publikuar versionin e përkthyer.",
        title: "Titulli",
        albanianTitle: "Titulli shqip",
        excerpt: "Përmbledhja",
        albanianExcerpt: "Përmbledhja shqip",
        content: "Përmbajtja Markdown",
        albanianContent: "Përmbajtja Markdown shqip",
        markdownHelp: "Linket Markdown mbështeten. Maksimumi",
        characters: "karaktere.",
        author: "Autori",
        projectLinkLabel: "Etiketa e linkut te projektit",
        projectLinkLabelPlaceholder: "Live Website",
        projectLinkUrl: "Linku ridrejtues i projektit",
        projectLinkUrlPlaceholder: "https://example.com",
        projectLinkHelp:
          "Opsionale. Ploteso te dy fushat per ta shfaqur linkun mbi parapamjen e medias.",
        heroMediaMode: "Parapamje e faqes me lëvizje",
        heroMediaModeHelp:
          "Aktivizoje për ta zëvendësuar sliderin me një dritare katrore ku mund të lëvizësh nëpër screenshot-in e faqes së plotë.",
        imageSlider: "Slider imazhesh",
        scrollableWebsite: "Faqe me lëvizje",
        heroImage: "Imazhi kryesor",
        replaceHeroImage: "Zëvendëso imazhin kryesor",
        fullPageScreenshot: "Screenshot i faqes së plotë",
        replaceFullPageScreenshot: "Zëvendëso screenshot-in e faqes së plotë",
        fullPageScreenshotHelp:
          "Ngarko një screenshot të gjatë të faqes së plotë. JPG, PNG, WebP ose GIF. Maksimumi 15 MB.",
        replaceFullPageScreenshotHelp:
          "Lëre bosh për ta mbajtur screenshot-in aktual. JPG, PNG, WebP ose GIF. Maksimumi 15 MB.",
        heroSliderImages: "Imazhet e sliderit kryesor",
        replaceHeroSliderImages: "Zevendeso imazhet e sliderit kryesor",
        heroHelp: "JPG, PNG, WebP ose GIF. Maksimumi 5 MB.",
        replaceHeroHelp:
          "Lëre bosh për të mbajtur imazhin aktual. JPG, PNG, WebP ose GIF. Maksimumi 5 MB.",
        heroSliderHelp:
          "Opsionale. Shto deri ne 5 imazhe qe shfaqen pas imazhit kryesor. JPG, PNG, WebP ose GIF. Maksimumi 5 MB secili.",
        replaceHeroSliderHelp:
          "Zgjidh deri ne 5 imazhe per te zevendesuar sliderin aktual. Lere bosh per t'i mbajtur.",
        removeHeroSliderImages: "Hiq imazhet aktuale te sliderit",
        selectedSliderImages: "Imazhet e zgjedhura te sliderit",
        preview: "Parapamje",
        websitePreview: "Parapamja e faqes",
        scrollPreview: "Lëviz për parapamje",
        publishing: "Duke publikuar...",
        publish: "Publiko postimin",
        saving: "Duke ruajtur...",
        save: "Ruaj ndryshimet",
      },
      errors: {
        postIdRequired: "ID e postimit kërkohet.",
        titleLength: "Titulli duhet të ketë 3 deri në 160 karaktere.",
        excerptLength: "Përmbledhja duhet të ketë 10 deri në",
        excerptLengthEnd: "karaktere.",
        contentLength:
          "Përmbajtja Markdown duhet të ketë të paktën 20 karaktere.",
        authorRequired: "Autori kërkohet.",
        heroRequired: "Imazhi kryesor kërkohet.",
        heroType: "Imazhi kryesor duhet të jetë JPG, PNG, WebP ose GIF.",
        heroSize: "Imazhi kryesor duhet të jetë 5 MB ose më i vogël.",
        heroScrollSize:
          "Screenshot-i i faqes së plotë duhet të jetë 15 MB ose më i vogël.",
        heroUnsupported: "Lloj i pambështetur i imazhit kryesor.",
        heroSliderLimit: "Ngarko deri ne 5 imazhe per sliderin kryesor.",
        heroSliderOrderInvalid:
          "Renditja e imazheve te sliderit kryesor nuk eshte e vlefshme.",
        projectLinkIncomplete:
          "Shto etiketen dhe linkun ridrejtues te projektit, ose leri te dyja bosh.",
        projectLinkLabelLength:
          "Etiketa e linkut te projektit duhet te kete maksimum 80 karaktere.",
        projectLinkUrlInvalid:
          "Linku ridrejtues i projektit duhet te jete URL e vlefshme http ose https.",
        translationIncomplete:
          "Plotëso të gjitha fushat e përkthimit shqip, ose lëri të gjitha bosh.",
        albanianTitleLength:
          "Titulli shqip duhet të ketë 3 deri në 160 karaktere.",
        albanianExcerptLength:
          "Përmbledhja shqip duhet të ketë 10 deri në",
        albanianContentLength:
          "Përmbajtja Markdown shqip duhet të ketë të paktën 20 karaktere.",
        notFound: "Postimi nuk u gjet.",
      },
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

type LocalizablePost = Pick<
  BlogPost | BlogPostSummary,
  "title" | "excerpt" | "content" | "title_sq" | "excerpt_sq" | "content_sq"
>;

export function getLocalizedPost(post: LocalizablePost, locale: Locale) {
  if (locale !== "sq") {
    return {
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
    };
  }

  return {
    title: post.title_sq?.trim() || post.title,
    excerpt: post.excerpt_sq?.trim() || post.excerpt,
    content: post.content_sq?.trim() || post.content,
  };
}
