"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "motion/react";

/* ─── ASSETS ─── */
const IMAGES = {
  heroModel: "/images/hero-model.png",
  heroBg: "/images/hero-bg.png",
  serviceLash: "/images/service-lash.png",
  serviceBrow: "/images/service-brow.png",
  serviceNails: "/images/service-nails.png",
  serviceWax: "/images/service-wax.png",
  serviceSpmu: "/images/service-spmu.png",
  serviceBody: "/images/service-body.png",
  serviceHouse: "/images/service-house.png",
  landscape1: "/images/landscape-1.png",
  landscape2: "/images/landscape-2.png",
  landscape3: "/images/landscape-3.png",
  landscape4: "/images/landscape-4.png",
  landscape5: "/images/landscape-5.png",
  landscape6: "/images/landscape-6.png",
};

const VIDEO = {
  services: "https://cdn.prod.website-files.com/67f28d1d69b4c6d58d1cd1da%2F680efbd4b4c3114f43179289_Homepage%209%20personalized%20services%201%20%281%29-transcode.mp4",
};

/* ─── EASING CURVES ─── */
const EASE = {
  power1Out: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  power2Out: [0.22, 0.61, 0.36, 1] as [number, number, number, number],
  power4InOut: [0.76, 0, 0.24, 1] as [number, number, number, number],
  circOut: [0, 0.55, 0.45, 1] as [number, number, number, number],
};

/* ─── ANIMATION COMPONENTS ─── */

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
  const isInView = useInView(ref, { once: true, margin: "-20% 0px" });

  return (
    // @ts-expect-error - dynamic tag
    <Tag ref={ref} className={className} style={style}>
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: staggerAmount, delay, ease: EASE.power1Out }}
      >
        {children}
      </motion.span>
    </Tag>
  );
}

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
      whileHover={{ scale: 1.02, backgroundColor: variant === "primary" ? "transparent" : "#6AADCF", color: variant === "primary" ? "#6AADCF" : "#ffffff" }}
      whileTap={{ scale: 0.98 }}
      className={`inline-block border border-[#6AADCF] px-6 py-3 text-base transition-colors duration-300 ${
        variant === "primary"
          ? "bg-[#6AADCF] text-white"
          : "bg-transparent text-[#2C2C2C] border-[#2C2C2C]/20 hover:bg-[#6AADCF] hover:text-white hover:border-[#6AADCF]"
      }`}
    >
      {children}
    </motion.a>
  );
}

/* ─── FLICKITY-STYLE GALLERY (EVER-style arc slider, infinite loop) ─── */
const CARD_WIDTH = 380;
const CARD_GAP = 40;
const CARD_STEP = CARD_WIDTH + CARD_GAP;

const AUTO_SPEED = 0.5; // px per frame (~30px/s)

function GallerySection() {
  const [scrollX, setScrollX] = useState(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);
  const velocity = useRef(0);
  const lastX = useRef(0);
  const rafId = useRef(0);
  const autoRafId = useRef(0);
  const isMomentum = useRef(false);
  const count = galleryBrands.length;
  const totalWidth = count * CARD_STEP;

  // Auto-scroll: runs when not dragging and no momentum
  useEffect(() => {
    const tick = () => {
      if (!isDragging.current && !isMomentum.current) {
        setScrollX((prev) => prev - AUTO_SPEED);
      }
      autoRafId.current = requestAnimationFrame(tick);
    };
    autoRafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(autoRafId.current);
  }, []);

  // Wrap scrollX into [0, totalWidth) for infinite loop
  const wrap = (v: number) => ((v % totalWidth) + totalWidth) % totalWidth;

  const decelerate = useCallback(() => {
    if (Math.abs(velocity.current) < 0.5) {
      isMomentum.current = false;
      return;
    }
    velocity.current *= 0.95;
    setScrollX((prev) => prev + velocity.current);
    rafId.current = requestAnimationFrame(decelerate);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartScroll.current = scrollX;
    lastX.current = e.clientX;
    velocity.current = 0;
    cancelAnimationFrame(rafId.current);
    (e.target as HTMLElement).closest("[data-gallery-track]")?.setPointerCapture(e.pointerId);
  }, [scrollX]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStartX.current;
    velocity.current = e.clientX - lastX.current;
    lastX.current = e.clientX;
    setScrollX(dragStartScroll.current + dx);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    isMomentum.current = true;
    rafId.current = requestAnimationFrame(decelerate);
  }, [decelerate]);

  // For each card, compute its wrapped screen position + arc transforms
  const getCardProps = (index: number) => {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1400;
    const wrapped = wrap(scrollX);
    // Base position if scrollX were 0
    let x = index * CARD_STEP + wrapped;
    // Wrap individual card so it always appears in the visible band
    x = ((x % totalWidth) + totalWidth) % totalWidth;
    // Shift so cards distribute around center (some left, some right)
    if (x > totalWidth - vw / 2) x -= totalWidth;

    const cardCenter = x + CARD_WIDTH / 2;
    const distFromCenter = (cardCenter - vw / 2) / (vw / 2);
    const rotate = distFromCenter * 5;
    const translateY = distFromCenter * 15;
    const imgTranslateX = distFromCenter * -12;
    // Hide cards far off-screen
    const visible = x > -CARD_WIDTH - 100 && x < vw + 100;

    return { x, rotate, translateY, imgTranslateX, visible };
  };

  return (
    <section className="py-48 md:py-72 overflow-hidden" aria-label="บริการของเรา">
      <div className="max-w-[1280px] mx-auto px-6 md:px-[5%] mb-10">
        <SplitText
          as="h2"
          className="text-2xl md:text-4xl lg:text-5xl font-light text-[#2C2C2C] tracking-wide"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          staggerAmount={0.8}
          duration={0.2}
        >
          บริการทั้งหมดของเรา
        </SplitText>
        <SlideLines className="text-sm md:text-base text-[#8A8A8A] mt-3 leading-relaxed" delay={0.3}>
          ค้นพบบริการความงามครบวงจร ตั้งแต่ยกกระชับ ฟิลเลอร์ เลเซอร์ ไปจนถึงทรีตเมนต์ดูแลผิว
        </SlideLines>
      </div>
      <div
        data-gallery-track
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative h-[420px] md:h-[560px] select-none cursor-grab active:cursor-grabbing"
        style={{ touchAction: "pan-y" }}
      >
        {galleryBrands.map((brand, i) => {
          const { x, rotate, translateY, imgTranslateX, visible } = getCardProps(i);
          if (!visible) return null;
          return (
            <div
              key={brand.name}
              className="absolute top-1/2 group"
              style={{
                width: CARD_WIDTH,
                left: 0,
                transform: `translate3d(${x}px, calc(-50% + ${translateY}%), 0) rotate(${rotate}deg)`,
                transition: isDragging.current ? "none" : "transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1)",
              }}
            >
              <div className="relative w-full h-[360px] md:h-[480px] overflow-hidden rounded-sm shadow-xl">
                <img
                  src={brand.img}
                  alt={brand.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  draggable={false}
                  style={{
                    transform: `translateX(${imgTranslateX}%)`,
                    transition: isDragging.current ? "none" : "transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1)",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <span
                    className="text-white text-2xl md:text-3xl font-light tracking-[0.25em] uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    {brand.logo}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}


/* ─── DATA ─── */
const LOGO_NAMES = {
  house: "SIAM HOUSE",
  lash: "SIAM LASH",
  brow: "SIAM BROW",
  nails: "SIAM NAILS",
  wax: "SIAM WAX",
  spmu: "SIAM SPMU",
  body: "SIAM BODY",
};

const galleryBrands = [
  { name: "กระชับผิว", img: IMAGES.serviceHouse, logo: LOGO_NAMES.house },
  { name: "ทรีตเมนต์", img: IMAGES.serviceLash, logo: LOGO_NAMES.lash },
  { name: "การฉีด", img: IMAGES.serviceBrow, logo: LOGO_NAMES.brow },
  { name: "คืนความอ่อนเยาว์", img: IMAGES.serviceNails, logo: LOGO_NAMES.nails },
  { name: "กำจัดขน", img: IMAGES.serviceWax, logo: LOGO_NAMES.wax },
  { name: "ปรับรูปร่าง", img: IMAGES.serviceSpmu, logo: LOGO_NAMES.spmu },
  { name: "ดูแลผิวหน้า", img: IMAGES.serviceBody, logo: LOGO_NAMES.body },
];

const faqItems = [
  {
    question: "รับชำระเงินประเภทใดบ้าง?",
    answer: "เรารับชำระเงินทุกรูปแบบ ทั้งเงินสด บัตรเครดิต และโอนผ่านธนาคาร",
  },
  {
    question: "สยาม บิวตี้ ตั้งอยู่ที่ไหน? เปิดกี่โมง?",
    answer: "เปิดให้บริการทุกวัน 10:00 - 20:00 น. กรุณาดูหน้าสาขาเพื่อรายละเอียดเพิ่มเติม",
  },
  {
    question: "ต้องจองคิวล่วงหน้าหรือไม่?",
    answer: "เราขอแนะนำให้จองคิวล่วงหน้าเพื่อความสะดวกในการรับบริการ สามารถจองผ่าน LINE หรือโทรศัพท์ได้",
  },
  {
    question: "มาครั้งแรกต้องเตรียมตัวอย่างไร?",
    answer: "มาด้วยหน้าสะอาดไม่แต่งหน้า เตรียมรูปอ้างอิงสิ่งที่ต้องการ และแพทย์จะให้คำปรึกษาก่อนเริ่มทำหัตถการ",
  },
  {
    question: "การทำเลเซอร์ปลอดภัยหรือไม่?",
    answer: "การทำเลเซอร์ที่ สยาม บิวตี้ ปลอดภัย โดยใช้เครื่องมือที่ได้รับมาตรฐานสากลและอยู่ภายใต้การควบคุมโดยทีมแพทย์",
  },
  {
    question: "มีบริการหลังการรักษาหรือไม่?",
    answer: "แน่นอน! หลังการรักษาเรามีการติดตามผลการรักษาเพื่อให้คุณได้รับผลลัพธ์ที่ดีที่สุด ทีมแพทย์ของเราจะดูแลคุณอย่างใกล้ชิด",
  },
];

const modelDots = [
  { id: 1, label: "01", top: "38%", left: "52%", brand: "ULTHERAPY", img: IMAGES.landscape1, description: "โปรแกรมยกกระชับผิวด้วยเทคโนโลยี Ultherapy ที่ได้รับการรับรองจาก FDA", treatments: ["Ultherapy SPT", "Ultherapy Prime", "O'lift (Oligio)"] },
  { id: 2, label: "02", top: "22%", left: "70%", brand: "FILLER", img: IMAGES.landscape2, description: "โปรแกรมฉีดฟิลเลอร์เติมเต็มทุกส่วนด้วยผลิตภัณฑ์ระดับพรีเมียม", treatments: ["ฟิลเลอร์ปาก", "ฟิลเลอร์จมูก", "ฟิลเลอร์คาง"] },
  { id: 3, label: "03", top: "15%", left: "45%", brand: "LASER", img: IMAGES.landscape5, description: "เลเซอร์ผิวพรรณด้วยเทคโนโลยีล่าสุด คืนความอ่อนเยาว์ให้ผิว", treatments: ["DUAL Bright Laser", "CO2 Laser", "Pico Laser"] },
  { id: 4, label: "04", top: "48%", left: "35%", brand: "TREATMENT", img: IMAGES.landscape3, description: "ทรีตเมนต์ดูแลผิวหน้าเพื่อผิวสวยใสไร้สิว", treatments: ["Aqua Deep", "Deep Cleansing", "Golden Treatment"] },
  { id: 5, label: "05", top: "62%", left: "72%", brand: "MORPHEUS 8", img: IMAGES.landscape5, description: "เทคโนโลยี Morpheus 8 กระชับผิวลดริ้วรอย ฟื้นฟูผิวจากภายใน", treatments: ["Morpheus 8 Face", "Morpheus 8 Body", "Morpheus 8 Eyes"] },
  { id: 6, label: "06", top: "70%", left: "90%", brand: "BODY", img: IMAGES.landscape6, description: "โปรแกรมปรับรูปร่างและกระชับสัดส่วนด้วยเทคโนโลยีระดับสากล", treatments: ["Coolsculpting ELITE", "Venus Legacy", "Tesla Former"] },
];

const NAV_LINKS = [
  { label: "เกี่ยวกับเรา", href: "/about-us" },
  { label: "บทความ", href: "/post" },
  { label: "สาขา", href: "/location" },
  { label: "บริการ", href: "/services" },
  { label: "นัดหมายผ่าน LINE", href: "https://line.me/ti/p/%40siambeauty" },
  { label: "นัดหมายทางโทรศัพท์", href: "tel:+6627149555" },
];

const SERVICE_LINKS = [
  { num: "001", name: "Ultherapy" }, { num: "002", name: "Thermage" },
  { num: "003", name: "Morpheus 8" }, { num: "004", name: "EndoliftX" },
  { num: "005", name: "ฟิลเลอร์" }, { num: "006", name: "Sculptra" },
  { num: "007", name: "Profhilo" }, { num: "008", name: "เลเซอร์ผิวพรรณ" },
  { num: "009", name: "กำจัดขน" }, { num: "010", name: "ปรับรูปร่าง" },
  { num: "011", name: "ทรีตเมนต์ผิวหน้า" },
];

/* ─── PAGE ─── */
export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showPreloader, setShowPreloader] = useState(true);
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [activeDot, setActiveDot] = useState<number | null>(null);
  const [bgColor, setBgColor] = useState("#F0EAE0");
  const heroRef = useRef<HTMLDivElement>(null);
  const gallerySectionRef = useRef<HTMLDivElement>(null);
  const modelSectionRef = useRef<HTMLElement>(null);
  const servicesSectionRef = useRef<HTMLElement>(null);
  const faqSectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Preloader — 1.5s duration with click-to-skip
  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setLoaderProgress(Math.round(eased * 100));
      if (t < 1) requestAnimationFrame(tick);
      else setTimeout(() => setShowPreloader(false), 300);
    };
    requestAnimationFrame(tick);
    return () => { cancelled = true; };
  }, []);

  // Escape key closes menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (menuOpen) closeMenu();
        if (activeDot !== null) setActiveDot(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen, activeDot, closeMenu]);

  // Scroll-driven background color transitions
  useEffect(() => {
    const colorMap: [React.RefObject<HTMLElement | HTMLDivElement | null>, string][] = [
      [gallerySectionRef, "#F0EAE0"],
      [modelSectionRef, "#F0EAE0"],
      [servicesSectionRef, "#FEFCF9"],
      [faqSectionRef, "#F0EAE0"],
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const match = colorMap.find(([ref]) => ref.current === entry.target);
            if (match) setBgColor(match[1]);
          }
        });
      },
      { threshold: 0.4 }
    );

    colorMap.forEach(([ref]) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  // Close detail card when clicking outside the model section
  useEffect(() => {
    if (activeDot === null) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-dot-button]") || target.closest("[data-detail-card]")) return;
      setActiveDot(null);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [activeDot]);

  return (
    <>
      {/* ─── SCROLL-DRIVEN BACKGROUND ─── */}
      <div
        className="fixed inset-0 -z-10 transition-colors duration-700 ease-in-out"
        style={{ backgroundColor: bgColor }}
      />

      {/* ─── PRELOADER ─── */}
      <AnimatePresence>
        {showPreloader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE.power2Out }}
            className="fixed inset-0 z-[60] bg-[#F0EAE0] flex flex-col items-center justify-center cursor-pointer"
            onClick={() => setShowPreloader(false)}
            role="status"
            aria-label="กำลังโหลด"
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: EASE.power2Out }}
              className="text-[#2C2C2C] text-3xl md:text-5xl tracking-[0.5em] font-light mb-8"
            >
              S I A M  B E A U T Y
            </motion.span>
            <div className="w-48 h-[1px] bg-[#6AADCF]/30 relative overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-[#6AADCF]"
                style={{ width: `${loaderProgress}%` }}
              />
            </div>
            <span className="text-[#6AADCF] text-xs mt-3 tabular-nums">{loaderProgress}</span>
            <span className="text-[#2C2C2C]/30 text-xs mt-6 tracking-wider">คลิกเพื่อข้าม</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── HEADER + NAVBAR ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#2C2C2C]/5">
        <nav className="flex items-center justify-between px-6 md:px-[5%] h-[72px]" aria-label="เมนูหลัก">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative z-50 w-12 h-12 flex flex-col items-center justify-center gap-[6px] cursor-pointer"
            aria-label={menuOpen ? "ปิดเมนู" : "เปิดเมนู"}
            aria-expanded={menuOpen}
          >
            <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 7.5 : 0 }} transition={{ duration: 0.3 }} className="block w-6 h-[1.5px] bg-[#2C2C2C]" />
            <motion.span animate={{ opacity: menuOpen ? 0 : 1 }} transition={{ duration: 0.3 }} className="block w-6 h-[1.5px] bg-[#2C2C2C]" />
            <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -7.5 : 0 }} transition={{ duration: 0.3 }} className="block w-6 h-[1.5px] bg-[#2C2C2C]" />
          </button>
          <a href="/" className="absolute left-1/2 -translate-x-1/2 z-50">
            <span className="text-[#2C2C2C] text-base md:text-lg tracking-[0.3em] font-light uppercase">SIAM BEAUTY</span>
          </a>
          <motion.a
            href="tel:+6627149555"
            className="flex items-center gap-2 text-[#2C2C2C] text-sm md:text-base px-3 py-2"
            whileHover={{ opacity: 0.7 }}
            transition={{ duration: 0.3 }}
          >
            นัดหมาย
          </motion.a>
        </nav>
      </header>

      {/* ─── FULLSCREEN MENU ─── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 bg-[#F0EAE0] overflow-y-auto"
            role="dialog"
            aria-label="เมนูนำทาง"
          >
            <div className="flex flex-col md:flex-row w-full min-h-full pt-[72px]">
              <div className="flex-1 flex flex-col justify-center px-8 md:px-20 gap-4 py-8">
                {NAV_LINKS.map((item, i) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    onClick={closeMenu}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 1, delay: 0.1 + i * 0.05, ease: EASE.power2Out }}
                    whileHover={{ x: 10, color: "#6AADCF" }}
                    className="text-[#2C2C2C] text-sm tracking-[0.15em] transition-colors py-1"
                  >
                    / {item.label}
                  </motion.a>
                ))}
              </div>
              <div className="flex-1 flex flex-col justify-center px-8 md:px-20 gap-3 py-8">
                {SERVICE_LINKS.map((s, i) => (
                  <motion.a
                    key={s.num}
                    href="/services"
                    onClick={closeMenu}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, delay: 0.15 + i * 0.03, ease: EASE.power4InOut }}
                    whileHover={{ x: 8, color: "#6AADCF" }}
                    className="flex items-center gap-3 text-[#2C2C2C] transition-colors py-1"
                  >
                    <span className="text-xs opacity-40">{s.num}</span>
                    <span className="text-lg font-light tracking-wide">{s.name}</span>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative">
        {/* ═══ HERO ═══ */}
        <div ref={heroRef} className="relative">
          <motion.section style={{ opacity: heroOpacity }} className="sticky top-0 h-screen overflow-hidden" aria-label="หน้าหลัก">
            <div
              className="absolute inset-0 bg-cover"
              style={{ backgroundImage: `url(${IMAGES.heroBg})`, backgroundPosition: "50% 33%" }}
              role="img"
              aria-label="พื้นหลังคลินิก Siam Beauty"
            />
            <div className="relative z-[2] flex items-center justify-center h-full px-[5%]">
              <div className="text-center w-full">
                <motion.h1
                  initial={{ opacity: 0, y: 40 }}
                  animate={showPreloader ? { opacity: 0, y: 40 } : { opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.3, ease: EASE.power2Out }}
                  className="text-5xl md:text-8xl lg:text-[125px] font-medium leading-[1] text-white"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  ความงามในทุกรายละเอียด
                </motion.h1>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={showPreloader ? { opacity: 0 } : { opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="absolute bottom-[5%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
            >
              <span className="text-sm font-medium uppercase text-white">เลื่อนเพื่อสำรวจ</span>
              <div className="animate-bounce-slow">
                <svg width="16" height="24" viewBox="0 0 16 24" fill="none" stroke="white" strokeWidth="1.5" aria-hidden="true"><path d="M8 0v20M1 14l7 7 7-7" /></svg>
              </div>
            </motion.div>
          </motion.section>

          {/* Quote overlay — fades from hero image to cream */}
          <section className="relative z-10 min-h-screen flex items-center justify-center overflow-hidden" aria-label="คำกล่าว">
            <div
              className="absolute inset-0 z-0"
              style={{ background: "linear-gradient(180deg, transparent 0%, rgba(240,234,224,0.3) 20%, rgba(240,234,224,0.6) 40%, rgba(240,234,224,0.8) 55%, rgba(240,234,224,0.95) 75%, rgba(240,234,224,1) 100%)" }}
            />
            <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
              <SplitText
                as="h2"
                className="text-2xl md:text-[40px] leading-[48px] text-[#2C2C2C] font-medium drop-shadow-[0_2px_12px_rgba(255,255,255,0.3)]"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                staggerAmount={1.2}
                duration={0.15}
              >
                {"\u201C ความงามของคุณ ถูกเฉลิมฉลองผ่านทุกสัมผัสอันประณีต \u201D"}
              </SplitText>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20% 0px" }}
                transition={{ duration: 0.8, delay: 1.4, ease: EASE.power1Out }}
                className="mt-6 block tracking-[0.3em] text-lg md:text-xl font-light text-[#6AADCF]"
                style={{ fontFamily: "'Outfit', Arial, sans-serif" }}
              >
                SIAM BEAUTY
              </motion.span>
            </div>
          </section>
        </div>

        {/* ═══ SUB-BRAND GALLERY ═══ */}
        <div ref={gallerySectionRef}>
          <GallerySection />
        </div>


        {/* ═══ INTERACTIVE MODEL ═══ */}
        <section ref={modelSectionRef} className="relative h-screen overflow-hidden" aria-label="แผนที่บริการ">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: EASE.power2Out }}
            className="absolute inset-0"
          >
            <img src={IMAGES.heroModel} alt="Siam Beauty — บริการทั้งหมด" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />

            {/* Interactive dots — on photo, keep light colors */}
            {modelDots.map((dot, i) => (
              <motion.button
                key={dot.id}
                data-dot-button
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1, ease: EASE.circOut }}
                onClick={() => setActiveDot(activeDot === dot.id ? null : dot.id)}
                className={`absolute w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-300 animate-pulse-dot hover:bg-[#6AADCF]/40 ${
                  activeDot === dot.id
                    ? "bg-[#6AADCF]/50 backdrop-blur-md ring-2 ring-[#6AADCF]"
                    : "bg-white/40 backdrop-blur-sm"
                }`}
                style={{ top: dot.top, left: dot.left, transform: "translate(-50%, -50%)" }}
                aria-label={`${dot.label} - ${dot.brand}`}
                aria-pressed={activeDot === dot.id}
              >
                <span className="text-[#2C2C2C] text-[10px] md:text-xs font-medium tracking-wide">{dot.label}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Detail card */}
          <AnimatePresence mode="wait">
            {activeDot !== null && (() => {
              const dot = modelDots.find((d) => d.id === activeDot)!;
              return (
                <motion.div
                  key={dot.id}
                  data-detail-card
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.4, ease: EASE.power2Out }}
                  className="fixed bottom-0 left-0 right-0 md:absolute md:bottom-8 md:left-12 md:right-auto z-30 bg-white/95 backdrop-blur-md border-t md:border border-[#6AADCF]/15 p-5 md:p-6 md:max-w-sm w-full md:w-auto md:rounded-lg shadow-lg"
                >
                  <button
                    onClick={() => setActiveDot(null)}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-[#2C2C2C]/40 hover:text-[#2C2C2C] transition-colors"
                    aria-label="ปิด"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                  <div className="flex gap-4 mb-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 overflow-hidden rounded-md"
                    >
                      <img src={dot.img} alt={dot.brand} className="w-full h-full object-cover" />
                    </motion.div>
                    <div>
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="text-[#8A8A8A] text-xs">{dot.label}</motion.span>
                      <motion.h3 initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ease: EASE.power1Out }} className="text-[#2C2C2C] text-lg md:text-xl tracking-[0.15em] font-light">{dot.brand}</motion.h3>
                    </div>
                  </div>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-[#2C2C2C]/70 text-xs leading-relaxed mb-4">{dot.description}</motion.p>
                  <div>
                    <span className="text-[#8A8A8A] text-[10px] uppercase tracking-[0.15em]">Treatments</span>
                    <div className="flex flex-col gap-1 mt-1">
                      {dot.treatments.map((t, ti) => (
                        <motion.a
                          key={t}
                          href="/services"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.35 + ti * 0.05, ease: EASE.power1Out }}
                          whileHover={{ x: 4, color: "#6AADCF" }}
                          className="text-[#2C2C2C]/80 text-xs flex items-center gap-2 transition-colors py-0.5"
                        >
                          <span className="w-1 h-1 bg-[#6AADCF]/60 rounded-full" />
                          {t}
                        </motion.a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </section>

        {/* ═══ PERSONALISED SERVICES ═══ */}
        <section ref={servicesSectionRef} className="relative py-20 md:py-28 overflow-hidden" aria-label="บริการเฉพาะบุคคล">
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="flex animate-marquee whitespace-nowrap">
              {Array.from({ length: 10 }).map((_, i) => (
                <span key={i} className="text-[#6AADCF]/[0.07] text-[80px] md:text-[120px] font-light uppercase tracking-wider mx-4">
                  ความงามในทุกรายละเอียด
                </span>
              ))}
            </div>
          </div>

          <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-[5%]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <SlideLines className="text-sm uppercase tracking-[0.2em] text-[#8A8A8A] mb-4">
                  ความเป็นไปได้ไม่สิ้นสุดกับ
                </SlideLines>
                <SplitText
                  as="h2"
                  className="text-3xl md:text-5xl lg:text-6xl font-light uppercase leading-[1.3] text-[#2C2C2C] mb-6"
                  staggerAmount={0.6}
                  duration={0.3}
                >
                  บริการเฉพาะบุคคล
                </SplitText>
                <SlideLines className="text-sm text-[#2C2C2C]/60 mb-8 max-w-md leading-relaxed" delay={0.3}>
                  {"ที่ สยาม บิวตี้ ทุกรายละเอียดไม่ถูกมองข้าม\nบริการแต่ละอย่างถูกออกแบบมาเพื่อเสริมความงาม\nตามธรรมชาติของคุณ — เพราะความงามที่แท้จริงเป็นเรื่องเฉพาะบุคคล"}
                </SlideLines>
                <AnimButton href="/services">ดูบริการทั้งหมด</AnimButton>
              </div>
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-20% 0px" }}
                transition={{ duration: 1, ease: EASE.power2Out }}
                className="relative aspect-[4/5] overflow-hidden rounded-lg"
              >
                <video autoPlay muted loop playsInline className="w-full h-full object-cover">
                  <source src={VIDEO.services} type="video/mp4" />
                </video>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section ref={faqSectionRef} className="py-20 md:py-28" aria-label="คำถามที่พบบ่อย">
          <div className="max-w-[1280px] mx-auto px-6 md:px-[5%]">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20">
              <div>
                <SplitText
                  as="h2"
                  className="text-2xl md:text-4xl font-bold text-[#2C2C2C] mb-4 leading-[1.3]"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  staggerAmount={0.6}
                >
                  คำถามที่พบบ่อย
                </SplitText>
                <SlideLines className="text-base md:text-lg text-[#8A8A8A] mb-6 leading-[1.5]" delay={0.4}>
                  {"ไม่พบคำตอบที่ต้องการ?\nส่งคำถามมาหาเราทางแชท เรายินดีตอบทุกข้อสงสัย"}
                </SlideLines>
                <AnimButton href="https://line.me/ti/p/%40siambeauty">
                  ติดต่อเรา
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
                    className="border-t border-[#2C2C2C]/10"
                  >
                    <motion.button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between py-5 md:py-6 text-left cursor-pointer"
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.3 }}
                      aria-expanded={openFaq === i}
                    >
                      <span className="text-base md:text-lg tracking-[0.1em] text-[#2C2C2C] uppercase pr-4">{item.question}</span>
                      <motion.svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2C2C2C"
                        strokeWidth="1.5"
                        className="flex-shrink-0"
                        animate={{ rotate: openFaq === i ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        aria-hidden="true"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </motion.svg>
                    </motion.button>
                    <div className={`faq-content ${openFaq === i ? "open" : ""}`}>
                      <p className="text-base md:text-lg text-[#2C2C2C]/60 pb-6 leading-[1.5] whitespace-pre-line">{item.answer}</p>
                    </div>
                  </motion.div>
                ))}
                <div className="border-t border-[#2C2C2C]/10" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-[#2C2C2C] py-12 md:py-16 border-t border-white/5">
        <div className="max-w-[1280px] mx-auto px-6 md:px-[5%]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            <div>
              <p className="text-xs tracking-[0.15em] text-white/40 mb-4 uppercase">Company</p>
              <div className="flex flex-col gap-1">
                {[{ label: "หน้าแรก", href: "/" }, { label: "เกี่ยวกับเรา", href: "/about-us" }, { label: "บทความ", href: "/post" }, { label: "บริการ", href: "/services" }, { label: "สาขา", href: "/location" }].map((link) => (
                  <motion.a key={link.label} href={link.href} className="text-xs text-white/60 tracking-[0.1em] py-1.5" whileHover={{ color: "#ffffff", x: 3 }} transition={{ duration: 0.3 }}>{link.label}</motion.a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs tracking-[0.15em] text-white/40 mb-4 uppercase">Contact</p>
              <div className="flex flex-col gap-1">
                <motion.a href="https://line.me/ti/p/%40siambeauty" className="text-xs text-white/60 tracking-[0.1em] py-1.5" whileHover={{ color: "#ffffff", x: 3 }} transition={{ duration: 0.3 }}>นัดหมาย</motion.a>
                <motion.a href="tel:+6627149555" className="text-xs text-white/60 tracking-[0.1em] py-1.5" whileHover={{ color: "#ffffff", x: 3 }} transition={{ duration: 0.3 }}>02-714-9555</motion.a>
              </div>
            </div>
            <div>
              <p className="text-xs tracking-[0.15em] text-white/40 mb-4 uppercase">Follow Us</p>
              <div className="flex gap-2">
                <motion.a href="https://www.facebook.com/siambeauty" target="_blank" rel="noopener noreferrer" className="text-white/60 p-2" aria-label="Facebook" whileHover={{ color: "#ffffff", scale: 1.1 }} transition={{ duration: 0.3 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </motion.a>
                <motion.a href="https://www.instagram.com/siambeauty/" target="_blank" rel="noopener noreferrer" className="text-white/60 p-2" aria-label="Instagram" whileHover={{ color: "#ffffff", scale: 1.1 }} transition={{ duration: 0.3 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                </motion.a>
                <motion.a href="https://line.me/ti/p/%40siambeauty" target="_blank" rel="noopener noreferrer" className="text-white/60 p-2" aria-label="LINE" whileHover={{ color: "#ffffff", scale: 1.1 }} transition={{ duration: 0.3 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.365 9.864c.018 0 .032.003.047.003H21.1c.26 0 .47.21.47.47v.003c0 .26-.21.47-.47.47h-1.22v.795h1.22c.26 0 .47.21.47.47v.003c0 .26-.21.47-.47.47h-1.22v.795h1.22c.26 0 .47.21.47.47v.003c0 .26-.21.47-.47.47h-1.688c-.26 0-.47-.21-.47-.47V10.334c0-.26.21-.47.47-.47h1.688zM16.882 13.283c.26 0 .47-.21.47-.47v-.003c0-.26-.21-.47-.47-.47h-1.22v-2.476c0-.26-.21-.47-.47-.47h-.003c-.26 0-.47.21-.47.47v2.949c0 .26.21.47.47.47h1.693zM12.14 9.864c.26 0 .47.21.47.47v2.949c0 .26-.21.47-.47.47h-.003c-.26 0-.47-.21-.47-.47v-2.949c0-.26.21-.47.47-.47h.003zM10.11 9.864c.04 0 .08.005.116.015.24.065.404.284.404.533v1.86l-1.675-2.2c-.073-.12-.2-.195-.34-.208h-.072c-.26 0-.47.21-.47.47v2.949c0 .26.21.47.47.47h.003c.26 0 .47-.21.47-.47v-1.86l1.675 2.2c.09.127.233.2.387.208h.023c.26 0 .47-.21.47-.47v-2.949c0-.26-.21-.47-.47-.47h-.003c-.02 0-.04.002-.06.005-.018-.003-.037-.005-.057-.005h-.003c-.026 0-.05.003-.075.008a.484.484 0 00-.393.462v.002zM24 10.584C24 4.742 18.614.2 12 .2S0 4.742 0 10.584c0 5.135 4.556 9.44 10.71 10.256.417.09.985.275 1.128.632.13.324.085.83.042 1.157l-.182 1.093c-.055.332-.258 1.3 1.14.71 1.396-.59 7.53-4.434 10.275-7.593C24.585 15.166 24 13.006 24 10.584z" /></svg>
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
            <span className="text-white/90 text-5xl md:text-7xl tracking-[0.4em] font-light">SIAM BEAUTY</span>
          </motion.div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-6 border-t border-white/10">
            <p className="text-xs text-white/30">&copy; 2026 SIAM BEAUTY CLINIC. สงวนลิขสิทธิ์</p>
            <div className="flex gap-4">
              <a href="/privacy" className="text-xs text-white/30 hover:text-white/60 transition-colors py-1">Privacy Policy</a>
              <a href="/terms" className="text-xs text-white/30 hover:text-white/60 transition-colors py-1">Terms of Service</a>
              <a href="/cookies" className="text-xs text-white/30 hover:text-white/60 transition-colors py-1">Cookies Settings</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
