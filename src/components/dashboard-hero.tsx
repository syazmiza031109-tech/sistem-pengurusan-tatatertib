import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Scale, Cpu } from 'lucide-react';

interface DashboardHeroProps {
  userName: string;
  role: string;
  grade: string;
  title: string;
  description: string;
  targetId: string;
  buttonText?: string;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  userName,
  role,
  grade,
  title,
  description,
  targetId,
  buttonText = "LIHAT ANALITIS & CARTA GRAFIK",
}) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      id: 0,
      image: '/putrajaya-admin.png',
      logoType: 'logo',
      badge: `AKTIF: ${role}`,
      subBadge: `GRED: ${grade}`,
      heading: title,
      subHeading: `Selamat Datang Kembali, ${userName}`,
      text: description,
    },
    {
      id: 1,
      image: '/ministry-hall.png',
      logoType: 'icon-integrity',
      badge: 'ETIKA & KEBATAN',
      subBadge: 'INTEGRITI',
      heading: 'Integriti Teras Perkhidmatan Awam',
      subHeading: 'Kebertanggungjawaban Awam Berterusan',
      text: 'Sistem Tatatertib JPA memelihara integriti perkhidmatan awam melalui tatacara siasatan yang adil, telus, dan berlandaskan peraturan semasa demi kelangsungan tadbir urus terbaik.',
    },
    {
      id: 2,
      image: '/perdana-putra.jpg',
      logoType: 'icon-sla',
      badge: 'DIGITALISASI & KPI',
      subBadge: 'HRMIS SYNC',
      heading: 'Digitalisasi Aliran Kerja Tatatertib',
      subHeading: 'Pemantauan SLA Secara Masa Nyata',
      text: 'Pendaftaran fail, penentuan pengerusi, dan pemprosesan pertuduhan dipantau secara automatik melalui dashboard analitis bagi memastikan kelewatan diminimumkan sejajar garis panduan JPA.',
    },
  ];

  const handleNext = useCallback(() => {
    setActiveSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const handlePrev = () => {
    setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Auto sliding every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [handleNext]);

  const handleScrollDown = () => {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const mainContainer = targetElement.closest('main');
      if (mainContainer) {
        const rect = targetElement.getBoundingClientRect();
        const containerRect = mainContainer.getBoundingClientRect();
        const relativeTop = rect.top - containerRect.top + mainContainer.scrollTop - 96; // 96px header offset
        mainContainer.scrollTo({ top: relativeTop, behavior: 'smooth' });
      } else {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="relative overflow-hidden w-full mb-8 rounded-none border-b border-slate-800 bg-slate-950 text-white shadow-2xl h-[460px] md:h-[400px] flex flex-col justify-between group/carousel">
      {/* Background Images Layer */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              activeSlide === idx ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Background image with Ken Burns effect when active */}
            <div
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-out ${
                activeSlide === idx ? 'scale-105' : 'scale-100'
              }`}
              style={{ backgroundImage: `url('${slide.image}')` }}
            />
            {/* Dark overlay gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent"></div>
          </div>
        ))}
      </div>

      {/* Main Slides Content Section */}
      <div className="relative z-10 flex-1 flex items-center px-8 md:px-12">
        {/* Left/Right Arrow Navigation Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-3 p-2 bg-black/40 hover:bg-black/60 rounded-full border border-white/10 hover:border-gov-gold-400 text-white/70 hover:text-white transition-all opacity-0 group-hover/carousel:opacity-100 cursor-pointer hidden md:block z-20"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-3 p-2 bg-black/40 hover:bg-black/60 rounded-full border border-white/10 hover:border-gov-gold-400 text-white/70 hover:text-white transition-all opacity-0 group-hover/carousel:opacity-100 cursor-pointer hidden md:block z-20"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Content Wrapper */}
        <div className="w-full flex flex-col md:flex-row items-center gap-8 py-6">
          
          {/* Logo / Emblems Side Column */}
          {slides.map((slide, idx) => {
            if (activeSlide !== idx) return null;

            return (
              <div
                key={`logo-${slide.id}`}
                className="relative shrink-0 flex items-center justify-center p-3.5 bg-white rounded-2xl shadow-xl border border-slate-200 animate-slide-in z-10"
              >
                {slide.logoType === 'logo' && (
                  <img src="/jpa-logo.png" alt="JPA Logo" className="h-16 w-16 md:h-20 md:w-20 object-contain" />
                )}
                {slide.logoType === 'icon-integrity' && (
                  <div className="h-16 w-16 md:h-20 md:w-20 bg-gov-blue-50 text-gov-blue-700 flex items-center justify-center rounded-xl border border-gov-blue-100">
                    <Scale className="h-10 w-10 text-gov-blue-600 animate-float" />
                  </div>
                )}
                {slide.logoType === 'icon-sla' && (
                  <div className="h-16 w-16 md:h-20 md:w-20 bg-gov-gold-50 text-gov-gold-700 flex items-center justify-center rounded-xl border border-gov-gold-100">
                    <Cpu className="h-10 w-10 text-gov-gold-600 animate-float" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Text/Info Side Column */}
          <div className="flex-1 text-center md:text-left space-y-3.5 z-10">
            {slides.map((slide, idx) => {
              if (activeSlide !== idx) return null;

              return (
                <div key={`text-${slide.id}`} className="space-y-3.5 animate-slide-up">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                    <span className="text-[9px] uppercase font-black tracking-wider px-3 py-1 bg-gov-blue-900/90 border border-slate-800 rounded-full text-slate-300 flex items-center gap-1.5 shadow-inner">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {slide.badge}
                    </span>
                    <span className="text-[9px] uppercase font-black tracking-wider px-3 py-1 bg-gov-gold-500/10 border border-gov-gold-500/25 rounded-full text-gov-gold-400 font-mono">
                      {slide.subBadge}
                    </span>
                  </div>

                  {/* Headings */}
                  <div className="space-y-1">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight text-white drop-shadow-lg leading-tight">
                      {slide.heading}
                    </h1>
                    <p className="text-[11px] md:text-xs font-semibold text-gov-gold-300 tracking-wide">
                      {slide.subHeading}
                    </p>
                  </div>

                  {/* Body Text */}
                  <p className="text-xs md:text-sm text-slate-300 max-w-4xl leading-relaxed font-normal">
                    {slide.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Nav Bar (Scroll indicator + manual dots control) */}
      <div className="relative z-10 bg-slate-950/80 border-t border-slate-900 px-8 py-3 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
        
        {/* Left Side: Slide Indicators (Dots) */}
        <div className="flex items-center gap-2">
          {slides.map((slide, idx) => (
            <button
              key={`dot-${slide.id}`}
              onClick={() => setActiveSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                activeSlide === idx ? 'w-6 bg-gov-gold-400' : 'w-2 bg-slate-600 hover:bg-slate-500'
              }`}
              title={`Slaid ${idx + 1}`}
            />
          ))}
        </div>

        {/* Right Side: Scroll Button */}
        <button
          onClick={handleScrollDown}
          className="flex items-center gap-2 text-[10px] font-extrabold text-gov-gold-400 hover:text-gov-gold-300 hover:underline transition-all cursor-pointer group"
        >
          <span className="uppercase tracking-wider">{buttonText}</span>
          <ChevronDown className="h-4.5 w-4.5 animate-bounce text-gov-gold-400 group-hover:text-gov-gold-300" />
        </button>

      </div>
    </div>
  );
};
