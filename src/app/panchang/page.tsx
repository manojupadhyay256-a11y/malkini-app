'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Moon, Sun, Star, Flame, Droplets, Sparkles, X, Calendar } from 'lucide-react';

// ─── Vedic Calendar Data Types ───
interface TithiInfo {
  tithi: string;
  paksha: 'शुक्ल' | 'कृष्ण';
  nakshatra: string;
  event?: string;
  eventType?: 'ekadashi' | 'purnima' | 'amavasya' | 'festival' | 'vrat' | 'special';
  description?: string;
}

// ─── Tithi Names ───
const tithiNames = [
  'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी',
  'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
  'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा/अमावस्या'
];

// ─── Nakshatra Names ───
const nakshatras = [
  'अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा',
  'आर्द्रा', 'पुनर्वसु', 'पुष्य', 'अश्लेषा', 'मघा',
  'पूर्वा फाल्गुनी', 'उत्तरा फाल्गुनी', 'हस्त', 'चित्रा', 'स्वाती',
  'विशाखा', 'अनुराधा', 'ज्येष्ठा', 'मूल', 'पूर्वाषाढ़ा',
  'उत्तराषाढ़ा', 'श्रवण', 'धनिष्ठा', 'शतभिषा', 'पूर्वा भाद्रपद',
  'उत्तरा भाद्रपद', 'रेवती'
];

// ─── Hindu Month Names ───
const hinduMonths = [
  'चैत्र', 'वैशाख', 'ज्येष्ठ', 'आषाढ़', 'श्रावण',
  'भाद्रपद', 'आश्विन', 'कार्तिक', 'मार्गशीर्ष', 'पौष',
  'माघ', 'फाल्गुन'
];

// ─── Weekday Names (Hindi) ───
const weekDaysShort = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
const weekDaysFull = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];

// ─── Gregorian Month Names in Hindi ───
const gregorianMonthsHindi = [
  'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितम्बर', 'अक्टूबर', 'नवम्बर', 'दिसम्बर'
];

// ─── Approximate Hindu Month Mapping (based on Gregorian months) ───
function getHinduMonth(month: number): string {
  // Approximate mapping: Chaitra starts around March/April
  const mapping = [10, 11, 0, 0, 1, 2, 3, 3, 4, 5, 6, 7]; // Jan=Paush, Feb=Magha, ...
  return hinduMonths[mapping[month]];
}

// ─── Calculate Tithi for a Given Date (Simplified Astronomical Approximation) ───
function calculateTithiForDate(date: Date): TithiInfo {
  // Use a known new moon as reference: January 6, 2000 (approximate)
  const knownNewMoon = new Date(2000, 0, 6, 18, 14, 0); // Jan 6, 2000 ~18:14 UTC
  const synodicMonth = 29.530588853; // Average synodic month in days

  const diffMs = date.getTime() - knownNewMoon.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  // Calculate moon phase (0 = new moon, 0.5 = full moon)
  const moonPhase = ((diffDays % synodicMonth) + synodicMonth) % synodicMonth;
  const tithiIndex = Math.floor((moonPhase / synodicMonth) * 30);

  // Determine paksha (fortnight)
  const paksha: 'शुक्ल' | 'कृष्ण' = tithiIndex < 15 ? 'शुक्ल' : 'कृष्ण';
  const tithiInPaksha = tithiIndex % 15;
  const tithiName = tithiNames[tithiInPaksha];

  // Calculate nakshatra (27 nakshatras cycle ~27.32 days)
  const nakshatraCycle = 27.3217;
  const nakshatraPhase = ((diffDays % nakshatraCycle) + nakshatraCycle) % nakshatraCycle;
  const nakshatraIndex = Math.floor((nakshatraPhase / nakshatraCycle) * 27);
  const nakshatra = nakshatras[nakshatraIndex % 27];

  // Determine events
  let event: string | undefined;
  let eventType: TithiInfo['eventType'];
  let description: string | undefined;

  // Ekadashi (11th tithi in each paksha)
  if (tithiInPaksha === 10) {
    event = paksha === 'शुक्ल' ? 'शुक्ल एकादशी' : 'कृष्ण एकादशी';
    eventType = 'ekadashi';
    description = 'एकादशी व्रत — भगवान विष्णु की पूजा का विशेष दिन। इस दिन अन्न का त्याग करें।';
  }
  // Purnima (full moon)
  else if (tithiIndex >= 14 && tithiIndex <= 15) {
    event = 'पूर्णिमा';
    eventType = 'purnima';
    description = 'पूर्णिमा — पूर्ण चंद्रमा का दिन। सत्यनारायण कथा, दान-पुण्य का शुभ अवसर।';
  }
  // Amavasya (new moon)
  else if (tithiIndex >= 29 || tithiIndex === 0) {
    event = 'अमावस्या';
    eventType = 'amavasya';
    description = 'अमावस्या — नया चंद्रमा। पितृ तर्पण, श्राद्ध कर्म का दिन।';
  }
  // Chaturthi (4th tithi - Ganesh related)
  else if (tithiInPaksha === 3) {
    if (paksha === 'कृष्ण') {
      event = 'संकष्टी चतुर्थी';
      eventType = 'vrat';
      description = 'संकष्टी चतुर्थी — श्री गणेश की पूजा, चंद्र दर्शन के बाद व्रत खोलें।';
    }
  }
  // Pradosh Vrat (13th tithi)
  else if (tithiInPaksha === 12) {
    event = 'प्रदोष व्रत';
    eventType = 'vrat';
    description = 'प्रदोष व्रत — भगवान शिव की पूजा का विशेष दिन।';
  }
  // Ashtami (8th tithi)
  else if (tithiInPaksha === 7) {
    if (paksha === 'कृष्ण') {
      event = 'कृष्ण अष्टमी';
      eventType = 'special';
      description = 'कृष्ण पक्ष अष्टमी — कालाष्टमी, भैरव पूजा।';
    }
  }
  // Navami (9th tithi in Shukla)
  else if (tithiInPaksha === 8 && paksha === 'शुक्ल') {
    event = 'राम नवमी तिथि';
    eventType = 'special';
    description = 'शुक्ल पक्ष नवमी — विशेष पूजन का शुभ दिन।';
  }

  // Special date-based festivals (some fixed festivals)
  const monthDay = `${date.getMonth()}-${date.getDate()}`;
  const fixedFestivals: Record<string, { event: string; type: TithiInfo['eventType']; desc: string }> = {
    '0-14': { event: 'मकर संक्रांति', type: 'festival', desc: 'सूर्य का मकर राशि में प्रवेश। खिचड़ी, तिल-गुड़ दान का पर्व।' },
    '0-26': { event: 'गणतंत्र दिवस', type: 'festival', desc: 'भारत का गणतंत्र दिवस।' },
    '2-8': { event: 'महाशिवरात्रि *', type: 'festival', desc: 'भगवान शिव की महान रात्रि। जागरण, पूजा और व्रत।' },
    '2-25': { event: 'होली *', type: 'festival', desc: 'रंगों का त्योहार। होलिका दहन और रंग खेलने का पर्व।' },
    '3-2': { event: 'गुड़ी पड़वा *', type: 'festival', desc: 'हिन्दू नव वर्ष — चैत्र शुक्ल प्रतिपदा।' },
    '3-6': { event: 'राम नवमी *', type: 'festival', desc: 'भगवान श्री राम का जन्मोत्सव।' },
    '3-10': { event: 'हनुमान जयंती *', type: 'festival', desc: 'बजरंगबली हनुमान जी का जन्मोत्सव।' },
    '4-12': { event: 'अक्षय तृतीया *', type: 'festival', desc: 'अक्षय तृतीया — दान-पुण्य, सोने की खरीदारी का शुभ दिन।' },
    '7-15': { event: 'स्वतंत्रता दिवस', type: 'festival', desc: 'भारत का स्वतंत्रता दिवस।' },
    '7-19': { event: 'रक्षाबंधन *', type: 'festival', desc: 'भाई-बहन के प्रेम का पर्व। श्रावण पूर्णिमा।' },
    '7-26': { event: 'जन्माष्टमी *', type: 'festival', desc: 'भगवान श्री कृष्ण का जन्मोत्सव। रात्रि 12 बजे जन्म उत्सव।' },
    '8-5': { event: 'गणेश चतुर्थी *', type: 'festival', desc: 'गणपति बप्पा मोरया! श्री गणेश का जन्मोत्सव।' },
    '9-2': { event: 'नवरात्रि प्रारम्भ *', type: 'festival', desc: 'शरद नवरात्रि — माता की नौ रातें, पूजा और व्रत।' },
    '9-12': { event: 'दशहरा *', type: 'festival', desc: 'विजयादशमी — बुराई पर अच्छाई की जीत। रावण दहन।' },
    '9-20': { event: 'करवा चौथ *', type: 'festival', desc: 'पत्नियों का पतियों की दीर्घायु के लिए निर्जला व्रत।' },
    '10-1': { event: 'दीपावली *', type: 'festival', desc: 'दीपों का त्यौहार। लक्ष्मी-गणेश पूजन, पटाखे, मिठाइयाँ।' },
    '10-3': { event: 'भैया दूज *', type: 'festival', desc: 'बहनें भाइयों को तिलक करें। यम द्वितीया।' },
    '10-15': { event: 'देव उठनी एकादशी *', type: 'festival', desc: 'विष्णु जागरण — शुभ कार्य पुनः प्रारम्भ। तुलसी विवाह।' },
  };

  if (fixedFestivals[monthDay]) {
    const fest = fixedFestivals[monthDay];
    event = fest.event;
    eventType = fest.type;
    description = fest.desc;
  }

  return { tithi: tithiName, paksha, nakshatra, event, eventType, description };
}

// ─── Event Style Config ───
const eventStyles: Record<string, { bg: string; text: string; border: string; dot: string; icon: typeof Moon; badge: string }> = {
  ekadashi: {
    bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200',
    dot: 'bg-amber-500', icon: Star, badge: 'bg-linear-to-r from-amber-500 to-yellow-500'
  },
  purnima: {
    bg: 'bg-violet-50', text: 'text-violet-800', border: 'border-violet-200',
    dot: 'bg-violet-500', icon: Moon, badge: 'bg-linear-to-r from-violet-500 to-purple-500'
  },
  amavasya: {
    bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300',
    dot: 'bg-slate-700', icon: Moon, badge: 'bg-linear-to-r from-slate-700 to-slate-900'
  },
  festival: {
    bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200',
    dot: 'bg-rose-500', icon: Sparkles, badge: 'bg-linear-to-r from-rose-500 to-pink-500'
  },
  vrat: {
    bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200',
    dot: 'bg-emerald-500', icon: Flame, badge: 'bg-linear-to-r from-emerald-500 to-teal-500'
  },
  special: {
    bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200',
    dot: 'bg-sky-500', icon: Droplets, badge: 'bg-linear-to-r from-sky-500 to-blue-500'
  },
};

export default function PanchangPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Generate calendar data
  const calendarData = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: { date: Date; tithiInfo: TithiInfo; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1, prevMonthLastDay - i);
      days.push({ date, tithiInfo: calculateTithiForDate(date), isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentYear, currentMonth, d);
      days.push({ date, tithiInfo: calculateTithiForDate(date), isCurrentMonth: true });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(currentYear, currentMonth + 1, i);
      days.push({ date, tithiInfo: calculateTithiForDate(date), isCurrentMonth: false });
    }

    return days;
  }, [currentMonth, currentYear]);

  // Upcoming events this month
  const upcomingEvents = useMemo(() => {
    return calendarData
      .filter(d => d.isCurrentMonth && d.tithiInfo.event)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [calendarData]);

  const todayInfo = useMemo(() => calculateTithiForDate(today), []);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(null);
  };

  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const selectedDayInfo = selectedDate ? calculateTithiForDate(selectedDate) : null;

  return (
    <main className="min-h-screen bg-[#f5f6fa] text-slate-800 pb-24">
      {/* Header */}
      <div className="bg-linear-to-br from-orange-500 via-amber-600 to-yellow-600 p-5 pb-6 rounded-b-4xl shadow-xl shadow-amber-900/20 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute top-20 -right-6 w-24 h-24 bg-white/5 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />

        {/* Om Symbol */}
        <div className="absolute top-3 right-4 text-white/10 text-6xl font-bold select-none">ॐ</div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={20} strokeWidth={2.5} />
            <h1 className="text-xl font-extrabold tracking-tight">वैदिक पंचांग</h1>
          </div>
          <p className="text-amber-100 text-[12px] font-medium">हिन्दू तिथि, नक्षत्र और त्यौहार</p>

          {/* Today's Panchang Summary */}
          <div className="mt-4 bg-white/15 p-4 rounded-2xl backdrop-blur-md border border-white/15">
            <p className="text-[11px] font-semibold text-amber-100 uppercase tracking-wider">आज का पंचांग</p>
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-amber-100">तिथि</span>
                <span className="text-[14px] font-bold">{todayInfo.paksha} {todayInfo.tithi}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-amber-100">नक्षत्र</span>
                <span className="text-[14px] font-bold">{todayInfo.nakshatra}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-amber-100">हिन्दू माह</span>
                <span className="text-[14px] font-bold">{getHinduMonth(today.getMonth())}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-amber-100">दिन</span>
                <span className="text-[14px] font-bold">{weekDaysFull[today.getDay()]}</span>
              </div>
              {todayInfo.event && (
                <div className="mt-2 bg-white/15 rounded-xl px-3 py-2 flex items-center gap-2">
                  <Sparkles size={14} className="text-yellow-200 shrink-0" />
                  <span className="text-[13px] font-bold text-yellow-50">{todayInfo.event}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4 mt-4">
        {/* Month Navigation */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all active:scale-90"
              aria-label="पिछला महीना"
            >
              <ChevronLeft size={18} className="text-slate-600" />
            </button>

            <div className="text-center">
              <h2 className="text-[16px] font-extrabold text-slate-800">
                {gregorianMonthsHindi[currentMonth]} {currentYear}
              </h2>
              <p className="text-[11px] text-orange-600 font-semibold mt-0.5">
                {getHinduMonth(currentMonth)} • विक्रम संवत {currentYear + 57}
              </p>
            </div>

            <button
              onClick={nextMonth}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all active:scale-90"
              aria-label="अगला महीना"
            >
              <ChevronRight size={18} className="text-slate-600" />
            </button>
          </div>

          {/* Today Button */}
          <div className="flex justify-center mb-3">
            <button
              onClick={goToToday}
              className="text-[11px] font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-4 py-1.5 rounded-full transition-all active:scale-95 border border-orange-200"
            >
              🕉 आज
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekDaysShort.map((day, i) => (
              <div
                key={day}
                className={`text-center text-[10px] font-bold py-1.5 rounded-lg ${
                  i === 0 ? 'text-red-500 bg-red-50/50' : 'text-slate-500'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarData.map((day, index) => {
              const dayIsToday = isToday(day.date);
              const dayIsSelected = selectedDate &&
                day.date.getDate() === selectedDate.getDate() &&
                day.date.getMonth() === selectedDate.getMonth() &&
                day.date.getFullYear() === selectedDate.getFullYear();
              const hasEvent = day.tithiInfo.event;
              const eventStyle = hasEvent && day.tithiInfo.eventType ? eventStyles[day.tithiInfo.eventType] : null;
              const isSunday = day.date.getDay() === 0;

              return (
                <button
                  key={index}
                  onClick={() => day.isCurrentMonth && setSelectedDate(day.date)}
                  disabled={!day.isCurrentMonth}
                  className={`relative aspect-square rounded-xl flex flex-col items-center justify-center p-0.5 transition-all duration-200 ${
                    !day.isCurrentMonth
                      ? 'opacity-25 cursor-default'
                      : dayIsToday
                        ? 'bg-linear-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 scale-105'
                        : dayIsSelected
                          ? 'bg-linear-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30 scale-105'
                          : hasEvent && eventStyle
                            ? `${eventStyle.bg} ${eventStyle.border} border active:scale-90`
                            : isSunday
                              ? 'bg-red-50/40 hover:bg-red-50 active:scale-90'
                              : 'hover:bg-slate-50 active:scale-90'
                  }`}
                >
                  {/* Date number */}
                  <span className={`text-[13px] leading-none ${
                    dayIsToday || dayIsSelected
                      ? 'font-extrabold'
                      : isSunday && day.isCurrentMonth
                        ? 'font-bold text-red-500'
                        : hasEvent
                          ? `font-bold ${eventStyle?.text || ''}`
                          : 'font-semibold text-slate-700'
                  }`}>
                    {day.date.getDate()}
                  </span>

                  {/* Tithi abbreviation */}
                  <span className={`text-[7px] leading-tight mt-0.5 truncate w-full text-center ${
                    dayIsToday || dayIsSelected
                      ? 'text-white/80 font-medium'
                      : 'text-slate-400 font-medium'
                  }`}>
                    {day.tithiInfo.tithi.substring(0, 4)}
                  </span>

                  {/* Event dot */}
                  {hasEvent && day.isCurrentMonth && !dayIsToday && !dayIsSelected && (
                    <div className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${eventStyle?.dot || 'bg-slate-400'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details */}
        {selectedDate && selectedDayInfo && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 animate-scale-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-extrabold text-slate-800">
                {selectedDate.getDate()} {gregorianMonthsHindi[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all"
              >
                <X size={14} className="text-slate-500" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2.5">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Sun size={16} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">तिथि</p>
                  <p className="text-[14px] font-bold text-slate-800">{selectedDayInfo.paksha} पक्ष — {selectedDayInfo.tithi}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2.5">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <Star size={16} className="text-violet-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">नक्षत्र</p>
                  <p className="text-[14px] font-bold text-slate-800">{selectedDayInfo.nakshatra}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2.5">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Calendar size={16} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">दिन / हिन्दू माह</p>
                  <p className="text-[14px] font-bold text-slate-800">
                    {weekDaysFull[selectedDate.getDay()]} • {getHinduMonth(selectedDate.getMonth())}
                  </p>
                </div>
              </div>

              {selectedDayInfo.event && selectedDayInfo.eventType && (
                <div className={`rounded-xl px-3 py-3 ${eventStyles[selectedDayInfo.eventType]?.bg} ${eventStyles[selectedDayInfo.eventType]?.border} border`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    {(() => {
                      const Icon = eventStyles[selectedDayInfo.eventType!]?.icon || Star;
                      return <Icon size={16} className={eventStyles[selectedDayInfo.eventType!]?.text} />;
                    })()}
                    <p className={`text-[14px] font-extrabold ${eventStyles[selectedDayInfo.eventType]?.text}`}>
                      {selectedDayInfo.event}
                    </p>
                  </div>
                  {selectedDayInfo.description && (
                    <p className={`text-[12px] leading-relaxed ${eventStyles[selectedDayInfo.eventType]?.text} opacity-80`}>
                      {selectedDayInfo.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 animate-fade-in-up">
          <h3 className="text-[13px] font-extrabold text-slate-700 mb-3">रंग पहचान</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { type: 'ekadashi', label: 'एकादशी' },
              { type: 'purnima', label: 'पूर्णिमा' },
              { type: 'amavasya', label: 'अमावस्या' },
              { type: 'festival', label: 'त्यौहार' },
              { type: 'vrat', label: 'व्रत' },
              { type: 'special', label: 'विशेष' },
            ].map(item => {
              const style = eventStyles[item.type];
              return (
                <div key={item.type} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${style.dot}`} />
                  <span className="text-[11px] font-semibold text-slate-600">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events This Month */}
        {upcomingEvents.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 animate-fade-in-up">
            <h3 className="text-[13px] font-extrabold text-slate-700 mb-3">
              📅 इस माह के विशेष दिन
            </h3>
            <div className="space-y-2">
              {upcomingEvents.map((day, index) => {
                const style = day.tithiInfo.eventType ? eventStyles[day.tithiInfo.eventType] : null;
                const Icon = style?.icon || Star;
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day.date)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all active:scale-[0.98] ${
                      style ? `${style.bg} ${style.border}` : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className={`shrink-0 w-10 h-10 rounded-xl flex flex-col items-center justify-center text-white ${
                      style?.badge || 'bg-slate-500'
                    }`}>
                      <span className="text-[14px] font-extrabold leading-none">{day.date.getDate()}</span>
                      <span className="text-[7px] font-bold opacity-80">{weekDaysShort[day.date.getDay()]}</span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`text-[13px] font-bold ${style?.text || 'text-slate-700'}`}>
                        {day.tithiInfo.event}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {day.tithiInfo.paksha} {day.tithiInfo.tithi} • {day.tithiInfo.nakshatra}
                      </p>
                    </div>
                    <Icon size={16} className={`shrink-0 ${style?.text || 'text-slate-400'} opacity-60`} />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="text-center pb-4">
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
            * त्यौहारों की तिथियाँ अनुमानित हैं। कृपया स्थानीय पंचांग से पुष्टि करें।
            <br />
            तिथि गणना चंद्र-सौर कैलेंडर पर आधारित है।
          </p>
        </div>
      </div>

      {/* Selected date detailed overlay */}
    </main>
  );
}
