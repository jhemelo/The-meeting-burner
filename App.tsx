
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Flame, Users, DollarSign, Trash2, StopCircle, Play, RotateCcw, Check, HelpCircle, SlidersHorizontal, X, Share2, ChevronDown, Calculator, ExternalLink } from 'lucide-react';
import { ROLES, BURDEN_FACTOR, HOURS_PER_YEAR, STATUS_MILESTONES } from './constants';
import { Attendee } from './types';

// Native Ad Placeholder Component to maintain aesthetic consistency
const AdPlaceholder: React.FC<{ className?: string; type: 'leaderboard' | 'rectangle' | 'banner' }> = ({ className = '', type }) => {
  const dimensions = {
    leaderboard: "h-24 md:h-28 w-full max-w-4xl",
    rectangle: "h-[250px] w-full",
    banner: "h-20 md:h-24 w-full"
  };

  return (
    <div className={`relative group border border-zinc-800/50 bg-zinc-900/30 rounded-2xl flex flex-col items-center justify-center overflow-hidden transition-all hover:border-zinc-700/50 ${dimensions[type]} ${className}`}>
      <div className="absolute top-2 right-3 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-700 group-hover:text-zinc-500 transition-colors">
        Sponsored
      </div>
      <div className="flex flex-col items-center gap-1 opacity-20 group-hover:opacity-40 transition-opacity">
        <ExternalLink size={20} className="text-zinc-500" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Ad Slot</span>
      </div>
      {/* Subtle shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
    </div>
  );
};

const App: React.FC = () => {
  const [attendees, setAttendees] = useState<Attendee[]>(
    ROLES.map(r => ({ roleId: r.id, count: 0 }))
  );
  
  const [roleSalaries, setRoleSalaries] = useState<Record<string, number>>(
    ROLES.reduce((acc, role) => ({ ...acc, [role.id]: role.salary }), {})
  );

  const [customHourlyRate, setCustomHourlyRate] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalBurned, setTotalBurned] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  
  const algorithmRef = useRef<HTMLDivElement>(null);

  const calculateHourly = (salary: number) => (salary / HOURS_PER_YEAR) * BURDEN_FACTOR;

  const totalHourlyRate = useMemo(() => {
    if (customHourlyRate !== null && customHourlyRate > 0) return customHourlyRate;

    return attendees.reduce((acc, curr) => {
      const currentSalary = roleSalaries[curr.roleId];
      const hourly = calculateHourly(currentSalary);
      return acc + (hourly * curr.count);
    }, 0);
  }, [attendees, roleSalaries, customHourlyRate]);

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

  const currentStatus = useMemo(() => {
    return STATUS_MILESTONES.slice().reverse().find(m => totalBurned >= m.threshold) || STATUS_MILESTONES[0];
  }, [totalBurned]);

  const handleAddAttendee = (id: string) => {
    setAttendees(prev => prev.map(a => a.roleId === id ? { ...a, count: a.count + 1 } : a));
  };

  const handleRemoveAttendee = (id: string) => {
    setAttendees(prev => prev.map(a => a.roleId === id ? { ...a, count: Math.max(0, a.count - 1) } : a));
  };

  const handleSalaryChange = (id: string, newSalary: number) => {
    setRoleSalaries(prev => ({ ...prev, [id]: newSalary }));
  };

  const handleReset = () => {
    if (window.confirm("Are you sure? This will wipe the current burn history.")) {
      setIsRunning(false);
      setElapsedSeconds(0);
      setTotalBurned(0);
      setAttendees(ROLES.map(r => ({ roleId: r.id, count: 0 })));
      setRoleSalaries(ROLES.reduce((acc, role) => ({ ...acc, [role.id]: role.salary }), {}));
      setCustomHourlyRate(null);
      setShowSummaryModal(false);
    }
  };

  const scrollToAlgorithm = () => {
    algorithmRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const summaryText = useMemo(() => {
    return `🔥 THE MEETING BURNER SUMMARY 🔥
---------------------------------
Duration: ${formatTime(elapsedSeconds)}
Total Attendees: ${totalPeople}
Burn Rate: ${formatCurrency(totalHourlyRate)}/hr
---------------------------------
TOTAL MONEY EVAPORATED: ${formatCurrency(totalBurned)}
---------------------------------
Verdict: ${currentStatus.message}
"Should this have been an email?"
Generated via The Meeting Burner`;
  }, [elapsedSeconds, totalPeople, totalHourlyRate, totalBurned, currentStatus]);

  const handleStopAndShame = () => {
    setIsRunning(false);
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setShowSummaryModal(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center max-w-5xl mx-auto relative scroll-smooth">
      {/* Header & Ticker */}
      <header className="w-full text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Flame className="text-orange-500 fill-orange-500" size={32} />
          <h1 className="text-2xl font-black uppercase tracking-tighter">The Meeting Burner</h1>
        </div>
        <p className="text-zinc-500 text-sm mb-6">Real-time corporate resource liquidation</p>
        
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group/ticker">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
          
          <button 
            onClick={scrollToAlgorithm}
            className="absolute top-4 right-4 md:right-6 flex items-center gap-2 px-3 py-1.5 bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/50 rounded-full text-[10px] uppercase font-bold tracking-wider text-zinc-400 hover:text-white transition-all backdrop-blur-sm group/mathbtn"
            title="See how this is calculated"
          >
            <Calculator size={14} className="group-hover/mathbtn:rotate-12 transition-transform" />
            <span>How we calculate this</span>
          </button>

          <div className="mono-ticker text-6xl md:text-8xl lg:text-9xl font-black mb-4 burn-text tracking-tighter tabular-nums pt-6 md:pt-2">
            {formatCurrency(totalBurned)}
          </div>
          <div className="flex justify-center gap-8 text-zinc-400 font-semibold uppercase tracking-widest text-xs md:text-sm">
            <div className="flex flex-col items-center">
              <span className="text-zinc-600 mb-1">Duration</span>
              <span className="text-white">{formatTime(elapsedSeconds)}</span>
            </div>
            <div className="flex flex-col items-center border-x border-zinc-800 px-8">
              <span className="text-zinc-600 mb-1">Burn Rate</span>
              <span className="text-white">{formatCurrency(totalHourlyRate)}/hr</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-zinc-600 mb-1">Humans</span>
              <span className="text-white">{totalPeople}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Ad Slot A: Top Leaderboard */}
      <AdPlaceholder type="leaderboard" className="mb-8" />

      {/* Main Controls Grid */}
      <main className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Users size={20} className="text-zinc-400" />
              Who's in the room?
            </h2>
            <button 
              onClick={() => setAttendees(ROLES.map(r => ({ roleId: r.id, count: 0 })))}
              className="text-xs text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <Trash2 size={12} /> Clear Team
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ROLES.map((role) => {
              const attendee = attendees.find(a => a.roleId === role.id);
              const count = attendee?.count || 0;
              const currentSalary = roleSalaries[role.id];
              const roleHourly = calculateHourly(currentSalary);
              
              return (
                <div key={role.id} className="group relative bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-4 hover:border-zinc-600 transition-all">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl bg-zinc-800 p-2 rounded-lg">{role.icon}</span>
                      <div>
                        <div className="font-bold text-sm">{role.label}</div>
                        <div className="text-[10px] uppercase text-zinc-500 font-bold">{role.subLabel}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleRemoveAttendee(role.id)}
                        className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:bg-zinc-800 transition-colors"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-black text-lg">{count}</span>
                      <button 
                        onClick={() => handleAddAttendee(role.id)}
                        className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold hover:bg-white transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">
                      <span className="flex items-center gap-1"><SlidersHorizontal size={10} /> Base Salary</span>
                      <span className="text-zinc-300">{formatCurrency(currentSalary, 0)}</span>
                    </div>
                    <input 
                      type="range"
                      min={role.minSalary}
                      max={role.maxSalary}
                      step={1000}
                      value={currentSalary}
                      onChange={(e) => handleSalaryChange(role.id, Number(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                    />
                  </div>
                  
                  <div className="pt-3 border-t border-zinc-800/50 flex justify-between items-center">
                    <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                      <HelpCircle size={10} />
                      Hourly Burn
                    </div>
                    <div className="text-[11px] font-mono text-orange-400/80">
                      {formatCurrency(roleHourly)}/hr
                    </div>
                  </div>

                  <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-zinc-800 text-[9px] px-2 py-1 rounded text-zinc-400 border border-zinc-700 pointer-events-none shadow-lg">
                      Incl. {Math.round((BURDEN_FACTOR - 1) * 100)}% Overhead
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-inner relative overflow-hidden">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
              <DollarSign size={16} /> Custom Math
            </h2>
            <p className="text-xs text-zinc-500 mb-4">Ignore presets and use a specific total hourly rate:</p>
            <div className="relative mb-6">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
              <input 
                type="number"
                placeholder="Ex: 1250"
                value={customHourlyRate || ''}
                onChange={(e) => setCustomHourlyRate(e.target.value ? Number(e.target.value) : null)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 pl-8 pr-4 text-sm focus:ring-1 focus:ring-zinc-600 outline-none transition-all placeholder:text-zinc-700 font-mono"
              />
            </div>
            
            <button 
              onClick={scrollToAlgorithm}
              className="w-full py-3 px-3 border border-zinc-800 rounded-xl text-[10px] uppercase font-black tracking-widest text-zinc-500 hover:text-zinc-200 hover:border-zinc-700 transition-all flex items-center justify-center gap-2 group bg-zinc-900/50"
            >
              See the Calculation Logic <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
          
          {/* Ad Slot B: Sidebar Rectangle */}
          <AdPlaceholder type="rectangle" />

          <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-5 border-dashed">
             <p className="text-[10px] text-zinc-600 italic text-center leading-relaxed">
               "If you think the cost of a meeting is high, try the cost of a bad decision made because everyone was too tired to argue."
             </p>
          </div>
        </div>
      </main>

      {/* Global Action Bar */}
      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-zinc-900/90 backdrop-blur-md border border-zinc-800 p-4 rounded-2xl shadow-2xl flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          {!isRunning ? (
            <button 
              onClick={() => setIsRunning(true)}
              className="bg-zinc-100 text-zinc-950 px-6 py-2 rounded-xl font-black text-sm uppercase flex items-center gap-2 hover:bg-white transition-all active:scale-95 shadow-xl shadow-white/5"
            >
              <Play size={18} fill="currentColor" /> Start Burn
            </button>
          ) : (
            <button 
              onClick={() => setIsRunning(false)}
              className="bg-red-500 text-white px-6 py-2 rounded-xl font-black text-sm uppercase flex items-center gap-2 hover:bg-red-600 transition-all active:scale-95"
            >
              <StopCircle size={18} /> Stop
            </button>
          )}
          <button 
            onClick={handleReset}
            className="p-2 text-zinc-500 hover:text-zinc-100 transition-colors"
            title="Reset All"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        <button 
          onClick={handleStopAndShame}
          disabled={totalBurned === 0}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-100 hover:text-white transition-all disabled:opacity-20"
        >
          {copied ? <Check className="text-green-500" size={16} /> : <Share2 size={16} />}
          {copied ? "Copied" : "Stop & Shame"}
        </button>
      </footer>

      {/* Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2 text-red-500">
                <Flame size={24} fill="currentColor" /> Burn Report
              </h2>
              <button 
                onClick={() => setShowSummaryModal(false)}
                className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8">
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 mb-6 font-mono text-sm text-zinc-300 whitespace-pre shadow-inner">
                {summaryText}
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl mb-6">
                <div className="bg-green-500 p-2 rounded-full">
                  <Check size={16} className="text-zinc-950" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase text-green-500">Clipboard Updated</div>
                  <div className="text-[10px] text-green-500/80">Ready to shame on Slack, Teams, or LinkedIn.</div>
                </div>
              </div>

              <button 
                onClick={() => setShowSummaryModal(false)}
                className="w-full bg-zinc-100 text-zinc-950 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-white transition-all active:scale-[0.98]"
              >
                Back to the Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED MATH LOGIC SECTION */}
      <div ref={algorithmRef} className="mt-8 mb-16 w-full border-t border-zinc-800 pt-12 flex flex-col items-center">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-600 mb-8 flex items-center gap-2">
          <HelpCircle size={14} /> Calculation Logic
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-center px-4 mb-16">
          <div className="space-y-2 group">
            <h4 className="text-zinc-300 font-bold text-sm transition-colors group-hover:text-white">2,080 Hour Benchmark</h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              The standard corporate work year: <br/> 
              <span className="text-zinc-400">40 hours/week × 52 weeks</span>. <br/>
              This establishes the foundational hourly cost of an employee's time.
            </p>
          </div>
          
          <div className="space-y-2 group">
            <h4 className="text-zinc-300 font-bold text-sm transition-colors group-hover:text-white">1.3x Burden Factor</h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Salaries aren't the only cost. We add 30% to account for <br/>
              <span className="text-zinc-400">Payroll Taxes, Health Benefits, Retirement, and Real Estate</span>. <br/>
              The company pays significantly more than what's on your paycheck.
            </p>
          </div>
          
          <div className="space-y-2 group">
            <h4 className="text-zinc-300 font-bold text-sm transition-colors group-hover:text-white">Real-Time Frequency</h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Total hourly burn rate is divided by 3,600 and updated <br/>
              <span className="text-zinc-400">every 100 milliseconds</span>. <br/>
              You are witnessing the precise rate of financial evaporation.
            </p>
          </div>
        </div>

        {/* Ad Slot C: Bottom Banner */}
        <AdPlaceholder type="banner" className="mb-12" />

        <div className="mt-4 mb-32 text-[9px] text-zinc-700 italic max-w-lg text-center uppercase tracking-widest">
          "Time is money. But this meeting? This meeting is a fire hazard."
        </div>
      </div>
    </div>
  );
};

export default App;
