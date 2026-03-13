"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "motion/react";

/* ─── CDN ASSETS ─── */
const CDN = "https://cdn.prod.website-files.com/67f28d1d69b4c6d58d1cd1da";

const IMAGES = {
  heroModel: `${CDN}/68039fa1a0e0fa652a7bf2e6_EVER%20MODEL.avif`,
  heroBg: `${CDN}/68415b4f7bd03284c234c368_Ever-Beauty-in-Every-detail-Home-Page-Main-Header.avif`,
  texture1: `${CDN}/67fc99648e532fe1d1c1dbbb_EVER%20textureArtboard%201.avif`,
  texture2: `${CDN}/67fc99642ea14342e387c3b6_EVER%20textureArtboard%202.avif`,
  texture3: `${CDN}/67fc9964ad82dcc3c1c1b803_EVER%20textureArtboard%203.avif`,
  texture4: `${CDN}/67fc99642ea14342e387c395_EVER%20textureArtboard%204.avif`,
  texture5: `${CDN}/67fc9963ec1abbe58913940b_EVER%20textureArtboard%205.avif`,
  texture6: `${CDN}/67fc99641af666a7c4c891cb_EVER%20textureArtboard%206.avif`,
  serviceLash: `${CDN}/68092b90ba9824ac1fa312d8_Homepage%204%20sub%20brands%201%20lash-01.avif`,
  serviceBrow: `${CDN}/68092b91a096d664273c7dbb_Homepage%204%20sub%20brands%202%20brow-03.avif`,
  serviceNails: `${CDN}/68092b90878debf5a19df031_Homepage%204%20sub%20brands%203%20nails-05.avif`,
  serviceWax: `${CDN}/68092b9616b179405339e6e5_Homepage%204%20sub%20brands%204%20wax-07.avif`,
  serviceSpmu: `${CDN}/68092b90d0c264fb1d93e744_Homepage%204%20sub%20brands%205%20spmu-09.avif`,
  serviceBody: `${CDN}/68092b90de9ad3a3d272cb97_Homepage%204%20sub%20brands%206%20body-11.avif`,
  serviceHouse: `${CDN}/68092b900fbd0c2d76c3cabb_Homepage%204%20sub%20brands%207%20house-13.avif`,
  logoEverlash: `${CDN}/68dcc1fe813371e19577851a_LOGO_everlash%20white.png`,
  logoEverbrow: `${CDN}/68dcc1fe83a5dcfaa99ad604_LOGO_everbrow%20white.png`,
  logoEvernails: `${CDN}/68dcc1feb918f902d60f0dba_LOGO_evernails%20white.png`,
  logoEverwax: `${CDN}/68dcc1fe66ede1a6313c3a72_LOGO_everwax%20white.png`,
  logoEverspmu: `${CDN}/68dcc1fe2f30870578ab2417_LOGO_ever%20spmu%20white.png`,
  logoEverbody: `${CDN}/68dcc1fef60130dc3075d511_LOGO_everbody%20white.png`,
  logoEverhouse: `${CDN}/68dcc1fe5e4b5e8c0aa27a45_LOGO_everhouse%20white.png`,
  ctaBg: `${CDN}/680a05f1151954a6decd8b99_Homepage%207%20CTA-02.avif`,
  landscape1: `${CDN}/680f8fc9c7d50b5964c6a1d6_Homepage%202%20sub%20brands%20landscape-01.avif`,
  landscape2: `${CDN}/680ef52a6fd30b4b5834ff11_Homepage%202%20sub%20brands-02.avif`,
  landscape3: `${CDN}/680f8fc98619cec721bb7be0_Homepage%202%20sub%20brands%20landscape-02.avif`,
  landscape4: `${CDN}/680f8fc9f231182fa56d8bb8_Homepage%202%20sub%20brands%20landscape-03.avif`,
  landscape5: `${CDN}/680f8fc98572a00d8f060613_Homepage%202%20sub%20brands%20landscape-04.avif`,
  landscape6: `${CDN}/680f8fc98572a00d8f06062a_Homepage%202%20sub%20brands%20landscape-05.avif`,
};

const VIDEO = {
  services: "https://cdn.prod.website-files.com/67f28d1d69b4c6d58d1cd1da%2F680efbd4b4c3114f43179289_Homepage%209%20personalized%20services%201%20%281%29-transcode.mp4",
  hero: "https://cdn.prod.website-files.com/67f28d1d69b4c6d58d1cd1da%2F68353260ec4b1d80f6259cdd_Home-page-Beauty-in-every-detail-transcode.mp4",
};

/* ─── GSAP-MATCHING EASING CURVES ─── */
// power1.out ≈ cubic-bezier(0.25, 0.46, 0.45, 0.94)
// power2.out ≈ cubic-bezier(0.22, 0.61, 0.36, 1)
// power4.inOut ≈ cubic-bezier(0.76, 0, 0.24, 1)
// circ.out ≈ cubic-bezier(0, 0.55, 0.45, 1)
const EASE = {
  power1Out: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  power2Out: [0.22, 0.61, 0.36, 1] as [number, number, number, number],
  power4InOut: [0.76, 0, 0.24, 1] as [number, number, number, number],
  circOut: [0, 0.55, 0.45, 1] as [number, number, number, number],
};

/* ─── ANIMATION COMPONENTS (matching GSAP SplitType patterns) ─── */

// Char-by-char text reveal (matches data-gsap="par.4", "txt.7", "free.8")
function SplitText({ children, className, style, as: Tag = "span", delay = 0, staggerAmount = 0.8, duration = 0.2 }: {
  children: string;
  className?: string;
  style?: React.CSSProperties;
  as?: "span" | "h1" | "h2" | "p" | "div";
  delay?: number;
  staggerAmount?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20% 0px" }); // matches ScrollTrigger start: "top 80%"
  const chars = useMemo(() => children.split(""), [children]);
  const perChar = chars.length > 0 ? staggerAmount / chars.length : 0;

  return (
    // @ts-expect-error - dynamic tag
    <Tag ref={ref} className={className} style={style}>
      {chars.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration, delay: delay + i * perChar, ease: EASE.power1Out }}
          style={{ display: "inline-block", whiteSpace: char === " " ? "pre" : undefined }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </Tag>
  );
}

// Line-by-line slide from left (matches data-gsap="par.2" lines: x:-50→0, stagger 0.15)
function SlideLines({ children, className, delay = 0 }: {
  children: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20% 0px" });
  const lines = children.split("\n");

  return (
    <p ref={ref} className={className}>
      {lines.map((line, i) => (
        <motion.span
          key={i}
          className="block"
          initial={{ x: -50, opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 1 } : { x: -50, opacity: 0 }}
          transition={{ duration: 1, delay: delay + i * 0.15, ease: EASE.power2Out }}
        >
          {line}
        </motion.span>
      ))}
    </p>
  );
}

// Button with matching hover effect (scale + bg transition)
function AnimButton({ href, children, variant = "primary" }: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20% 0px" });

  return (
    <motion.a
      ref={ref}
      href={href}
      initial={{ opacity: 0, y: 15 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
      transition={{ duration: 0.6, ease: EASE.power1Out }}
      whileHover={{ scale: 1.02, backgroundColor: variant === "primary" ? "#9B764E" : "rgba(255,255,255,1)", color: variant === "primary" ? "#F9F6F1" : "#7A6047" }}
      whileTap={{ scale: 0.98 }}
      className={`inline-block border border-[#F9F6F1] bg-[#F9F6F1] text-[#9B764E] text-base px-6 py-3 transition-colors duration-300 ${variant === "secondary" ? "bg-transparent text-white border-white hover:bg-white hover:text-[#7A6047]" : ""}`}
    >
      {children}
    </motion.a>
  );
}

/* ─── DATA ─── */
const galleryBrands = [
  { name: "EVERHOUSE", img: IMAGES.serviceHouse, logo: IMAGES.logoEverhouse },
  { name: "EVERLASH", img: IMAGES.serviceLash, logo: IMAGES.logoEverlash },
  { name: "EVERBROW", img: IMAGES.serviceBrow, logo: IMAGES.logoEverbrow },
  { name: "EVERNAILS", img: IMAGES.serviceNails, logo: IMAGES.logoEvernails },
  { name: "EVERWAX", img: IMAGES.serviceWax, logo: IMAGES.logoEverwax },
  { name: "EVERSPMU", img: IMAGES.serviceSpmu, logo: IMAGES.logoEverspmu },
  { name: "EVERBODY", img: IMAGES.serviceBody, logo: IMAGES.logoEverbody },
];

const textures = [
  { img: IMAGES.texture1, pos: "top-0 left-0", size: "w-[18%] aspect-[2/3]" },
  { img: IMAGES.texture2, pos: "top-[5%] left-[22%]", size: "w-[15%] aspect-square" },
  { img: IMAGES.texture3, pos: "top-[10%] right-[20%]", size: "w-[14%] aspect-[3/4]" },
  { img: IMAGES.texture4, pos: "top-0 right-0", size: "w-[18%] aspect-[2/3]" },
  { img: IMAGES.texture5, pos: "bottom-0 left-[8%]", size: "w-[16%] aspect-[3/4]" },
  { img: IMAGES.texture6, pos: "bottom-[5%] right-[8%]", size: "w-[16%] aspect-[2/3]" },
];

const faqItems = [
  {
    question: "WHAT TYPE OF PAYMENT IS ACCEPTED?",
    answer: "We accept all kinds of payments, but we do prefer cashless for smoother and faster transactions.",
  },
  {
    question: "WHERE IS EVER HOUSE LOCATED? WHAT ARE THE OPENING HOURS?",
    answer: "Please refer to our location page to see each salon's operational hours.",
  },
  {
    question: "WHY DO SOME PEOPLE SAY HAVING TREATMENTS AT EVER IS MORE EXPENSIVE?",
    answer: "a. We do not take shortcuts in our service: We trained all of our lash therapists extensively to ensure proper lash application.\n\nb. We do not take shortcuts in our products: we use the best products that are safe for you.\n\nc. We take pride in giving you a comfortable treatment with private rooms, sanitized tools, and disposable sheets.",
  },
  {
    question: "IT IS MY FIRST TIME AT EVER, WHAT INFORMATION SHOULD I KNOW?",
    answer: "There are two types of therapists with slightly different price points: Technicians and Stylists. We also offer Patch Tests for testing allergic reactions, and weekly retouch prices for eyelash extension infills.",
  },
  {
    question: "HOW CAN I SHORTEN MY TREATMENT TIME?",
    answer: "i.) Come with a clean face, makeup-free.\nii.) Have an idea of what you like/don't like. Bring or show us reference photos.\niii.) Minimize interruptions during treatment.",
  },
  {
    question: "WHAT DETERMINES HOW LONG THE TREATMENT TIME?",
    answer: "The quality and quantity of your natural lash, fluttering eyes, interruptions, and the type of treatment you choose all affect duration.",
  },
];

/* ─── DOT DATA ─── */
const modelDots = [
  { id: 1, label: "01", top: "38%", left: "52%", brand: "EVERLASH", logo: IMAGES.logoEverlash, img: IMAGES.landscape1, description: "Premium lash extensions crafted to enhance your natural beauty with meticulous precision.", treatments: ["Classic Lash Extension", "Volume Lash Extension", "Keratiné Filler Lift"] },
  { id: 2, label: "02", top: "22%", left: "70%", brand: "EVERBROW", logo: IMAGES.logoEverbrow, img: IMAGES.landscape2, description: "Expert brow shaping and treatments designed to frame your face with effortless elegance.", treatments: ["Brow Bomber", "Brow & Face Threading", "Brow Tinting"] },
  { id: 3, label: "03", top: "15%", left: "45%", brand: "EVERSPMU", logo: IMAGES.logoEverspmu, img: IMAGES.landscape5, description: "Semi-permanent makeup artistry for flawless, long-lasting beauty that looks naturally you.", treatments: ["Lip Blush", "Ombre Brows", "Eyeliner SPMU"] },
  { id: 4, label: "04", top: "48%", left: "35%", brand: "EVERNAILS", logo: IMAGES.logoEvernails, img: IMAGES.landscape3, description: "Nail artistry and care treatments that celebrate creativity and attention to detail.", treatments: ["Manicure", "Pedicure", "Nail Art"] },
  { id: 5, label: "05", top: "62%", left: "72%", brand: "EVERSPMU", logo: IMAGES.logoEverspmu, img: IMAGES.landscape5, description: "Lips blush and semi-permanent techniques for a subtle, natural enhancement that lasts.", treatments: ["Lip Blush", "Lip Neutralization", "Lip Contouring"] },
  { id: 6, label: "06", top: "70%", left: "90%", brand: "EVERBODY", logo: IMAGES.logoEverbody, img: IMAGES.landscape6, description: "Full-body treatments designed to rejuvenate, relax, and restore your natural radiance.", treatments: ["Body Waxing", "Body Scrub", "Body Treatment"] },
];

/* ─── PAGE ─── */
export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showPreloader, setShowPreloader] = useState(true);
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [activeDot, setActiveDot] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  // Preloader with counter animation (matches original's GSAP counter 0→100)
  useEffect(() => {
    const duration = 2500;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      // Custom ease matching original: exponential-like curve
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setLoaderProgress(Math.round(eased * 100));
      if (t < 1) requestAnimationFrame(tick);
      else setTimeout(() => setShowPreloader(false), 300);
    };
    requestAnimationFrame(tick);
  }, []);

  return (
    <main className="relative">
      {/* ─── PRELOADER (matches original loader with counter + progress bar) ─── */}
      <AnimatePresence>
        {showPreloader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE.power2Out }}
            className="fixed inset-0 z-[60] bg-[#7A6047] flex flex-col items-center justify-center"
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: EASE.power2Out }}
              className="text-white text-3xl md:text-5xl tracking-[0.5em] font-light mb-8"
            >
              E V E R
            </motion.span>
            <div className="w-48 h-[1px] bg-white/20 relative overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-white"
                style={{ width: `${loaderProgress}%` }}
              />
            </div>
            <span className="text-white/60 text-xs mt-3 tabular-nums">{loaderProgress}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-[5%] h-[72px]">
        <button onClick={() => setMenuOpen(!menuOpen)} className="relative z-50 w-12 h-12 flex flex-col items-center justify-center gap-[6px] cursor-pointer" aria-label="menu">
          <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 7.5 : 0 }} transition={{ duration: 0.3 }} className="block w-6 h-[1.5px] bg-white" />
          <motion.span animate={{ opacity: menuOpen ? 0 : 1 }} transition={{ duration: 0.3 }} className="block w-6 h-[1.5px] bg-white" />
          <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -7.5 : 0 }} transition={{ duration: 0.3 }} className="block w-6 h-[1.5px] bg-white" />
        </button>
        <a href="/" className="absolute left-1/2 -translate-x-1/2 z-50">
          <span className="text-white text-base md:text-lg tracking-[0.3em] font-light uppercase">EVER</span>
        </a>
        <motion.a
          href="tel:+622150980398"
          className="hidden md:flex items-center gap-2 text-white text-base"
          whileHover={{ opacity: 0.7 }}
          transition={{ duration: 0.3 }}
        >
          MAKE AN APPOINTMENT
        </motion.a>
      </nav>

      {/* ─── FULLSCREEN MENU (char-by-char nav item reveal) ─── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 bg-[#7A6047] flex"
          >
            <div className="flex flex-col md:flex-row w-full h-full">
              <div className="flex-1 flex flex-col justify-center px-8 md:px-20 gap-4">
                {[
                  { label: "OUR STORY", href: "/about-us" },
                  { label: "JOURNAL", href: "/post" },
                  { label: "LOCATION", href: "/location" },
                  { label: "SERVICES", href: "/services" },
                  { label: "SCHEDULE VIA WHATSAPP", href: "https://api.whatsapp.com/send?phone=6281311888508&text=Halo%20Everlash%20saya%20mau%20Appointment" },
                  { label: "SCHEDULE VIA CALL", href: "tel:+622150980398" },
                ].map((item, i) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 1, delay: 0.1 + i * 0.05, ease: EASE.power2Out }}
                    whileHover={{ x: 10, color: "#9B764E" }}
                    className="text-white text-sm tracking-[0.15em] transition-colors"
                  >
                    / {item.label}
                  </motion.a>
                ))}
              </div>
              <div className="flex-1 flex flex-col justify-center px-8 md:px-20 gap-3">
                {[
                  { num: "001", name: "Lash Extension" }, { num: "002", name: "Keratiné Filler Lift" },
                  { num: "003", name: "Stem Cell Lash Regrowth" }, { num: "004", name: "Brow Bomber" },
                  { num: "005", name: "Brow & Face Threading" }, { num: "006", name: "Manicure" },
                  { num: "007", name: "Nail Art" }, { num: "008", name: "Pedicure" },
                  { num: "009", name: "Waxing" }, { num: "010", name: "Semi Permanent Make Up" },
                  { num: "011", name: "Everbody" },
                ].map((s, i) => (
                  <motion.a
                    key={s.num}
                    href="#"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, delay: 0.15 + i * 0.03, ease: EASE.power4InOut }}
                    whileHover={{ x: 8, color: "#9B764E" }}
                    className="flex items-center gap-3 text-white transition-colors"
                  >
                    <span className="text-xs opacity-60">{s.num}</span>
                    <span className="text-lg font-light tracking-wide">{s.name}</span>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ SECTION 1: HERO (sticky content wrapper matching original) ═══ */}
      <div ref={heroRef} className="relative">
        <motion.section style={{ opacity: heroOpacity }} className="sticky top-0 h-screen overflow-hidden">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover"
            style={{ backgroundImage: `url(${IMAGES.heroBg})`, backgroundPosition: "50% 33%" }}
          />
          {/* Content wrapper */}
          <div className="relative z-[2] flex items-center justify-center h-full px-[5%]">
            <div className="text-center w-full">
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={showPreloader ? { opacity: 0, y: 40 } : { opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: EASE.power2Out }}
                className="text-5xl md:text-8xl lg:text-[125px] font-medium leading-[1] text-white"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                beauty in every detail
              </motion.h1>
            </div>
          </div>
          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={showPreloader ? { opacity: 0 } : { opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="absolute bottom-[5%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          >
            <span className="text-sm font-medium uppercase text-white">Scroll to explore</span>
            <div className="animate-bounce-slow">
              <svg width="16" height="24" viewBox="0 0 16 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M8 0v20M1 14l7 7 7-7" /></svg>
            </div>
          </motion.div>
        </motion.section>
        {/* Spacer with gradient transition into next section */}
        <div className="h-[5vh] relative z-10 bg-[#7A6047]" />
      </div>

      {/* ═══ SECTION 2: QUOTE (char-by-char reveal + scroll-triggered shading) ═══ */}
      <section className="relative min-h-screen flex items-center justify-center bg-[#7A6047] overflow-hidden">
        {/* Shading overlay that fades in on scroll — uses same brown family */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 1.2, ease: EASE.power2Out }}
          className="absolute inset-0 z-0"
          style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(60,45,30,0.4) 0%, rgba(60,45,30,0.15) 50%, transparent 80%)" }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <SplitText
            as="h2"
            className="text-2xl md:text-[40px] leading-[48px] text-white font-medium drop-shadow-[0_2px_12px_rgba(0,0,0,0.3)]"
            style={{ fontFamily: "var(--font-serif)" }}
            staggerAmount={1.2}
            duration={0.15}
          >
            {"\u201C Your beauty is celebrated through every precise touch. \u201D"}
          </SplitText>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 0.8, delay: 1.4, ease: EASE.power1Out }}
            className="mt-6 block tracking-[0.3em] text-lg md:text-xl font-light text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            EVER
          </motion.span>
        </div>
      </section>

      {/* ═══ SECTION 3: SUB-BRAND GALLERY (img.1 fade-in + grab cursor) ═══ */}
      <section className="py-8 md:py-12 bg-[#7A6047]">
        <div className="flex gap-4 overflow-x-auto px-6 md:px-12 hide-scrollbar pb-4 cursor-grab active:cursor-grabbing">
          {galleryBrands.map((brand, i) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 1, delay: i * 0.08, ease: "easeOut" }}
              className="flex-shrink-0 w-[220px] md:w-[280px] group cursor-pointer"
            >
              <div className="relative overflow-hidden aspect-square">
                <motion.img
                  src={brand.img}
                  alt={brand.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.7 }}
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-500" />
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <motion.img
                    src={brand.logo}
                    alt={brand.name}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 + i * 0.08, ease: EASE.power1Out }}
                    className="w-[70%] h-auto object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 4: "THE ART OF UNDERSTATED BEAUTY" (img.4 fade + txt.7 char reveal) ═══ */}
      <section className="relative min-h-screen flex items-center bg-[#7A6047] overflow-hidden py-24 md:py-28">
        {/* Scattered texture images — img.4 pattern: opacity 0→1, 1s, ease */}
        {textures.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 1, delay: i * 0.2, ease: "easeOut" }}
            className={`absolute ${t.pos} ${t.size} overflow-hidden hidden md:block`}
          >
            <img src={t.img} alt="" className="w-full h-full object-cover" loading="lazy" />
          </motion.div>
        ))}

        {/* Centered heading — txt.7: char-by-char with power4.inOut */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <SplitText
            as="h2"
            className="text-5xl md:text-7xl lg:text-[80px] font-light leading-[1.2] text-white tracking-wide"
            style={{ fontFamily: "var(--font-serif)" }}
            staggerAmount={1.0}
            duration={0.3}
          >
            the art of Understated Beauty
          </SplitText>
        </div>
      </section>

      {/* ═══ SECTION 5: MARQUEE + INTERACTIVE MODEL IMAGE ═══ */}
      <section className="relative min-h-screen bg-[#7A6047] overflow-hidden">
        {/* Marquee text behind */}
        <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none">
          <div className="flex animate-marquee whitespace-nowrap">
            {Array.from({ length: 15 }).map((_, i) => (
              <span key={i} className="text-white/[0.06] text-[100px] md:text-[160px] lg:text-[200px] font-light uppercase tracking-wider mx-4">
                BEAUTY IN EVER DETAILS
              </span>
            ))}
          </div>
        </div>

        {/* Model image with interactive dots */}
        <div className="relative z-10 h-full">
          <div className="flex items-center justify-center min-h-screen">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: EASE.power2Out }}
              className="relative h-screen"
            >
              <img src={IMAGES.heroModel} alt="EVER Model - All Services" className="h-full w-auto object-cover" loading="lazy" />

              {/* Interactive dots */}
              {modelDots.map((dot, i) => (
                <motion.button
                  key={dot.id}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.1, ease: EASE.circOut }}
                  onClick={() => setActiveDot(activeDot === dot.id ? null : dot.id)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  className={`absolute w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-300 animate-pulse-dot ${
                    activeDot === dot.id
                      ? "bg-white/40 backdrop-blur-md ring-2 ring-white"
                      : "bg-black/30 backdrop-blur-sm hover:bg-black/40"
                  }`}
                  style={{ top: dot.top, left: dot.left, transform: "translate(-50%, -50%)" }}
                  aria-label={`${dot.label} - ${dot.brand}`}
                >
                  <span className="text-white text-[10px] md:text-xs font-medium tracking-wide">{dot.label}</span>
                </motion.button>
              ))}
            </motion.div>
          </div>

          {/* Detail card */}
          <AnimatePresence mode="wait">
            {activeDot !== null && (() => {
              const dot = modelDots.find((d) => d.id === activeDot)!;
              return (
                <motion.div
                  key={dot.id}
                  initial={{ opacity: 0, y: 20, x: -10 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.4, ease: EASE.power2Out }}
                  className="absolute bottom-8 left-6 md:left-12 z-20 bg-[#6B5340]/90 backdrop-blur-md border border-white/10 p-5 md:p-6 max-w-sm w-full"
                >
                  <div className="flex gap-4 mb-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 overflow-hidden"
                    >
                      <img src={dot.img} alt={dot.brand} className="w-full h-full object-cover" />
                    </motion.div>
                    <div>
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="text-white/50 text-xs">{dot.label}</motion.span>
                      <motion.h3 initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ease: EASE.power1Out }} className="text-white text-lg md:text-xl tracking-[0.15em] font-light">{dot.brand}</motion.h3>
                    </div>
                  </div>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-white/70 text-xs leading-relaxed mb-4">{dot.description}</motion.p>
                  <div>
                    <span className="text-white/50 text-[10px] uppercase tracking-[0.15em]">Treatments</span>
                    <div className="flex flex-col gap-1 mt-1">
                      {dot.treatments.map((t, ti) => (
                        <motion.a
                          key={t}
                          href="/services"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.35 + ti * 0.05, ease: EASE.power1Out }}
                          whileHover={{ x: 4, color: "#ffffff" }}
                          className="text-white/80 text-xs flex items-center gap-2 transition-colors"
                        >
                          <span className="w-1 h-1 bg-white/40 rounded-full" />
                          {t}
                        </motion.a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </section>

      {/* ═══ SECTION 6: PERSONALISED SERVICES (par.2 line slide + btn.3 reveal) ═══ */}
      <section className="relative bg-[#7A6047] py-20 md:py-28 overflow-hidden">
        {/* Marquee behind */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 overflow-hidden pointer-events-none">
          <div className="flex animate-marquee whitespace-nowrap">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="text-white/[0.04] text-[80px] md:text-[120px] font-light uppercase tracking-wider mx-4">
                BEAUTY IN EVER DETAILS
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-[5%]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <SlideLines className="text-sm uppercase tracking-[0.2em] text-white/70 mb-4">
                ENDLESS POSSIBILITY WITH
              </SlideLines>
              <SplitText
                as="h2"
                className="text-4xl md:text-6xl lg:text-[80px] font-light uppercase leading-[1.2] text-white mb-6"
                staggerAmount={0.6}
                duration={0.3}
              >
                PERSONALISED SERVICES
              </SplitText>
              <SlideLines className="text-sm text-white/70 mb-8 max-w-md leading-relaxed" delay={0.3}>
                {"At EVER, no detail is overlooked. Each service is\ncarefully crafted to complement your natural features\n\u2014 because true beauty is personal."}
              </SlideLines>
              <AnimButton href="/services">CHECK ALL SERVICES</AnimButton>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-20% 0px" }}
              transition={{ duration: 1, ease: EASE.power2Out }}
              className="relative aspect-[4/5] overflow-hidden"
            >
              <video autoPlay muted loop playsInline className="w-full h-full object-cover">
                <source src={VIDEO.services} type="video/mp4" />
              </video>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 8: "YOUR MOMENT OF GLOW BEGINS HERE" ═══ */}
      <section className="relative min-h-screen bg-[#7A6047] flex flex-col items-center justify-center py-24 md:py-28">
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <SplitText
            as="h2"
            className="text-2xl md:text-[32px] font-light uppercase leading-[1.2] text-white mb-12"
            staggerAmount={0.8}
          >
            Your Moment of Glow Begins Here
          </SplitText>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 1, ease: EASE.power2Out }}
            className="w-[285px] aspect-[285/360] mx-auto mb-12 overflow-hidden"
          >
            <img src={IMAGES.ctaBg} alt="" className="w-full h-full object-cover" loading="lazy" />
          </motion.div>
          <SlideLines className="text-sm md:text-base text-white/70 mb-10 max-w-xl mx-auto leading-relaxed" delay={0.5}>
            {"Let\u2019s make this about you. A quiet moment for thoughtful\ntreatments designed to restore balance and highlight your\nnatural charm. Because feeling good starts here."}
          </SlideLines>
          <AnimButton href="/location">FIND US</AnimButton>
        </div>
      </section>

      {/* ═══ SECTION 9: FAQ (free.8 heading + par.4 question reveals) ═══ */}
      <section className="py-20 md:py-28 bg-[#7A6047]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-[5%]">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20">
            <div>
              <SplitText
                as="h2"
                className="text-3xl md:text-[48px] font-bold text-white mb-4 leading-[1.2]"
                style={{ fontFamily: "var(--font-serif)" }}
                staggerAmount={0.6}
              >
                Frequently Asked Questions
              </SplitText>
              <SlideLines className="text-base md:text-lg text-white/60 mb-6 leading-[1.5]" delay={0.4}>
                {"Didn\u2019t find the answer to your question?\nSend it to us by chat. We will be happy to answer you."}
              </SlideLines>
              <AnimButton href="https://api.whatsapp.com/send?phone=6281311888508&text=Halo%20EVER%20saya%20mau%20bertanya">
                Contact
              </AnimButton>
            </div>
            <div className="flex flex-col">
              {faqItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20% 0px" }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: EASE.circOut }}
                  className="border-t border-white/20"
                >
                  <motion.button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between py-5 md:py-6 text-left cursor-pointer"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-base md:text-lg tracking-[0.1em] text-white/90 uppercase pr-4">{item.question}</span>
                    <motion.svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="1.5"
                      className="flex-shrink-0"
                      animate={{ rotate: openFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </motion.svg>
                  </motion.button>
                  <div className={`faq-content ${openFaq === i ? "open" : ""}`}>
                    <p className="text-base md:text-lg text-white/60 pb-6 leading-[1.5] whitespace-pre-line">{item.answer}</p>
                  </div>
                </motion.div>
              ))}
              <div className="border-t border-white/20" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-[#7A6047] py-12 md:py-16 border-t border-white/10">
        <div className="max-w-[1280px] mx-auto px-6 md:px-[5%]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            <div>
              <p className="text-xs tracking-[0.15em] text-white/50 mb-4 uppercase">Company</p>
              <div className="flex flex-col gap-2">
                {[{ label: "HOME", href: "/" }, { label: "OUR STORY", href: "/about-us" }, { label: "JOURNAL", href: "/post" }, { label: "SERVICE", href: "/services" }, { label: "LOCATIONS", href: "/location" }].map((link) => (
                  <motion.a key={link.label} href={link.href} className="text-xs text-white/70 tracking-[0.1em]" whileHover={{ color: "#ffffff", x: 3 }} transition={{ duration: 0.3 }}>{link.label}</motion.a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs tracking-[0.15em] text-white/50 mb-4 uppercase">Contact</p>
              <div className="flex flex-col gap-2">
                <motion.a href="https://api.whatsapp.com/send?phone=6281311888508&text=Halo%20Everlash%20saya%20mau%20Appointment" className="text-xs text-white/70 tracking-[0.1em]" whileHover={{ color: "#ffffff", x: 3 }} transition={{ duration: 0.3 }}>SCHEDULE AN APPOINTMENT</motion.a>
                <motion.a href="tel:+622150980398" className="text-xs text-white/70 tracking-[0.1em]" whileHover={{ color: "#ffffff", x: 3 }} transition={{ duration: 0.3 }}>CHAT WITH CONSULTANT</motion.a>
              </div>
            </div>
            <div>
              <p className="text-xs tracking-[0.15em] text-white/50 mb-4 uppercase">Follow Us</p>
              <div className="flex gap-4">
                <motion.a href="https://www.facebook.com/everlash.id" target="_blank" rel="noopener noreferrer" className="text-white/70" aria-label="Facebook" whileHover={{ color: "#ffffff", scale: 1.1 }} transition={{ duration: 0.3 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </motion.a>
                <motion.a href="https://www.instagram.com/everlash_lash_expert/" target="_blank" rel="noopener noreferrer" className="text-white/70" aria-label="Instagram" whileHover={{ color: "#ffffff", scale: 1.1 }} transition={{ duration: 0.3 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                </motion.a>
              </div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="mb-8"
          >
            <span className="text-white text-5xl md:text-7xl tracking-[0.4em] font-light">EVER</span>
          </motion.div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-6 border-t border-white/10">
            <p className="text-xs text-white/40">&copy; 2025 LIT GROUP INDONESIA. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="text-xs text-white/40 hover:text-white/60 transition-colors">Privacy Policy</a>
              <a href="#" className="text-xs text-white/40 hover:text-white/60 transition-colors">Terms of Service</a>
              <a href="#" className="text-xs text-white/40 hover:text-white/60 transition-colors">Cookies Settings</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══ SECTION 10: FINAL CTA (btn.7 reveal) ═══ */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src={VIDEO.hero} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE.power1Out }}
          className="relative z-10 text-center"
        >
          <motion.a
            href="/services"
            className="text-white text-base tracking-normal"
            whileHover={{ opacity: 0.7 }}
            transition={{ duration: 0.3 }}
          >
            Explore Every Detail of EVER
          </motion.a>
        </motion.div>
      </section>
    </main>
  );
}
