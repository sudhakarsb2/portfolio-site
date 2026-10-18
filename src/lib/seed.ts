import { and, count, eq, inArray, ne } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  experiences,
  messages,
  projectTags,
  projects,
  services,
  sessions,
  siteSettings,
  tags,
  testimonials,
  users,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { slugify } from "@/lib/utils";

/** The single account allowed to sign in. */
const OWNER_EMAIL = "sudhakar.bhambade2@gmail.com";
/** Legacy spellings that may exist in older databases. */
const LEGACY_OWNER_EMAILS = ["sudhakar.bhambde2@gmail.com"];
const OWNER_PASSWORD = "Portfolio#123";
/** Bump this to re-apply the single-owner account migration once. */
const AUTH_VERSION = "single-owner-v2";

/** Bump this to replace the demo content on every existing database once. */
const SEED_VERSION = "sudhakar-2026-v2";

const categorySeed = [
  { name: "Brand Rollouts", slug: "brand-rollouts", color: "#ff4a1c", description: "Approved ideas, produced across every channel without drift.", sortOrder: 1 },
  { name: "Out of Home", slug: "out-of-home", color: "#3ba9ff", description: "Billboards, unipoles, bus shelters and mall media — built to scale.", sortOrder: 2 },
  { name: "Point of Sale", slug: "point-of-sale", color: "#d7f24b", description: "POSM and in-store communication that survives the shop floor.", sortOrder: 3 },
  { name: "Packaging", slug: "packaging", color: "#7a5cff", description: "Die-lines, master templates and press-ready pack artwork.", sortOrder: 4 },
  { name: "Digital", slug: "digital", color: "#ff9a3c", description: "File conversion and platform-ready asset sets.", sortOrder: 5 },
  { name: "Print & Editorial", slug: "print-editorial", color: "#e0a100", description: "Magazines, collateral and information design for print.", sortOrder: 6 },
];

const tagSeed = [
  "Rollout",
  "Format Conversion",
  "Master Templates",
  "FMCG",
  "Luxury",
  "Automotive",
  "Banking",
  "Infographics",
  "Magazine",
  "Multi-lingual",
];

const serviceSeed = [
  {
    title: "Brand Rollouts & Creative Guardianship",
    slug: "brand-rollouts",
    description:
      "A brand guardian for your creative and your files. I analyse designs for concept strength, typography, colour and on-brand impact — then produce every output to guideline across all channels and touchpoints.",
    deliverables: ["Creative & guideline compliance audits", "Concept, layout & typography reviews", "Multi-brand font rollouts", "Master template systems", "Managed colour swatches"],
    priceFrom: 0,
    accent: "#ff4a1c",
    icon: "aperture",
    sortOrder: 1,
  },
  {
    title: "Packaging Production",
    slug: "packaging-production",
    description:
      "Pack layouts reviewed for shelf impact and brand accuracy first, then produced to exact vendor specifications — from master die-line templates to zero-error press runs.",
    deliverables: ["Die-line guide library", "Master packaging templates", "Shelf-impact creative review", "CMYK & Pantone colour management", "Press-ready Illustrator files"],
    priceFrom: 0,
    accent: "#7a5cff",
    icon: "box",
    sortOrder: 2,
  },
  {
    title: "Out-of-Home Production",
    slug: "out-of-home",
    description:
      "Billboards, unipoles, bus shelters and mall media. One approved key visual, adapted with a clear legibility hierarchy and scaled to every format without losing structure or proportion.",
    deliverables: ["Legibility & hierarchy review", "Format-by-format adaptation", "Large-format file prep", "Safe-zone & bleed checks", "Vendor spec compliance"],
    priceFrom: 0,
    accent: "#3ba9ff",
    icon: "compass",
    sortOrder: 3,
  },
  {
    title: "POSM & In-Store",
    slug: "posm-in-store",
    description:
      "Shelf-talkers, wobblers, floor stands, counter displays and gondola ends — creative reviewed for shopper behaviour at arm's length, then produced for corporate, in-store and retail environments.",
    deliverables: ["Creative review for in-store impact", "POSM artwork & die-cuts", "Retail format adaptation", "Multi-lingual versions", "Production schedules"],
    priceFrom: 0,
    accent: "#d7f24b",
    icon: "layers",
    sortOrder: 4,
  },
  {
    title: "Digital Production & File Conversion",
    slug: "digital-rollouts",
    description:
      "Different format files — from any source — converted into friendly, editable Illustrator and InDesign masters that are easy to optimise and handle, built for quick turnarounds on rollouts. Then complete, platform-ready asset sets for every digital placement.",
    deliverables: ["Converting different files to rollout-friendly formats", "Editable, optimised master files", "Resize matrices", "Platform spec compliance", "Bilingual adaptation"],
    priceFrom: 0,
    accent: "#ff9a3c",
    icon: "monitor",
    sortOrder: 5,
  },
  {
    title: "Prepress & Preflight",
    slug: "prepress-preflight",
    description:
      "Rigorous checks of creative and craft so the first press run is the right one: brand accuracy, colour, bleed, layers, links, naming and alignment — all verified before release.",
    deliverables: ["Creative QA & brand checks", "Pre-flight reports", "Layer & naming standards", "Alignment & margin audits", "Archive & version control"],
    priceFrom: 0,
    accent: "#e0a100",
    icon: "book",
    sortOrder: 6,
  },
];

const testimonialSeed = [
  {
    name: "Muhammad Jaan Faruqui",
    role: "Creative Director",
    company: "Mediascope Publicitas India Pvt. Ltd.",
    quote:
      "He doesn't succumb to pressure and gets things completed in a short turnaround time which has awarded him with lots of appreciation.",
    rating: 5,
    sortOrder: 1,
  },
  {
    name: "Asavari Virshid",
    role: "Deputy Manager, Communication Design",
    company: "Tata Interactive Systems",
    quote:
      "His efforts have produced high quality results time again. I feel his promising leadership abilities will become even more effective in a creative field.",
    rating: 5,
    sortOrder: 2,
  },
  {
    name: "Aditya Dalvi",
    role: "Project Manager",
    company: "Tata Interactive Systems",
    quote:
      "Process orientation and completion of assignment with keen skill set and strong graphical background is what he is equipped with.",
    rating: 5,
    sortOrder: 3,
  },
  {
    name: "Ravindra Shinde",
    role: "Manager, Design and Print",
    company: "Orient Press Ltd",
    quote:
      "During his tenure, Sudhakar has consistently demonstrated a strong work ethic and a dedication to success.",
    rating: 5,
    sortOrder: 4,
  },
];

const experienceSeed = [
  {
    role: "Graphic Designer — Production Artist",
    company: "Leo Burnett MEA (Middle East & Africa)",
    period: "April 2018 — Present",
    location: "United Arab Emirates",
    description:
      "Act as a dedicated brand guardian, ensuring all creative outputs strictly adhere to established brand identity frameworks and visual guidelines across every channel and touchpoint.\n\nServe as designer and production artist for high-volume packaging, rollouts for all digital platforms, POSMs and print campaigns for major global accounts. Managed McDonald's GCC campaigns across corporate, in-store, outdoor (OOH) and packaging collateral, alongside high-profile accounts including P&G, Ferrero, Bel Group, Kellogg's, Visa, Emirates NBD, ADCB, Dubai Holding, Richemont Group (Van Cleef & Arpels and Panerai), AGMC Geely, Mercedes-Benz, Home Centre and Philip Morris.\n\nSeamlessly bridge digital design and physical production by converting different format files into friendly, editable Adobe Illustrator and InDesign formats which provide easy optimization and better handling to perform quick turnaround on rollouts.\n\nConduct rigorous pre-flight checks, colour management (CMYK and Pantone swatches), bleed setups and layout checks to ensure zero-error press runs based on provided vendor technical specifications. Built and manage a standardized file management system, die-line guide library and version-control framework — with meticulously structured production files: standardized naming conventions, clean layer organization, precise alignment guides and managed colour swatches so distributed teams always work with active, up-to-date materials.\n\nDirect multi-brand font rollouts, create master packaging templates and audit high-volume collateral sets to ensure strict guideline compliance across diverse print, digital and OOH formats — and manage complex multi-lingual campaigns while maintaining structural integrity, margins and brand proportion rules.",
    sortOrder: 1,
  },
  {
    role: "Visual Identity Designer (Graphic Design Analyst)",
    company: "BlackRock",
    period: "July 2016 — March 2018",
    location: "",
    description:
      "Worked as a visual identity designer: summarized complicated information into simplified visualizations through group facilitation with key stakeholders; developed and designed information graphics and interactive presentations of complex ideas for both print and digital platforms; recommended infographic deliverables and formats so they could be re-used across a variety of marketing materials and channels; helped the in-house team on best practices and methods in data visualization and infographics; comprehended complex concepts and expressed them clearly with scribbles; and conceptualized ideas to ensure the design was implemented correctly in its final form, on time.",
    sortOrder: 2,
  },
  {
    role: "Graphic Designer",
    company: "Comart / Comartone",
    period: "March 2015 — April 2016",
    location: "Mumbai Metropolitan Region",
    description:
      "Worked for our client Leo Burnett Dubai. Ensured compliance with proper execution of brand standards by developing deliverables within approved branding guidelines; ensured visibility of a campaign idea across print, outdoor and digital advertising; and created Arabic versions of designs after initial layouts were developed by the creative team. Worked on marketing collateral, newspaper and magazine ads, OOH ads and sales promotion material (POSM, FMOT) for P&G, Bel Group, GMC, du, Ooredoo, McDonald's, Kellogg's and others.",
    sortOrder: 3,
  },
  {
    role: "Graphic Designer / Magazine Designer",
    company: "Publicitas Publishing",
    period: "October 2012 — February 2015",
    location: "Mumbai Metropolitan Region",
    description:
      "Designed lifestyle, fashion and business magazines; understood the briefs from the editors; and worked on assignments through pre-printing and pre-publishing steps like composition and pagination according to project specifications. Worked on luxury magazines like Taj Coffee Table, DLF Emporio, The Leela Magazine and The Oberoi Magazine, and on in-house magazines like Blackbook, Eat Stay Love and Made in India.",
    sortOrder: 4,
  },
  {
    role: "Team Lead",
    company: "Tata Interactive Systems",
    period: "November 2010 — October 2012",
    location: "Mumbai Metropolitan Region",
    description:
      "Analysed storyboards and presented them in the most effective way to enhance learning. Coordinated with the instructional designers team on content production, understood requirements and created assets to meet them according to storyboards, and coordinated with the illustration development team for precise enhancement. Identified and placed all visual elements including illustrations and font styles to produce effective templates; reviewed systems, process orientation and specifications according to project standards; and produced accurate, high-quality, compressed files for the final process.",
    sortOrder: 5,
  },
  {
    role: "Graphic Designer",
    company: "Orient Press Ltd",
    period: "January 2008 — July 2010",
    location: "Mumbai Area, India",
    description:
      "Extensive, demonstrated experience of print and design with knowledge of electronic prepress. Developed design concepts by evaluating space requirements and type size-style; prepared finished page layouts by writing, editing, keying and copying text, and creating and importing graphics — converting and scanning illustrations and photographs into digital images. Maintained quality by editing layouts for spelling, grammar, punctuation, reproduction, clarity and consistency, adhering to prepress standards; initiated printing production by transmitting files and prepared printing plates by separating colours and operating plate-making systems; and maintained prepress files by filing and retrieving layouts. Made brochures, flyers, newsletters, puzzle books, kids activity books, export books, cartons, calendars, diary layouts, banners, annual reports and more.",
    sortOrder: 6,
  },
];

type ProjectSeed = {
  title: string;
  client: string;
  year: number;
  category: string;
  featured: boolean;
  order: number;
  summary: string;
  description: string;
  credits: string[];
  tags: string[];
};

const projectSeed: ProjectSeed[] = [
  {
    title: "GCC Campaign Rollout",
    client: "McDonald's — GCC",
    year: 2025,
    category: "brand-rollouts",
    featured: true,
    order: 1,
    summary: "One campaign idea, reviewed for brand impact, then produced across corporate, in-store, outdoor and packaging collateral for the GCC.",
    description:
      "A single approved creative had to land identically in dozens of formats across the GCC: corporate communication, in-store material, outdoor and packaging collateral. Before a single artboard was adapted, the creative was analysed for on-brand typography, colour and layout — then produced with the same discipline.\n\nEvery asset moved through the same pipeline: structured artwork, pre-flight, vendor-spec checks and a clean hand-off package. The result is a rollout where a tray liner, a window cling and a billboard still read as one campaign.",
    credits: ["Role — Production artist & brand guardian", "Agency — Leo Burnett MEA", "Scope — Corporate · In-store · OOH · Packaging"],
    tags: ["Rollout", "QSR", "Production", "Master Templates"],
  },
  {
    title: "Masterfile & Die-line System",
    client: "Leo Burnett MEA",
    year: 2024,
    category: "brand-rollouts",
    featured: true,
    order: 2,
    summary: "A standardised file-management system, die-line library and version-control framework for distributed teams.",
    description:
      "High-volume production only stays accurate if everyone starts from the same file. This system standardises naming conventions, layer structure, alignment guides and managed colour swatches, so distributed teams always work with active, up-to-date materials.\n\nIt includes a searchable die-line guide library for packaging and a version-control framework that makes it obvious which file is live. Fewer re-dos, cleaner hand-offs and zero ambiguity at the printer.",
    credits: ["Role — System design & maintenance", "Includes — Naming standards · Layer rules · Swatch libraries", "Used by — Studio & vendor teams"],
    tags: ["Master Templates", "Die-line", "Production", "Preflight"],
  },
  {
    title: "Highway Unipole & Mall Media Series",
    client: "Automotive group",
    year: 2025,
    category: "out-of-home",
    featured: true,
    order: 3,
    summary: "A launch key visual scaled from mall media to 48-sheet unipoles with structure and proportion intact.",
    description:
      "Large-format work punishes small mistakes. The key visual was rebuilt per format with safe zones, bleed and resolution handled at the right scale, so the vehicle, headline and legal line stayed legible from highway distance to mall concourse.\n\nFiles were delivered as vendor-ready packages with notes for each site, which meant fewer queries and no reprints at install.",
    credits: ["Role — Large-format production", "Formats — Unipole · Mall media · Bus shelter", "Handover — Vendor spec packages"],
    tags: ["Large Format", "Automotive", "Production", "Rollout"],
  },
  {
    title: "Bus Shelter to Billboard",
    client: "Banking portfolio",
    year: 2024,
    category: "out-of-home",
    featured: false,
    order: 4,
    summary: "A financial-services campaign adapted across OOH formats with strict brand-proportion rules.",
    description:
      "Financial brands are unforgiving about logo clear-space and legal copy. Each OOH format was built from a locked master, with proportions and typography rules audited before artwork left the studio.\n\nThe set shipped as a single, organised package — consistent naming, flattened proofs, and live files — ready for multiple media owners.",
    credits: ["Role — Production & guideline audit", "Formats — Bus shelter · Billboard · Digital OOH"],
    tags: ["Banking", "Large Format", "Preflight"],
  },
  {
    title: "Aisle Takeover Kit",
    client: "FMCG portfolio",
    year: 2024,
    category: "point-of-sale",
    featured: false,
    order: 5,
    summary: "Shelf-talkers, wobblers and floor stands produced as a modular family for in-store activation.",
    description:
      "In-store communication has to work at arm's length and from across the aisle. The kit was built as modular components — shelf strips, wobblers and a floor stand — sharing one grid, so a store team could mix and match without breaking the look.\n\nEach piece was supplied with die-cuts, fold lines and a production schedule for the printer.",
    credits: ["Role — POSM artwork & die-cuts", "Deliverables — Shelf-talker · Wobbler · Floor stand"],
    tags: ["Retail", "FMCG", "Die-line", "Production"],
  },
  {
    title: "Counter Display & Gondola End",
    client: "Confectionery brand",
    year: 2023,
    category: "point-of-sale",
    featured: false,
    order: 6,
    summary: "Impulse-purchase displays built to exact retailer and fabricator specifications.",
    description:
      "Counter and gondola-end displays have to satisfy both the brand and the retailer's fixture rules. Artwork was planned around the construction — fold, glue and cut — with colour managed against approved Pantone references.\n\nThe finished files went to the fabricator as a single clean package with annotated die-lines.",
    credits: ["Role — Production artist", "Deliverables — Counter display · Gondola end · Header cards"],
    tags: ["Retail", "Pantone", "Die-line"],
  },
  {
    title: "Seasonal Gift Box Rollout",
    client: "Luxury group",
    year: 2024,
    category: "packaging",
    featured: true,
    order: 7,
    summary: "Premium seasonal packaging with spot-colour and finishing precision across a multi-maison range.",
    description:
      "Luxury packaging allows no visible compromise. Artwork was set on exact die-lines with managed spot colours, bleed and registration allowances for foils and embossing, then checked against vendor technical specifications before release.\n\nA master template made it possible to roll the same structure across several maisons without losing each house's character.",
    credits: ["Role — Packaging production", "Finishes — Spot colour · Foil · Emboss", "Output — Press-ready Illustrator files"],
    tags: ["Luxury", "Pantone", "Die-line", "CMYK"],
  },
  {
    title: "Multi-SKU Pack Family",
    client: "Dairy & cheese brand",
    year: 2023,
    category: "packaging",
    featured: false,
    order: 8,
    summary: "A consistent pack architecture across dozens of SKUs, flavours and sizes.",
    description:
      "A range lives or dies on consistency at the shelf. A master packaging template governed layout, typography and colour for every SKU, so new variants could be produced quickly and without drift.\n\nEvery pack was pre-flighted for colour, bleeds and barcodes, and filed to a strict naming convention.",
    credits: ["Role — Master templates & SKU production", "Scope — Multiple sizes and flavours"],
    tags: ["FMCG", "Master Templates", "Preflight", "CMYK"],
  },
  {
    title: "File Conversion & Resize Matrix",
    client: "Retail group",
    year: 2025,
    category: "digital",
    featured: false,
    order: 9,
    summary: "Different format files converted into friendly, editable masters — then a complete, platform-ready asset set.",
    description:
      "Supplied layouts and masters from any source were converted into friendly, editable Illustrator and InDesign files — easy to optimize and handle — then translated into a full matrix of digital placements, each respecting platform safe areas, file-weight limits and brand rules. Layout logic was built once and re-used, so updates ripple through every size at once.\n\nAssets were delivered in organised packages — named, versioned and ready for trafficking.",
    credits: ["Role — Digital production & file conversion", "Workflow — Any format to final delivery"],
    tags: ["Format Conversion", "Retail", "Rollout"],
  },
  {
    title: "Bilingual Arabic Adaptation",
    client: "Telecom campaign",
    year: 2023,
    category: "digital",
    featured: false,
    order: 10,
    summary: "Right-to-left adaptations that keep structure, margins and brand proportion intact.",
    description:
      "Arabic versions are not mirrored layouts. Each adaptation was rebuilt for right-to-left reading, with typography, line-breaks and hierarchy re-balanced so the Arabic and English versions carry equal weight.\n\nMargins and proportion rules were kept identical across languages, so both versions share one visual identity.",
    credits: ["Role — Multi-lingual production", "Languages — English · Arabic"],
    tags: ["Arabic", "Multi-lingual", "Rollout"],
  },
  {
    title: "Luxury Magazine Pagination",
    client: "Publicitas Publishing",
    year: 2014,
    category: "print-editorial",
    featured: false,
    order: 11,
    summary: "Composition and pagination for luxury lifestyle and hospitality magazines.",
    description:
      "Designed and paginated lifestyle, fashion and business magazines for luxury and hospitality brands, working from editorial briefs through pre-print steps to final files.\n\nThe craft here — rhythm, white space and typographic discipline — is the same one that now underpins high-volume production work.",
    credits: ["Role — Magazine designer", "Titles — Luxury hospitality & lifestyle publications"],
    tags: ["Magazine", "Production", "CMYK"],
  },
  {
    title: "Information Graphics for Finance",
    client: "BlackRock",
    year: 2017,
    category: "print-editorial",
    featured: false,
    order: 12,
    summary: "Complex financial information turned into clear visualisations for print and digital.",
    description:
      "Worked with stakeholders to summarise complicated information into simplified visualisations, presentations and infographics for both print and digital — and set standards so the in-house team could re-use them.\n\nConcepts were sketched first, then built into final formats and delivered on time.",
    credits: ["Role — Visual identity design analyst", "Output — Infographics · Presentations"],
    tags: ["Infographics", "Banking", "Production"],
  },
];

const messageSeed = [
  {
    name: "Hannah Weber",
    email: "hannah@example.com",
    company: "Brand studio",
    subject: "Packaging rollout support",
    budget: "Campaign rollout",
    message:
      "We have a multi-SKU packaging refresh landing next quarter and need a production artist who can build master templates and pre-flight everything for print. Are you available for a project-based engagement?",
    status: "new" as const,
  },
  {
    name: "Marcus Chen",
    email: "marcus@example.com",
    company: "Agency",
    subject: "OOH adaptation for a launch",
    budget: "Single project",
    message:
      "Looking for help adapting a launch key visual across unipoles, mall media and bus shelters. Files need to meet media-owner specs.",
    status: "new" as const,
  },
  {
    name: "Sofia Almeida",
    email: "sofia@example.com",
    company: "Retail",
    subject: "POSM kit for a seasonal promotion",
    budget: "Single project",
    message:
      "We need shelf-talkers, wobblers and a floor stand for a seasonal activation across three markets, with Arabic versions.",
    status: "read" as const,
  },
  {
    name: "Daniel Ross",
    email: "daniel@example.com",
    company: "Consumer goods",
    subject: "Ongoing production support",
    budget: "Retainer / ongoing",
    message:
      "Interested in ongoing support for packaging and digital rollouts — someone to guard the guidelines and keep our file system tidy.",
    status: "read" as const,
  },
];

const settingSeed: Array<{ key: string; value: string; group: string }> = [
  { key: "studioName", value: "Sudhakar Bhambade", group: "general" },
  { key: "designerName", value: "Sudhakar Bhambade", group: "general" },
  { key: "roleTitle", value: "Graphic Designer / Identity & Production Specialist", group: "general" },
  { key: "headline", value: "Your brand, on every touchpoint.", group: "general" },
  {
    key: "heroWords",
    value: "billboard., shelf., pack., screen.",
    group: "general",
  },
  { key: "holdLabel", value: "Hold to open the full portfolio", group: "pages" },
  { key: "holdLabelArchive", value: "Hold to unlock the full portfolio", group: "pages" },
  { key: "workHeadline", value: "Every channel.|One standard.", group: "pages" },
  { key: "workIntro", value: "", group: "pages" },
  { key: "servicesHeadline", value: "Built to spec.|Delivered clean.", group: "pages" },
  { key: "servicesIntro", value: "", group: "pages" },
  { key: "aboutHeadline", value: "The person who makes sure it|prints right.", group: "pages" },
  { key: "contactHeadline", value: "Let’s get your brand|ready.", group: "pages" },
  { key: "footerHeadline", value: "Got a rollout|to ship?", group: "pages" },
  {
    key: "subheadline",
    value:
      "Graphic designer and production artist with a creative eye and a press-room hand — I analyse designs for brand impact, then turn approved ideas into flawless, press-ready rollouts across digital, out-of-home, point of sale and packaging.",
    group: "general",
  },
  {
    key: "about",
    value:
      "Graphic designer with a demonstrated history of working in advertising and print. Strong business development professional with a post graduate degree in advertising and media from the University of Mumbai and a certificate diploma in applied art from Rachana Sansad, School of Applied Art.\n\nSince 2018 I have worked at Leo Burnett MEA as a dedicated brand guardian, designer and production artist — analysing creative work for concept strength, typography, colour and brand fit, and producing high-volume packaging, rollouts for every digital platform, POSMs and print campaigns for major global accounts. I bridge design and physical production, converting different format files into friendly, editable Adobe Illustrator and InDesign formats that are easy to optimise and handle — built for quick turnarounds on rollouts.",
    group: "general",
  },
  { key: "email", value: "sudhakar.bhambade2@gmail.com", group: "contact" },
  { key: "location", value: "United Arab Emirates", group: "contact" },
  { key: "availability", value: "Open to production & rollout projects", group: "contact" },
  { key: "responseTime", value: "Replies within one working day", group: "contact" },
  { key: "linkedin", value: "https://www.linkedin.com/in/sudhakar-bhambade-596231111", group: "social" },
  { key: "yearsExperience", value: "18", group: "stats" },
  { key: "agencyYears", value: "8", group: "stats" },
  { key: "brandsCount", value: "20", group: "stats" },
  { key: "channelsCount", value: "4", group: "stats" },
  {
    key: "clients",
    value:
      "McDonald's, P&G, Ferrero, Bel Group, Kellogg's, Visa, Emirates NBD, ADCB, Dubai Holding, Richemont, Van Cleef & Arpels, Panerai, AGMC, GMC, Mercedes-Benz, Geely, Home Centre, Philip Morris, du, Ooredoo",
    group: "general",
  },
  {
    key: "skills",
    value:
      "Design & Creative: Visual identity design, Creative analysis, Exhibitions | Production & Print: Press-ready artwork, CMYK & Pantone colour management, Die-line libraries, Pre-flight & bleed setups, Illustrator & InDesign masters, Arabic & bilingual adaptation | Workflow & Management: Production schedules, Brand guardianship, File naming & version control, Personal management",
    group: "general",
  },
  {
    key: "education",
    value: JSON.stringify([
      {
        school: "Rachana Sansad's College of Applied Arts and Craft",
        program: "Certification in Applied Art",
        period: "2016 — 2018",
      },
      {
        school: "University of Mumbai",
        program: "Master's degree in Commerce, Accounting and Business / Management",
        period: "2012 — 2014",
      },
      {
        school: "University of Mumbai",
        program: "PGDAM — Post Graduate Diploma in Advertising and Media",
        period: "2012 — 2013",
      },
    ]),
    group: "general",
  },
  {
    key: "process",
    value: JSON.stringify([
      {
        title: "Decode",
        body: "Read the brief, the guidelines, the vendor specs and the schedule — and analyse the creative for brand fit and concept strength before a single artboard is opened.",
      },
      {
        title: "Build",
        body: "Master templates and structured files, converting different format files into friendly Illustrator and InDesign formats that are easy to optimize and handle — built for quick turnarounds.",
      },
      {
        title: "Preflight",
        body: "Colour, bleed, layers, links, naming and alignment — checked until the first press run is the right one.",
      },
      {
        title: "Deliver",
        body: "Organised, versioned packages with clear hand-over to every vendor, plus a clean archive for next time.",
      },
    ]),
    group: "general",
  },
];

let seedPromise: Promise<void> | null = null;

async function runSeed(): Promise<void> {
  const current = await db
    .select({ value: siteSettings.value })
    .from(siteSettings)
    .where(eq(siteSettings.key, "seedVersion"))
    .limit(1);
  if (current[0]?.value === SEED_VERSION) return;

  // Content safety lock: if ANY seed version marker exists, this database is
  // already in use by the owner. Never wipe or replace their content — just
  // stamp the new version so additive migrations (ensureCatalog etc.) run.
  if (current[0]) {
    await db
      .update(siteSettings)
      .set({ value: SEED_VERSION })
      .where(eq(siteSettings.key, "seedVersion"));
    return;
  }

  // Fresh, empty database only: install the starter content once.
  // Accounts, sessions, uploaded media and the profile photo are preserved.
  const photo = await db
    .select({ value: siteSettings.value })
    .from(siteSettings)
    .where(eq(siteSettings.key, "profilePhoto"))
    .limit(1);
  const photoValue = photo[0]?.value ?? "";

  await db.delete(projectTags);
  await db.delete(projects);
  await db.delete(tags);
  await db.delete(categories);
  await db.delete(services);
  await db.delete(testimonials);
  await db.delete(experiences);
  await db.delete(messages);
  await db.delete(siteSettings);

  const [{ total }] = await db.select({ total: count() }).from(users);
  if (total === 0) {
    const passwordHash = hashPassword(OWNER_PASSWORD);
    await db.insert(users).values([
      {
        email: OWNER_EMAIL,
        passwordHash,
        name: "Sudhakar Bhambade",
        role: "owner",
        title: "Graphic Designer / Identity & Production Specialist",
        bio: "Graphic designer and production artist producing brand rollouts for digital, out-of-home, point of sale and packaging.",
      },
    ]);
  }

  const insertedCategories = await db.insert(categories).values(categorySeed).returning();
  const insertedTags = await db
    .insert(tags)
    .values(tagSeed.map((name) => ({ name, slug: slugify(name) })))
    .returning();

  await db.insert(services).values(serviceSeed);
  await db.insert(testimonials).values(testimonialSeed);
  await db.insert(experiences).values(experienceSeed);

  const categoryIdBySlug = new Map(insertedCategories.map((row) => [row.slug, row.id]));
  const tagIdByName = new Map(insertedTags.map((row) => [row.name, row.id]));

  for (const project of projectSeed) {
    const [row] = await db
      .insert(projects)
      .values({
        title: project.title,
        slug: slugify(project.title),
        client: project.client,
        year: project.year,
        categoryId: categoryIdBySlug.get(project.category) ?? null,
        summary: project.summary,
        description: project.description,
        credits: project.credits,
        featured: project.featured,
        order: project.order,
        status: "published",
      })
      .returning();

    const tagIds = project.tags
      .map((tag) => tagIdByName.get(tag))
      .filter((id): id is number => typeof id === "number");

    if (tagIds.length) {
      await db.insert(projectTags).values(tagIds.map((tagId) => ({ projectId: row.id, tagId })));
    }
  }

  await db.insert(messages).values(messageSeed);
  await db.insert(siteSettings).values([
    ...settingSeed,
    ...(photoValue ? [{ key: "profilePhoto", value: photoValue, group: "general" }] : []),
    { key: "seedVersion", value: SEED_VERSION, group: "system" },
  ]);
}

export async function countProjects(): Promise<number> {
  const [{ total }] = await db.select({ total: count() }).from(projects);
  return total;
}

const removedTagNames = [
  "Arabic",
  "CMYK",
  "Die-line",
  "Die-lines",
  "Figma to Print",
  "Figma to InDesign",
  "Figma to Indesign",
  "Large Format",
  "Pantone",
  "Preflight",
  "Production",
  "production",
  "QSR",
  "Retail",
];

async function ensureCatalog() {
  const luxury = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, "luxury-magazines"))
    .limit(1);
  if (!luxury[0]) {
    await db.insert(categories).values({
      name: "Luxury Magazines",
      slug: "luxury-magazines",
      description: "Luxury, lifestyle and hospitality magazines.",
      color: "#f5f5f7",
      sortOrder: 7,
    });
  }
  await db.delete(tags).where(inArray(tags.name, removedTagNames));

  // Refresh the availability wording for databases still on an earlier default.
  await db
    .update(siteSettings)
    .set({ value: "Open to design & production" })
    .where(
      and(
        eq(siteSettings.key, "availability"),
        inArray(siteSettings.value, [
          "Open to identity, rollout and production projects",
          "Open to production & rollout projects",
        ]),
      ),
    );

  // Backfill the relocation status for databases seeded before it existed.
  const relocationRow = await db
    .select({ id: siteSettings.id })
    .from(siteSettings)
    .where(eq(siteSettings.key, "relocation"))
    .limit(1);
  if (!relocationRow[0]) {
    await db
      .insert(siteSettings)
      .values({ key: "relocation", value: "Ready for relocation", group: "contact" });
  } else {
    await db
      .update(siteSettings)
      .set({ value: "Ready for relocation" })
      .where(and(eq(siteSettings.key, "relocation"), eq(siteSettings.value, "Ready to relocate")));
  }

  // Upgrade the skills setting to the grouped layout — only if the owner has
  // not customised it since.
  const skillsRow = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, "skills"))
    .limit(1);
  if (skillsRow[0] && skillsRow[0].value === 'Visual identity design, Creative analysis, Production schedules, Brand guardianship, Press-ready artwork, CMYK & Pantone colour management, Die-line libraries, Pre-flight & bleed setups, Illustrator & InDesign masters, File naming & version control, Arabic & bilingual adaptation, Exhibitions, Personal management') {
    await db
      .update(siteSettings)
      .set({ value: 'Design & Creative: Visual identity design, Creative analysis, Exhibitions | Production & Print: Press-ready artwork, CMYK & Pantone colour management, Die-line libraries, Pre-flight & bleed setups, Illustrator & InDesign masters, Arabic & bilingual adaptation | Workflow & Management: Production schedules, Brand guardianship, File naming & version control, Personal management' })
      .where(eq(siteSettings.id, skillsRow[0].id));
  }
}

/**
 * One-time account migration: exactly one owner account may exist, with the
 * email and password chosen by the owner. Runs once per AUTH_VERSION, so a
 * password changed later in the dashboard is never overwritten.
 */
async function ensureSingleOwner() {
  const flag = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, "authVersion"))
    .limit(1);
  if (flag[0]?.value === AUTH_VERSION) return;

  const passwordHash = hashPassword(OWNER_PASSWORD);
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(inArray(users.email, [OWNER_EMAIL, ...LEGACY_OWNER_EMAILS]))
    .limit(1);

  if (existing[0]) {
    await db
      .update(users)
      .set({ email: OWNER_EMAIL, passwordHash, role: "owner", name: "Sudhakar Bhambade" })
      .where(eq(users.id, existing[0].id));
  } else {
    await db.insert(users).values({
      email: OWNER_EMAIL,
      passwordHash,
      name: "Sudhakar Bhambade",
      role: "owner",
      title: "Graphic Designer / Identity & Production Specialist",
      bio: "Graphic designer and production artist producing brand rollouts for digital, out-of-home, point of sale and packaging.",
    });
  }

  await db.delete(users).where(ne(users.email, OWNER_EMAIL));
  await db.delete(sessions);

  if (flag[0]) {
    await db.update(siteSettings).set({ value: AUTH_VERSION }).where(eq(siteSettings.key, "authVersion"));
  } else {
    await db.insert(siteSettings).values({ key: "authVersion", value: AUTH_VERSION, group: "system" });
  }
}

export function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed()
      .then(() => ensureCatalog())
      .then(() => ensureSingleOwner())
      .catch((error) => {
        seedPromise = null;
        throw error;
      });
  }
  return seedPromise;
}
