import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Flame, Users, StopCircle, Play, Pause, RotateCcw, Check, X, Share2, Sun, Moon, Calculator, HelpCircle, SlidersHorizontal, ShieldCheck, FileText, Mail, Globe } from 'lucide-react';
import { ROLES, BURDEN_FACTOR, HOURS_PER_YEAR } from './constants';
import { Attendee } from './types';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('burner-theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  const [region, setRegion] = useState<'US' | 'EU'>(() => {
    const saved = localStorage.getItem('burner-region');
    return (saved as 'US' | 'EU') || 'US';
  });

  const [attendees, setAttendees] = useState<Attendee[]>(
    ROLES.map(r => ({ roleId: r.id, count: 0 }))
  );
  
  const [roleSalaries, setRoleSalaries] = useState<Record<string, number>>(
    ROLES.reduce((acc, role) => ({ ...acc, [role.id]: role.salary }), {})
  );

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalBurned, setTotalBurned] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | 'contact' | null>(null);
  
  const methodologyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('burner-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('burner-region', region);
  }, [region]);

  const isDark = theme === 'dark';

  const currentHoursPerYear = region === 'US' ? 2080 : 1820;

  const calculateHourly = (salary: number) => (salary / currentHoursPerYear) * BURDEN_FACTOR;

  const totalHourlyRate = useMemo(() => {
    return attendees.reduce((acc, curr) => {
      const currentSalary = roleSalaries[curr.roleId];
      const hourly = calculateHourly(currentSalary);
      return acc + (hourly * curr.count);
    }, 0);
  }, [attendees, roleSalaries, region]);

  const totalPeople = useMemo(() => {
    return attendees.reduce((acc, curr) => acc + curr.count, 0);
  }, [attendees]);

  useEffect(() => {
    let intervalId: number;
    if (isRunning) {
      intervalId = window.setInterval(() => {
        setElapsedSeconds(prev => prev + 0.1);
      }, 100);
    }
    return () => clearInterval(intervalId);
  }, [isRunning]);

  useEffect(() => {
    const costPerSecond = totalHourlyRate / 3600;
    setTotalBurned(elapsedSeconds * costPerSecond);
  }, [elapsedSeconds, totalHourlyRate]);

  const formatCurrency = (val: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(val);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s].map(v => v < 10 ? '0' + v : v).join(':');
  };

  const handleAddAttendee = (id: string) => {
    if (isRunning) return;
    setAttendees(prev => prev.map(a => a.roleId === id ? { ...a, count: a.count + 1 } : a));
  };

  const handleRemoveAttendee = (id: string) => {
    if (isRunning) return;
    setAttendees(prev => prev.map(a => a.roleId === id ? { ...a, count: Math.max(0, a.count - 1) } : a));
  };

  const handleSalaryChange = (id: string, newSalary: number) => {
    if (isRunning) return;
    setRoleSalaries(prev => ({ ...prev, [id]: newSalary }));
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setTotalBurned(0);
    setAttendees(ROLES.map(r => ({ roleId: r.id, count: 0 })));
    setRoleSalaries(ROLES.reduce((acc, role) => ({ ...acc, [role.id]: role.salary }), {}));
    setShowSummaryModal(false);
  };

  const handleStop = () => {
    if (elapsedSeconds > 0) {
      setIsRunning(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const scrollToMethodology = () => {
    methodologyRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const summaryText = useMemo(() => {
    return `🔥 THE MEETING BURNER SUMMARY 🔥
---------------------------------
Region: ${region === 'US' ? 'USA (2,080 hrs)' : 'Europe (1,820 hrs)'}
Duration: ${formatTime(elapsedSeconds)}
Total Attendees: ${totalPeople}
Burn Rate: ${formatCurrency(totalHourlyRate)}/hr
---------------------------------
TOTAL MONEY EVAPORATED: ${formatCurrency(totalBurned)}
---------------------------------
"Should this have been an email?"

Generated via The Meeting Burner
https://themeetingburner.online/`;
  }, [elapsedSeconds, totalPeople, totalHourlyRate, totalBurned, region]);

  const handleShare = () => {
    setIsRunning(false);
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setShowSummaryModal(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className={`min-h-screen transition-theme flex flex-col scroll-smooth ${isDark ? 'bg-[#0a0a0a] text-zinc-50' : 'bg-white text-zinc-950'}`}>
      
      {/* Clipboard Toast Notification */}
      {copied && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-300 w-[90%] sm:w-auto">
          <div className="bg-green-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full shadow-2xl flex items-center justify-center gap-3 sm:gap-4 font-black text-xs sm:text-sm uppercase tracking-widest border border-green-500">
            <Check size={20} />
            <span className="text-center">Report saved to clipboard</span>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6 md:p-12 lg:p-16 flex flex-col items-center max-w-[1720px] mx-auto relative flex-grow w-full">
        
        {/* Theme Toggle bar */}
        <div className="w-full flex justify-end mb-8 xl:absolute xl:top-12 xl:right-12 z-50">
          <button 
            onClick={toggleTheme}
            className={`flex items-center gap-3 px-4 py-2 sm:px-5 sm:py-2.5 border rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white' : 'bg-white border-zinc-300 text-zinc-800 shadow-sm hover:bg-zinc-50'}`}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            <span>{isDark ? 'Light' : 'Dark'}</span>
          </button>
        </div>

        {/* Header Section */}
        <div className="w-full flex flex-col items-center text-center mb-10 md:mb-16 gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 justify-center flex-wrap">
            <Flame className="text-orange-500 fill-orange-500 shrink-0" size={32} />
            <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-[900] uppercase tracking-tighter leading-[1.1] sm:leading-tight max-w-[90vw] ${!isDark ? 'text-black' : ''}`}>
              The Meeting Burner Cost Calculator
            </h1>
          </div>
          <p className={`${isDark ? 'text-zinc-500' : 'text-zinc-900'} font-bold text-xs sm:text-sm md:text-lg italic max-w-3xl px-4 opacity-100 leading-relaxed`}>
            Because most meetings really should have been an email.
          </p>
        </div>

        <div className="w-full flex flex-col items-center justify-center">
          <div className="w-full max-w-[1450px] flex flex-col items-center">
            
            {/* Center-Positioned Region Toggle */}
            <div className="w-full flex justify-center mb-8 sm:mb-10">
              <div className={`flex items-center p-1 sm:p-1.5 rounded-full border transition-all ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-300 shadow-sm'}`}>
                <span className={`pl-3 sm:pl-5 pr-2 sm:pr-3 text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-1 sm:gap-2 ${isDark ? 'text-zinc-500' : 'text-zinc-900'}`}>
                  <Globe size={14} className="opacity-60" />
                  <span className="hidden sm:inline">Benchmarking Standard:</span>
                </span>
                <button 
                  onClick={() => !isRunning && setRegion('US')}
                  className={`px-3 sm:px-6 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1 sm:gap-2 ${region === 'US' ? (isDark ? 'bg-zinc-800 text-white shadow-lg' : 'bg-zinc-900 text-white shadow-lg') : (isDark ? 'text-zinc-500' : 'text-zinc-900 hover:text-black')}`}
                  disabled={isRunning}
                >
                  🇺🇸 <span className="hidden sm:inline">USA</span><span className="sm:hidden">US</span>
                </button>
                <button 
                  onClick={() => !isRunning && setRegion('EU')}
                  className={`px-3 sm:px-6 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1 sm:gap-2 ${region === 'EU' ? (isDark ? 'bg-zinc-800 text-white shadow-lg' : 'bg-zinc-900 text-white shadow-lg') : (isDark ? 'text-zinc-500' : 'text-zinc-900 hover:text-black')}`}
                  disabled={isRunning}
                >
                  🇪🇺 <span className="hidden sm:inline">Europe</span><span className="sm:hidden">EU</span>
                </button>
              </div>
            </div>

            {/* Ticker Display Card */}
            <header className={`w-full border rounded-[32px] sm:rounded-[40px] md:rounded-[48px] p-6 sm:p-10 md:p-14 lg:p-20 mb-12 sm:mb-16 relative overflow-hidden transition-theme ${isDark ? 'bg-zinc-900/40 border-zinc-800/60 shadow-2xl' : 'bg-zinc-50 border-zinc-300 shadow-xl shadow-zinc-300/20'}`}>
              {/* Top Accent Shadow - Now theme dependent */}
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 sm:w-64 h-1 sm:h-1.5 blur-sm rounded-full ${isDark ? 'bg-red-500/30' : 'bg-zinc-950/20'}`} />
              
              <div className="flex justify-center lg:justify-end mb-8 lg:mb-0 lg:absolute lg:top-10 lg:right-10 z-20">
                <button 
                  onClick={scrollToMethodology}
                  className={`flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-5 sm:py-3 border rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap overflow-hidden ${isDark ? 'bg-zinc-800/40 border-zinc-700/50 text-zinc-400 hover:text-zinc-200' : 'bg-white border-zinc-300 text-zinc-900 shadow-sm hover:border-black'}`}
                >
                  <Calculator size={16} /> <span className="hidden sm:inline">Calculation</span> Methodology
                </button>
              </div>

              <div className="text-center pt-2 lg:pt-0">
                {/* Ticker Amount with 'black neon' effect in light mode */}
                <div className={`mono-ticker text-4xl sm:text-6xl md:text-[7rem] lg:text-[9rem] font-black mb-8 sm:mb-12 md:mb-16 ${isDark ? 'burn-text drop-shadow-[0_0_20px_rgba(255,0,0,0.3)]' : 'light-burn-text drop-shadow-[0_0_15px_rgba(0,0,0,0.1)]'} tracking-tighter tabular-nums break-words leading-none`}>
                  {formatCurrency(totalBurned)}
                </div>
                
                <div className={`flex flex-wrap justify-center gap-4 sm:gap-8 md:gap-20 font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-950'}`}>
                  <div className="flex flex-col items-center">
                    <span className="mb-2 sm:mb-3 opacity-70">Duration</span>
                    <span className={`text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-widest ${isDark ? 'text-white' : 'text-black'}`}>{formatTime(elapsedSeconds)}</span>
                  </div>
                  <div className={`flex flex-col items-center border-x px-4 sm:px-10 md:px-16 lg:px-24 ${isDark ? 'border-zinc-800' : 'border-zinc-300'}`}>
                    <span className="mb-2 sm:mb-3 opacity-70">Burn Rate</span>
                    <span className={`text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-widest ${isDark ? 'text-white' : 'text-black'}`}>{formatCurrency(totalHourlyRate)}/hr</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="mb-2 sm:mb-3 opacity-70">People</span>
                    <span className={`text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-widest ${isDark ? 'text-white' : 'text-black'}`}>{totalPeople}</span>
                  </div>
                </div>
              </div>
            </header>

            <main className="w-full flex flex-col items-center mb-16">
              <section className="w-full">
                <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between mb-8 sm:mb-10 gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center sm:justify-start">
                    <h2 className={`text-xl sm:text-2xl md:text-3xl font-black flex items-center gap-3 sm:gap-4 ${isDark ? 'text-zinc-100' : 'text-black'}`}>
                      <Users size={24} className={`${isDark ? 'text-zinc-500' : 'text-black'} sm:w-8 sm:h-8`} />
                      Resource Allocation
                    </h2>
                    {isRunning && (
                      <span className="bg-orange-500/10 text-orange-500 text-[10px] sm:text-xs font-black uppercase px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border border-orange-500/20">
                        Locked
                      </span>
                    )}
                  </div>
                  <button onClick={handleReset} className={`flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-colors ${isDark ? 'text-zinc-500 hover:text-red-400' : 'text-zinc-900 hover:text-red-600'}`}>
                    <RotateCcw size={16} /> Clear
                  </button>
                </div>
                
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 transition-opacity duration-300 ${isRunning ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
                  {ROLES.map((role) => {
                    const count = attendees.find(a => a.roleId === role.id)?.count || 0;
                    const currentSalary = roleSalaries[role.id];
                    const roleHourly = calculateHourly(currentSalary);
                    
                    return (
                      <article key={role.id} className={`border rounded-[24px] sm:rounded-[32px] md:rounded-[40px] p-5 sm:p-8 md:p-10 flex flex-col gap-6 sm:gap-8 transition-theme ${isDark ? 'bg-[#121212] border-zinc-800/60 shadow-xl' : 'bg-zinc-50 border-zinc-300 shadow-sm'}`}>
                        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                          <span className={`text-2xl sm:text-3xl md:text-4xl p-2.5 sm:p-4 rounded-[1.2rem] shrink-0 ${isDark ? 'bg-zinc-800/40' : 'bg-white border border-zinc-200 shadow-inner'}`}>{role.icon}</span>
                          <div className="min-w-0 flex-1">
                            <h3 className={`font-black text-sm sm:text-lg md:text-xl leading-none whitespace-nowrap tracking-tight overflow-hidden ${!isDark ? 'text-black' : ''}`}>
                              {role.label}
                            </h3>
                            <div className={`text-[9px] sm:text-[10px] md:text-xs uppercase font-black tracking-[0.15em] mt-1.5 leading-none whitespace-nowrap opacity-100 overflow-hidden ${isDark ? 'text-zinc-500' : 'text-zinc-950'}`}>
                              {role.subLabel}
                            </div>
                          </div>
                        </div>

                        <div className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl ${isDark ? 'bg-zinc-800/20' : 'bg-white border border-zinc-200 shadow-inner'}`}>
                          <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-950'}`}>Attendee Count</span>
                          <div className="flex items-center gap-3 sm:gap-5">
                            <button 
                              onClick={() => handleRemoveAttendee(role.id)} 
                              disabled={isRunning}
                              className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full border flex items-center justify-center text-xl sm:text-2xl font-black transition-all ${isDark ? 'border-zinc-800 text-zinc-500 hover:bg-zinc-800' : 'border-zinc-400 text-black hover:bg-zinc-100'}`}
                            >
                              -
                            </button>
                            <span className={`w-5 sm:w-8 text-center font-black text-xl sm:text-2xl tabular-nums ${!isDark ? 'text-black' : ''}`}>{count}</span>
                            <button 
                              onClick={() => handleAddAttendee(role.id)} 
                              disabled={isRunning}
                              className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-xl sm:text-2xl font-black hover:scale-110 active:scale-95 transition-all shadow-xl ${isDark ? 'bg-white text-zinc-950' : 'bg-black text-white'}`}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-4 sm:space-y-6">
                          <div className="flex justify-between items-center">
                            <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-2 sm:gap-3 ${isDark ? 'text-zinc-500' : 'text-zinc-950'}`}>
                              <SlidersHorizontal size={14} className="sm:w-5 sm:h-5" /> Adjust Salary
                            </span>
                            <span className={`font-black text-base sm:text-lg md:text-xl ${!isDark ? 'text-black' : ''}`}>{formatCurrency(currentSalary, 0)}</span>
                          </div>
                          <input 
                            type="range"
                            min={role.minSalary}
                            max={role.maxSalary}
                            step={1000}
                            disabled={isRunning}
                            value={currentSalary}
                            onChange={(e) => handleSalaryChange(role.id, Number(e.target.value))}
                            className={`w-full h-1.5 sm:h-2 rounded-lg appearance-none cursor-pointer accent-red-500 ${isDark ? 'bg-zinc-800' : 'bg-zinc-300'}`}
                          />
                        </div>
                        
                        <div className={`pt-4 sm:pt-6 border-t flex justify-between items-center ${isDark ? 'border-zinc-800/50' : 'border-zinc-200'}`}>
                          <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-2 sm:gap-3 ${isDark ? 'text-zinc-500' : 'text-zinc-950'}`}>
                            <HelpCircle size={14} className="sm:w-5 sm:h-5" /> Hourly Burn
                          </span>
                          <span className={`text-sm sm:text-base md:text-xl font-black font-mono ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>
                            {formatCurrency(roleHourly)}/hr
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            </main>
          </div>
        </div>

        {/* Methodology Footer Section */}
        <div ref={methodologyRef} className={`w-full pt-16 sm:pt-20 md:pt-28 pb-32 border-t ${isDark ? 'border-zinc-800/30' : 'border-zinc-300'}`}>
          <div className="flex flex-col items-center mb-12 sm:mb-16 md:mb-20">
             <div className={`flex items-center gap-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] mb-4 text-center ${isDark ? 'text-zinc-500' : 'text-black'}`}>
               <HelpCircle size={18} /> Corporate Burn Methodology
             </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-0 w-full max-w-7xl mx-auto text-center mb-24 sm:mb-32">
            <div className="flex flex-col items-center px-6 sm:px-12 lg:px-10">
              <div className="space-y-4 sm:space-y-6 md:space-y-10 group">
                <h4 className={`font-[900] text-xl sm:text-2xl lg:text-3xl uppercase tracking-tighter transition-colors ${isDark ? 'text-zinc-100 group-hover:text-red-500' : 'text-black group-hover:text-red-600'}`}>ROI Benchmarks</h4>
                <p className={`text-sm sm:text-base md:text-lg leading-relaxed font-medium opacity-100 max-w-2xl mx-auto ${isDark ? 'text-zinc-500' : 'text-zinc-950'}`}>
                  Our system applies two distinct fiscal standards. The US Standard (2,080 hours) follows the 40hr/52wk federal benchmark. The European Standard (1,820 hours) is calibrated for the EU's statutory holiday requirements and 35-37.5hr work-week averages.
                </p>
              </div>
            </div>
            
            <div className={`flex flex-col items-center px-6 sm:px-12 lg:px-10 lg:border-x ${isDark ? 'lg:border-zinc-800/50' : 'lg:border-zinc-300'}`}>
              <div className="lg:hidden w-24 h-[1px] bg-zinc-800/30 mx-auto mb-12" />
              <div className="space-y-4 sm:space-y-6 md:space-y-10 group">
                <h4 className={`font-[900] text-xl sm:text-2xl lg:text-3xl uppercase tracking-tighter transition-colors ${isDark ? 'text-zinc-100 group-hover:text-red-500' : 'text-black group-hover:text-red-600'}`}>Corporate Burden</h4>
                <p className={`text-sm sm:text-base md:text-lg leading-relaxed font-medium opacity-100 max-w-2xl mx-auto ${isDark ? 'text-zinc-500' : 'text-zinc-950'}`}>
                  We use a 1.3x 'Fully Burdened' multiplier. This 30% overhead accounts for employer-side payroll taxes, health benefits, retirement matching, and the amortized cost of office real estate/IT equipment.
                </p>
              </div>
              <div className="lg:hidden w-24 h-[1px] bg-zinc-800/30 mx-auto mt-12" />
            </div>

            <div className="flex flex-col items-center px-6 sm:px-12 lg:px-10">
              <div className="space-y-4 sm:space-y-6 md:space-y-10 group">
                <h4 className={`font-[900] text-xl sm:text-2xl lg:text-3xl uppercase tracking-tighter transition-colors ${isDark ? 'text-zinc-100 group-hover:text-red-500' : 'text-black group-hover:text-red-600'}`}>Real-Time Streams</h4>
                <p className={`text-sm sm:text-base md:text-lg leading-relaxed font-medium opacity-100 max-w-2xl mx-auto ${isDark ? 'text-zinc-500' : 'text-zinc-950'}`}>
                  Burn rates are calculated and rendered every 100 milliseconds. This high-frequency processing provides a high-fidelity visualization of financial friction as it occurs.
                </p>
              </div>
            </div>
          </div>
          
          <div className={`w-full border-t pt-12 sm:pt-16 flex flex-col items-center ${isDark ? 'border-zinc-800/30' : 'border-zinc-300'}`}>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-12 mb-12 sm:mb-16">
              <button onClick={() => setLegalModal('privacy')} className={`text-[10px] sm:text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 sm:gap-3 ${isDark ? 'text-zinc-600 hover:text-zinc-400' : 'text-zinc-900 hover:text-black'}`}>
                <ShieldCheck size={16} /> Privacy
              </button>
              <button onClick={() => setLegalModal('terms')} className={`text-[10px] sm:text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 sm:gap-3 ${isDark ? 'text-zinc-600 hover:text-zinc-400' : 'text-zinc-900 hover:text-black'}`}>
                <FileText size={16} /> Terms
              </button>
              <button onClick={() => setLegalModal('contact')} className={`text-[10px] sm:text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 sm:gap-3 ${isDark ? 'text-zinc-600 hover:text-zinc-400' : 'text-zinc-900 hover:text-black'}`}>
                <Mail size={16} /> Contact
              </button>
            </div>
            <p className={`text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] sm:tracking-[0.6em] italic text-center px-6 leading-relaxed ${isDark ? 'text-zinc-700' : 'text-black'}`}>
              Maximize meeting productivity. Minimize financial evaporation. <br className="sm:hidden" /> © {new Date().getFullYear()} The Meeting Burner.
            </p>
          </div>
        </div>

        {/* Floating Fixed Action Bar */}
        <footer className={`fixed bottom-4 sm:bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 w-[94%] max-w-5xl backdrop-blur-3xl border p-3 sm:p-5 md:p-6 rounded-[24px] sm:rounded-[32px] md:rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] flex items-center justify-between z-50 transition-theme ${isDark ? 'bg-zinc-900/80 border-zinc-700/50' : 'bg-white/95 border-zinc-300 shadow-zinc-400/20'}`}>
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6 overflow-x-auto no-scrollbar py-1">
            {!isRunning ? (
              <button 
                onClick={() => setIsRunning(true)}
                className={`px-3.5 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl md:rounded-3xl font-black text-[10px] sm:text-xs md:text-sm uppercase flex items-center gap-2 sm:gap-3 shrink-0 transition-all active:scale-95 shadow-2xl border-b-2 sm:border-b-4 ${isDark ? 'bg-white text-zinc-950 hover:bg-zinc-100 border-zinc-300' : 'bg-zinc-950 text-white hover:bg-black border-zinc-600'}`}
              >
                <Play size={16} className="sm:w-5 sm:h-5" fill="currentColor" /> {elapsedSeconds > 0 ? 'RESUME' : 'START'}
              </button>
            ) : (
              <button 
                onClick={() => setIsRunning(false)}
                className="bg-orange-500 text-white px-3.5 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl md:rounded-3xl font-black text-[10px] sm:text-xs md:text-sm uppercase flex items-center gap-2 sm:gap-3 shrink-0 hover:bg-orange-600 transition-all active:scale-95 shadow-2xl border-b-2 sm:border-b-4 border-orange-800"
              >
                <Pause size={16} className="sm:w-5 sm:h-5" fill="currentColor" /> PAUSE
              </button>
            )}

            {elapsedSeconds > 0 && (
              <button 
                onClick={handleStop}
                className="bg-red-600 text-white px-3.5 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl md:rounded-3xl font-black text-[10px] sm:text-xs md:text-sm uppercase flex items-center gap-2 sm:gap-3 shrink-0 hover:bg-red-700 transition-all active:scale-95 shadow-2xl border-b-2 sm:border-b-4 border-red-900"
              >
                <StopCircle size={16} className="sm:w-5 sm:h-5" fill="currentColor" /> STOP
              </button>
            )}

            <button 
              onClick={handleReset} 
              className={`p-2 sm:p-3 md:p-4 transition-colors shrink-0 ${isDark ? 'text-zinc-500 hover:text-red-500' : 'text-zinc-900 hover:text-red-700'}`}
              title="Reset All"
            >
              <RotateCcw size={20} className="sm:w-7 sm:h-7" />
            </button>
          </div>

          <button 
            onClick={handleShare}
            disabled={totalBurned === 0}
            className={`flex items-center gap-2 sm:gap-3 md:gap-5 text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.25em] transition-all disabled:opacity-20 shrink-0 ml-2 sm:ml-4 ${isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-900 hover:text-black'}`}
          >
            {copied ? <Check className="text-green-500" size={18} /> : <Share2 size={18} className={`${isDark ? 'opacity-40' : 'opacity-100'} sm:w-6 sm:h-6`} />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Share Report"}</span>
            <span className="sm:hidden">{copied ? "Copied" : "Share"}</span>
          </button>
        </footer>
      </div>

      {showSummaryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`border rounded-[32px] sm:rounded-[40px] md:rounded-[50px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 ${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-zinc-300'}`}>
            <div className={`p-6 sm:p-8 md:p-10 border-b flex justify-between items-center ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tighter flex items-center gap-3 sm:gap-4 text-red-500">
                <Flame size={32} className="sm:w-10 sm:h-10" fill="currentColor" /> Waste Analysis
              </h2>
              <button onClick={() => setShowSummaryModal(false)} className={`p-3 sm:p-4 rounded-full transition-colors ${isDark ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100 text-black'}`}><X size={24} className="sm:w-8 sm:h-8" /></button>
            </div>
            <div className="p-6 sm:p-8 md:p-14">
              <div className={`border rounded-2xl sm:rounded-3xl md:rounded-[40px] p-4 sm:p-8 md:p-12 mb-6 sm:mb-10 font-mono text-[10px] sm:text-sm md:text-base whitespace-pre shadow-inner leading-relaxed overflow-x-auto ${isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-white border-zinc-300 text-zinc-950'}`}>
                {summaryText}
              </div>
              <div className="flex flex-col gap-4 sm:gap-6">
                <button onClick={handleShare} className="w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl md:rounded-3xl font-black text-base sm:text-lg md:text-xl uppercase tracking-widest transition-all bg-orange-600 text-white hover:bg-orange-700">
                  Copy & Close
                </button>
                <button onClick={() => setShowSummaryModal(false)} className={`w-full py-3 sm:py-5 rounded-xl sm:rounded-2xl md:rounded-3xl font-black text-[10px] sm:text-sm md:text-base uppercase tracking-widest transition-all ${isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'}`}>
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {legalModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className={`border rounded-[32px] sm:rounded-[40px] md:rounded-[50px] w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col ${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-zinc-300'}`}>
            <div className={`p-6 sm:p-8 md:p-10 border-b flex justify-between items-center ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
              <h2 className={`text-lg sm:text-xl md:text-2xl font-black uppercase tracking-tighter flex items-center gap-3 sm:gap-4 ${isDark ? 'text-zinc-500' : 'text-black'}`}>
                {legalModal === 'privacy' && <><ShieldCheck size={20} className="sm:w-7 sm:h-7" /> Privacy</>}
                {legalModal === 'terms' && <><FileText size={20} className="sm:w-7 sm:h-7" /> Terms</>}
                {legalModal === 'contact' && <><Mail size={20} className="sm:w-7 sm:h-7" /> Contact</>}
              </h2>
              <button onClick={() => setLegalModal(null)} className={`p-3 sm:p-4 rounded-full transition-colors ${isDark ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100 text-black'}`}><X size={24} className="sm:w-8 sm:h-8" /></button>
            </div>
            <div className="p-6 sm:p-8 md:p-16 overflow-y-auto custom-scrollbar">
              <div className={`prose prose-sm md:prose-lg max-w-none ${isDark ? 'prose-invert text-zinc-400' : 'text-black'}`}>
                {legalModal === 'privacy' && (
                  <div className="space-y-6 sm:space-y-8 text-xs sm:text-base leading-relaxed">
                    <p>At The Meeting Burner, accessible from themeetingburner.online, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by The Meeting Burner and how we use it.</p>
                    <h3 className={`font-bold uppercase tracking-widest text-[10px] sm:text-sm ${isDark ? 'text-white' : 'text-black'}`}>Cookies and Web Beacons</h3>
                    <p>Like any other website, The Meeting Burner uses "cookies". These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited.</p>
                  </div>
                )}
                {legalModal === 'terms' && (
                  <div className="space-y-6 sm:space-y-8 text-xs sm:text-base leading-relaxed">
                    <p>Welcome to The Meeting Burner. By accessing this website, we assume you accept these terms and conditions. Do not continue to use The Meeting Burner if you do not agree to all of the terms and conditions stated on this page.</p>
                    <h3 className={`font-bold uppercase tracking-widest text-[10px] sm:text-sm ${isDark ? 'text-white' : 'text-black'}`}>License</h3>
                    <p>Unless otherwise stated, The Meeting Burner and/or its licensors own the intellectual property rights for all material on The Meeting Burner. All intellectual property rights are reserved.</p>
                  </div>
                )}
                {legalModal === 'contact' && (
                  <div className="space-y-6 sm:space-y-10 text-center">
                    <Mail className="mx-auto text-orange-500 mb-4 sm:mb-6 sm:w-16 sm:h-16" size={48} />
                    <p className={`text-lg sm:text-2xl font-black uppercase tracking-widest ${!isDark ? 'text-black' : ''}`}>Get in Touch</p>
                    <p className={`text-xs sm:text-base max-w-lg mx-auto opacity-100 ${isDark ? '' : 'text-zinc-950'}`}>For support, business inquiries, or feature requests, please reach out via email:</p>
                    <a href="mailto:indigoaiservices@gmail.com" className="text-orange-600 font-bold hover:underline text-base sm:text-xl block py-4">indigoaiservices@gmail.com</a>
                  </div>
                )}
              </div>
              <button onClick={() => setLegalModal(null)} className={`mt-8 sm:mt-12 w-full py-4 sm:py-6 rounded-xl sm:rounded-3xl font-black text-base sm:text-xl uppercase tracking-widest transition-all ${isDark ? 'bg-zinc-100 text-zinc-950 hover:bg-white' : 'bg-black text-white hover:bg-zinc-900'}`}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;