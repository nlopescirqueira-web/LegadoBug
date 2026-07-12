'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

interface WeeklyData {
  name: string;
  value: number;
}

interface SubjectData {
  name: string;
  seconds: number;
}

interface RankingEntry {
  name: string;
  email: string;
  seconds: number;
  totalSeconds: number;
  photo?: string;
}

interface QuestionAnswer {
  questionId: string;
  isCorrect: boolean;
  timestamp: string;
  subject?: string;
  topic?: string;
}

export interface Notebook {
  id: string;
  title: string;
  createdAt: string;
  count: number;
  type: 'folder' | 'notebook';
  parentId?: string | null;
  questionIds?: string[];
}

export interface SavedFilter {
  id: string;
  name: string;
  filters: any;
  createdAt: string;
}

interface StudyContextType {
  weeklyData: WeeklyData[];
  subjectsData: SubjectData[];
  dailySubjectsData: SubjectData[];
  studiedDays: number[]; // Array of dayOfYear indices (1-365/366)
  dailyHistory: Record<number, number>; // Map of dayOfYear to total seconds
  // Notebooks
  notebooks: Notebook[];
  addNotebook: (notebook: Partial<Notebook>) => Promise<void>;
  updateNotebook: (id: string, updates: Partial<Notebook>) => Promise<void>;
  deleteNotebook: (id: string) => Promise<void>;
  addQuestionsToNotebook: (notebookId: string, questionIds: string[]) => Promise<void>;
  // Saved Filters
  savedFilters: SavedFilter[];
  saveFilter: (name: string, filters: any) => Promise<void>;
  deleteSavedFilter: (id: string) => Promise<void>;
  totalBankQuestions: number;
  refreshTotalQuestions: () => Promise<void>;
  addStudyTime: (seconds: number, subjectName?: string) => void;
  syncStudyTimeToDb: (seconds: number, subjectName?: string) => Promise<void>;
  totalHours: number;
  weeklyTotalHours: number;
  todayTotalHours: number;
  todayTotalSeconds: number;
  allTimeSeconds: number;
  weeklyTotalSeconds: number;
  formatTotalTime: (seconds: number) => string;
  formatFriendlyTime: (seconds: number) => string;
  formatSeconds: (seconds: number) => string;
  monthlyTotalSeconds: number;
  getGlobalRanking: (type: 'diario' | 'semanal' | 'mensal' | 'geral') => RankingEntry[];
  fetchRanking: (force?: boolean) => Promise<void>;
  isRankingLoading: boolean;
  dbStats: { today: number; weekly: number; monthly: number; total: number };
  rankingData: {
    daily: RankingEntry[];
    weekly: RankingEntry[];
    monthly: RankingEntry[];
    total: RankingEntry[];
    lastFetched?: number;
  };
  resetData: () => void;
  // Subjects
  subjects: string[];
  addSubject: (name: string) => Promise<void>;
  deleteSubject: (name: string) => Promise<void>;
  // Stopwatch Timer
  stopwatchActive: boolean;
  stopwatchTime: number;
  stopwatchAccumulated: number;
  stopwatchSessionSeconds: number;
  toggleStopwatch: () => void;
  resetStopwatch: () => void;
  activeSubject: string;
  setActiveSubject: (subject: string) => void;
  onlineCount: number;
  onlineUserIds: string[];
  studyingUserIds: string[];
  totalStudyTime: number;
  isStudying: boolean;
  weeklyGoalHours: number;
  updateWeeklyGoalHours: (hours: number) => Promise<void>;
  // Question Performance
  questionAnswers: QuestionAnswer[];
  recordQuestionAnswer: (questionId: string, isCorrect: boolean, subject?: string, topic?: string, optionIndex?: number) => void;
  // Streak and Ranks
  streak: number;
  lastStudyDate: string | null;
  daysSinceLastStudy: number;
  updateStreak: () => Promise<void>;
  getRank: (seconds: number) => string;
  getRankIcon: (seconds: number) => string;
  getNextRank: (seconds: number) => { name: string, hours: number, icon: string } | null;
  getRankProgress: (seconds: number) => { 
    currentRankHours: number; 
    nextRankHours: number | null; 
    progress: number; 
    remainingSeconds: number | null;
  };
}

export const RANKS = [
  { name: 'Soldado', hours: 0, icon: 'https://i.imgur.com/Z3wotyp.png' },
  { name: 'Cabo', hours: 25, icon: 'https://i.imgur.com/eLnSvbu.png' },
  { name: '3º Sargento', hours: 60, icon: 'https://i.imgur.com/d9xVmi4.png' },
  { name: '2º Sargento', hours: 120, icon: 'https://i.imgur.com/zqEZE7e.png' },
  { name: '1º Sargento', hours: 200, icon: 'https://i.imgur.com/KF5ld9p.png' },
  { name: 'Subtenente', hours: 320, icon: 'https://i.imgur.com/wI0Y0Xc.png' },
  { name: 'Aspirante a Oficial', hours: 500, icon: 'https://i.imgur.com/VyCt7Bv.png' },
  { name: '2º Tenente', hours: 700, icon: 'https://i.imgur.com/cYbRbZo.png' },
  { name: '1º Tenente', hours: 950, icon: 'https://i.imgur.com/86LW621.png' },
  { name: 'Capitão', hours: 1300, icon: 'https://i.imgur.com/ro5MZjC.png' },
  { name: 'Major', hours: 1800, icon: 'https://i.imgur.com/Fhb76lh.png' },
  { name: 'Tenente-Coronel', hours: 2400, icon: 'https://i.imgur.com/lv9M7l1.png' },
  { name: 'Coronel', hours: 3200, icon: 'https://i.imgur.com/4FjLVPN.png' },
  { name: 'General de Brigada', hours: 4200, icon: 'https://i.imgur.com/eDJDwsS.png' },
  { name: 'General de Divisão', hours: 5500, icon: 'https://i.imgur.com/d5MiwBZ.png' },
  { name: 'General de Exército', hours: 7000, icon: 'https://i.imgur.com/gMRz9A6.png' },
];

const INITIAL_DATA = [
  { name: 'Seg', value: 0 },
  { name: 'Ter', value: 0 },
  { name: 'Qua', value: 0 },
  { name: 'Qui', value: 0 },
  { name: 'Sex', value: 0 },
  { name: 'Sáb', value: 0 },
  { name: 'Dom', value: 0 },
];

// Helper to get Brasilia Date components correctly regardless of environment
const getBrasiliaDate = (date: Date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  }).formatToParts(date);
  
  const map: any = {};
  parts.forEach(p => map[p.type] = p.value);
  
  // Create a date object that represents the same YMD HMS in UTC
  // This allows us to use standard Date methods like getDay(), getHours() etc.
  // as if they were in Brasilia time.
  return new Date(Date.UTC(
    parseInt(map.year),
    parseInt(map.month) - 1,
    parseInt(map.day),
    parseInt(map.hour),
    parseInt(map.minute),
    parseInt(map.second)
  ));
};

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export function StudyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('weeklyData');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing weeklyData from localStorage', e);
        }
      }
    }
    return [...INITIAL_DATA];
  });
  const [dbStats, setDbStats] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dbStats');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing dbStats from localStorage', e);
        }
      }
    }
    return { today: 0, weekly: 0, monthly: 0, total: 0 };
  });
  const [subjectsData, setSubjectsData] = useState<SubjectData[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('subjectsData');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing subjectsData from localStorage', e);
        }
      }
    }
    return [];
  });
  const [dailySubjectsData, setDailySubjectsData] = useState<SubjectData[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dailySubjectsData');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing dailySubjectsData from localStorage', e);
        }
      }
    }
    return [];
  });

  // Persist dailySubjectsData whenever it changes to avoid data loss on refresh/navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dailySubjectsData', JSON.stringify(dailySubjectsData));
    }
  }, [dailySubjectsData]);

  // Persist subjectsData whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('subjectsData', JSON.stringify(subjectsData));
    }
  }, [subjectsData]);
  const [studiedDays, setStudiedDays] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('studiedDays');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing studiedDays from localStorage', e);
        }
      }
    }
    return [];
  });
  const [dailyHistory, setDailyHistory] = useState<Record<number, number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dailyHistory');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing dailyHistory from localStorage', e);
        }
      }
    }
    return {};
  });
  const [subjects, setSubjects] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('subjects');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          console.error('Error parsing subjects from localStorage', e);
        }
      }
    }
    return ['Português', 'Sociologia', 'Inglês', 'Espanhol', 'Direito Administrativo'];
  });
  const [rankingData, setRankingData] = useState<{
    daily: RankingEntry[];
    weekly: RankingEntry[];
    monthly: RankingEntry[];
    total: RankingEntry[];
    lastFetched?: number;
  }>({ daily: [], weekly: [], monthly: [], total: [] });
  const [isRankingLoading, setIsRankingLoading] = useState(false);

  const [totalBankQuestions, setTotalBankQuestions] = useState<number>(0);

  const refreshTotalQuestions = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true });
      if (!error && count !== null) {
        setTotalBankQuestions(count);
      }
    } catch (err) {
      console.error('Error refreshing questions count:', err);
    }
  }, []);

  // Stopwatch state — timestamp-based (immune to tab switches & drift)
  const [stopwatchActive, setStopwatchActive] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('stopwatchActive') === 'true';
    }
    return false;
  });

  // When the current session started (Date.now() timestamp)
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const active = localStorage.getItem('stopwatchActive') === 'true';
      const saved = localStorage.getItem('sessionStartedAt');
      if (active && saved) return parseInt(saved);
    }
    return null;
  });

  // When the last periodic sync happened (Date.now() timestamp)
  const [lastSyncAt, setLastSyncAt] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lastSyncAt');
      return saved ? parseInt(saved) : Date.now();
    }
    return Date.now();
  });

  // Derived counters — recomputed every second by the heartbeat
  const [sessionBaseStats, setSessionBaseStats] = useState({ today: 0, weekly: 0, monthly: 0, total: 0 });
  const [stopwatchSessionSeconds, setStopwatchSessionSeconds] = useState(0);
  const [stopwatchAccumulated, setStopwatchAccumulated] = useState(0);
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [activeSubject, setInternalActiveSubject] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeSubject') || 'Português';
    }
    return 'Português';
  });
  const [questionAnswers, setQuestionAnswers] = useState<QuestionAnswer[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('questionAnswers');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing questionAnswers from localStorage', e);
        }
      }
    }
    return [];
  });
  const [notebooks, setNotebooks] = useState<Notebook[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('notebooks');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing notebooks from localStorage', e);
        }
      }
    }
    return [];
  });

  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('savedFilters');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing savedFilters from localStorage', e);
        }
      }
    }
    return [];
  });

  const [isStudying, setIsStudying] = useState(false);
  const [weeklyGoalHours, setWeeklyGoalHours] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('weeklyGoalHours');
      return saved ? parseInt(saved) : 25; // Default 25h as requested
    }
    return 25;
  });
  const [lastStudyDate, setLastStudyDate] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lastStudyDate');
    }
    return null;
  });
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState(0);
  const [presenceChannel, setPresenceChannel] = useState<any>(null);
  const [isPresenceSubscribed, setIsPresenceSubscribed] = useState(false);

  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [studyingUserIds, setStudyingUserIds] = useState<string[]>([]);
  const [presenceMetadata, setPresenceMetadata] = useState<Record<string, { isStudying: boolean, dailySeconds: number, sessionSeconds: number, totalSeconds: number, timestamp: number, receivedAt?: number, name: string, photo?: string }>>({});
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const lastFetchedRef = React.useRef<number | undefined>(undefined);
  const lastLoadedUserIdRef = React.useRef<string | null>(null);
  const hasIncrementedStreakTodayRef = React.useRef<boolean>(false);
  const lastStudyDateRef = React.useRef<string | null>(null);

  const profileMap = useMemo(() => {
    const map: Record<string, any> = {};
    allProfiles.forEach(p => {
      map[p.id] = p;
    });
    return map;
  }, [allProfiles]);

  const currentSessionSeconds = useMemo(() => {
    return stopwatchActive ? stopwatchSessionSeconds : 0;
  }, [stopwatchActive, stopwatchSessionSeconds]);

  const allTimeSeconds = useMemo(() => {
    if (stopwatchActive) {
      return sessionBaseStats.total + stopwatchSessionSeconds;
    }
    return profileMap[user?.id || '']?.total_seconds || 0;
  }, [stopwatchActive, sessionBaseStats.total, stopwatchSessionSeconds, profileMap, user]);

  const todayTotalSeconds = useMemo(() => {
    if (stopwatchActive) {
      return sessionBaseStats.today + stopwatchSessionSeconds;
    }
    return dailySubjectsData.reduce((acc, curr) => acc + curr.seconds, 0);
  }, [stopwatchActive, sessionBaseStats.today, stopwatchSessionSeconds, dailySubjectsData]);

  const weeklyTotalSeconds = useMemo(() => {
    if (stopwatchActive) {
      return sessionBaseStats.weekly + stopwatchSessionSeconds;
    }
    return Math.round(weeklyData.reduce((acc, curr) => acc + curr.value, 0) * 3600);
  }, [stopwatchActive, sessionBaseStats.weekly, stopwatchSessionSeconds, weeklyData]);

  const monthlyTotalSeconds = useMemo(() => {
    if (stopwatchActive) {
      return sessionBaseStats.monthly + stopwatchSessionSeconds;
    }
    return sessionBaseStats.monthly || dbStats.monthly || 0;
  }, [stopwatchActive, sessionBaseStats.monthly, stopwatchSessionSeconds, dbStats.monthly]);

  const liveWeeklyData = useMemo(() => {
    const now = new Date();
    const brDate = getBrasiliaDate(now);
    const dayOfWeek = brDate.getDay();
    const todayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const sessionSecs = stopwatchActive ? stopwatchSessionSeconds : 0;

    return weeklyData.map((day, index) => {
      if (index === todayIndex) {
        return { ...day, value: day.value + (sessionSecs / 3600) };
      }
      return day;
    });
  }, [weeklyData, stopwatchActive, stopwatchSessionSeconds]);

  const totalHours = useMemo(() => allTimeSeconds / 3600, [allTimeSeconds]);
  const weeklyTotalHours = useMemo(() => weeklyTotalSeconds / 3600, [weeklyTotalSeconds]);
  const todayTotalHours = useMemo(() => todayTotalSeconds / 3600, [todayTotalSeconds]);

  const formatSeconds = useCallback((totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  const formatTotalTime = useCallback((seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  }, []);

  const formatFriendlyTime = useCallback((seconds: number) => {
    if (seconds < 60) return `${seconds} seg`;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h === 0) return `${m}m ${s}s`;
    return `${h}h ${m}m`;
  }, []);

  const updateWeeklyGoalHours = useCallback(async (hours: number) => {
    setWeeklyGoalHours(hours);
    if (typeof window !== 'undefined') {
      localStorage.setItem('weeklyGoalHours', hours.toString());
    }
    if (user) {
      // We'll try to update the profiles table, if the column exists it's great, 
      // if not it will just fail silently or we can ignore the error
      supabase.from('profiles').update({ weekly_goal_hours: hours }).eq('id', user.id).then(() => {});
    }
  }, [user]);

  const resetData = useCallback(() => {
    setWeeklyData([...INITIAL_DATA]);
    setSubjectsData([]);
    setDailySubjectsData([]);
    setStudiedDays([]);
    setDailyHistory({});
    setStopwatchActive(false);
    setStopwatchTime(0);
    setStopwatchAccumulated(0);
    setInternalActiveSubject('Português');
    setQuestionAnswers([]);
    setStreak(0);
    setNotebooks([]);
    setSavedFilters([]);
  }, []);

  const fetchRanking = useCallback(async (force = false) => {
    if (!user && !force) return;
    try {
      setIsRankingLoading(true);
      
      // Fetch from the new SQL RPC for maximum precision and global transparency
      const { data: rankingStats, error: rankingError } = await supabase
        .rpc('get_global_ranking_v3');

      if (rankingError) {
        console.warn('[Ranking] View not found or error, falling back to manual fetch:', rankingError);
        // Fallback logic if view doesn't exist yet
        const now = new Date();
        const brNow = getBrasiliaDate(now);
        const dayOfWeek = brNow.getDay();
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const mondayBrDate = new Date(brNow);
        mondayBrDate.setDate(brNow.getDate() - diffToMonday);
        mondayBrDate.setHours(0, 0, 0, 0);
        const mondayBrasilia = mondayBrDate.toISOString();

        const [{ data: profiles }, { data: sessions }] = await Promise.all([
          supabase.from('profiles').select('id, name, photo_url, total_seconds'),
          supabase.from('study_sessions')
            .select('id, user_id, duration_seconds, duration_minutes, created_at, subject')
            .gte('created_at', mondayBrasilia)
            .order('created_at', { ascending: false })
            .limit(10000)
        ]);
        
        if (profiles) setAllProfiles(profiles);
        if (sessions) setAllSessions(sessions);
      } else if (rankingStats) {
        // Map view data to our ranking structure
        const daily: RankingEntry[] = [];
        const weekly: RankingEntry[] = [];
        const monthly: RankingEntry[] = [];
        const total: RankingEntry[] = [];

        rankingStats.forEach((stat: any) => {
          const entry = {
            email: stat.user_id,
            name: stat.name || 'Soldado',
            photo: stat.photo_url,
            seconds: 0,
            totalSeconds: stat.total_seconds_all_time || 0
          };

          daily.push({ ...entry, seconds: stat.daily_seconds || 0 });
          weekly.push({ ...entry, seconds: stat.weekly_seconds || 0 });
          monthly.push({ ...entry, seconds: stat.monthly_seconds || 0 });
          total.push({ ...entry, seconds: stat.total_seconds_all_time || 0 });
        });

        setRankingData({
          daily: daily.sort((a, b) => b.seconds - a.seconds),
          weekly: weekly.sort((a, b) => b.seconds - a.seconds),
          monthly: monthly.sort((a, b) => b.seconds - a.seconds),
          total: total.sort((a, b) => b.seconds - a.seconds),
          lastFetched: Date.now()
        });
        
          // Update streak from ranking data
          const myStat = (rankingStats as any[]).find(s => s.user_id === user?.id);
          if (myStat) {
            // Trust the DB streak more, especially if it's higher
            setStreak(prev => Math.max(prev, myStat.streak || 0));
            setDbStats({
              today: myStat.daily_seconds || 0,
              weekly: myStat.weekly_seconds || 0,
              monthly: myStat.monthly_seconds || 0,
              total: myStat.total_seconds_all_time || 0
            });
          }
        
        // Also update profiles map for metadata
        setAllProfiles((rankingStats as any[]).map(s => ({
          id: s.user_id,
          name: s.name,
          photo_url: s.photo_url,
          total_seconds: s.total_seconds_all_time
        })));
      }
    } catch (err) {
      console.error('[Ranking] Error fetching ranking:', err);
    } finally {
      setIsRankingLoading(false);
    }
  }, [user]);

  const addStudyTime = useCallback((seconds: number, subjectName?: string) => {
    if (seconds <= 0) return;
    const now = new Date();
    const brDate = getBrasiliaDate(now);
    
    const dayOfWeek = brDate.getDay();
    const todayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const year = brDate.getFullYear();
    const startOfYear = new Date(Date.UTC(year, 0, 1));
    const currentDayOfYear = Math.floor((brDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    setWeeklyData(current => {
      const newData = [...current];
      newData[todayIndex] = {
        ...newData[todayIndex],
        value: newData[todayIndex].value + (seconds / 3600)
      };
      return newData;
    });

    if (subjectName !== undefined) {
      const finalSubjectName = subjectName || 'Geral';
      setSubjectsData(current => {
        const existingIndex = current.findIndex(s => s.name === finalSubjectName);
        if (existingIndex >= 0) {
          const newData = [...current];
          newData[existingIndex] = { ...newData[existingIndex], seconds: newData[existingIndex].seconds + seconds };
          return newData;
        }
        return [...current, { name: finalSubjectName, seconds }];
      });

      setDailySubjectsData(current => {
        const existingIndex = current.findIndex(s => s.name === finalSubjectName);
        if (existingIndex >= 0) {
          const newData = [...current];
          newData[existingIndex] = { ...newData[existingIndex], seconds: newData[existingIndex].seconds + seconds };
          return newData;
        }
        return [...current, { name: finalSubjectName, seconds }];
      });
    }

    setStudiedDays(current => current.includes(currentDayOfYear) ? current : [...current, currentDayOfYear]);
    setDailyHistory(current => ({
      ...current,
      [currentDayOfYear]: (current[currentDayOfYear] || 0) + seconds
    }));
  }, []);

  const updateStreak = useCallback(async () => {
    if (!user) return;
    
    if (hasIncrementedStreakTodayRef.current) {
      console.log('[StudyContext] Streak already updated for today.');
      return;
    }

    try {
      // Call the server-side function to update streak atomically
      const { data: newStreak, error } = await supabase.rpc('update_study_streak', {
        p_user_id: user.id
      });
      
      if (error) throw error;
      
      if (newStreak !== undefined) {
        const todayBr = new Intl.DateTimeFormat('en-CA', { 
          timeZone: 'America/Sao_Paulo'
        }).format(new Date());

        hasIncrementedStreakTodayRef.current = true;
        lastStudyDateRef.current = todayBr;
        setStreak(newStreak);
        setLastStudyDate(todayBr);
        console.log('[StudyContext] Streak updated via SQL back-end to:', newStreak);
      }
    } catch (err) {
      console.error('[StudyContext] Exception in updateStreak RPC:', err);
      // Fallback: If RPC fails, we still set a ref to avoid infinite loops, but streak stays as is
      hasIncrementedStreakTodayRef.current = true;
    }
  }, [user]);

  const syncStudyTimeToDb = useCallback(async (seconds: number, subjectName?: string, skipLocalUpdate = false) => {
    if (user && seconds >= 1) {
      console.log(`[StudyContext] Syncing ${seconds} seconds to DB...`);
      
      // Optimistic local update if not skipped
      if (!skipLocalUpdate) {
        addStudyTime(seconds, subjectName);
      }

      const { error } = await supabase.from('study_sessions').insert([{
        user_id: user.id,
        subject: subjectName || 'Geral',
        duration_minutes: Math.ceil(seconds / 60),
        duration_seconds: Math.floor(seconds)
      }]);
      
      if (!error) {
        console.log('[Ranking] Sync successful');
        setLastSyncTimestamp(Date.now());
        fetchRanking(true);

        if (!hasIncrementedStreakTodayRef.current) {
          updateStreak();
        }
      } else {
        console.error('Error syncing to DB:', error);
      }
    }
  }, [user, fetchRanking, addStudyTime, updateStreak]);

  const setActiveSubject = useCallback((newSubject: string) => {
    setInternalActiveSubject(prev => {
      if (prev === newSubject) return prev;

      // When changing subject, sync un-synced time to the OLD subject
      if (stopwatchActiveRef.current && user) {
        const syncAnchor = lastSyncAtRef.current;
        const unsyncedSecs = Math.floor((Date.now() - syncAnchor) / 1000);
        if (unsyncedSecs >= 1) {
          console.log(`[StudyContext] Changing subject from ${prev} to ${newSubject}. Syncing ${unsyncedSecs}s to ${prev}.`);
          supabase.from('study_sessions').insert([{
            user_id: user.id,
            subject: prev || 'Geral',
            duration_minutes: Math.ceil(unsyncedSecs / 60),
            duration_seconds: Math.floor(unsyncedSecs)
          }]);
          const now = Date.now();
          setLastSyncAt(now);
          lastSyncAtRef.current = now;
          localStorage.setItem('lastSyncAt', now.toString());
        }
      }

      if (user) {
        supabase.from('profiles').update({ active_subject: newSubject }).eq('id', user.id).then(() => {
          console.log('[StudyContext] Active subject updated in DB:', newSubject);
        });
      }

      return newSubject;
    });
  }, [user]);

  const getRank = useCallback((seconds: number) => {
    const hours = seconds / 3600;
    let currentRank = RANKS[0].name;
    for (const rank of RANKS) {
      if (hours >= rank.hours) {
        currentRank = rank.name;
      } else {
        break;
      }
    }
    return currentRank;
  }, []);

  const getRankIcon = useCallback((seconds: number) => {
    const hours = seconds / 3600;
    let currentIcon = RANKS[0].icon;
    for (const rank of RANKS) {
      if (hours >= rank.hours) {
        currentIcon = rank.icon;
      } else {
        break;
      }
    }
    return currentIcon;
  }, []);

  const getNextRank = useCallback((seconds: number) => {
    const hours = seconds / 3600;
    for (let i = 0; i < RANKS.length; i++) {
      if (hours < RANKS[i].hours) {
        return { name: RANKS[i].name, hours: RANKS[i].hours, icon: RANKS[i].icon };
      }
    }
    return null;
  }, []);

  const getRankProgress = useCallback((seconds: number) => {
    const hours = seconds / 3600;
    let currentRankIndex = 0;
    for (let i = 0; i < RANKS.length; i++) {
      if (hours >= RANKS[i].hours) {
        currentRankIndex = i;
      } else {
        break;
      }
    }

    const currentRank = RANKS[currentRankIndex];
    const nextRank = RANKS[currentRankIndex + 1] || null;

    if (!nextRank) {
      return {
        currentRankHours: currentRank.hours,
        nextRankHours: null,
        progress: 100,
        remainingSeconds: null
      };
    }

    const range = nextRank.hours - currentRank.hours;
    const progressInHours = hours - currentRank.hours;
    const progress = Math.min(100, Math.max(0, (progressInHours / range) * 100));

    return {
      currentRankHours: currentRank.hours,
      nextRankHours: nextRank.hours,
      progress,
      remainingSeconds: Math.max(0, (nextRank.hours - hours) * 3600)
    };
  }, []);


  const recordQuestionAnswer = useCallback(async (questionId: string, isCorrect: boolean, subject?: string, topic?: string, optionIndex?: number) => {
    const newAnswer: QuestionAnswer = {
      questionId,
      isCorrect,
      timestamp: new Date().toISOString(),
      subject,
      topic,
    };
    
    setQuestionAnswers(prev => {
      const updated = [...prev, newAnswer];
      localStorage.setItem('questionAnswers', JSON.stringify(updated));
      return updated;
    });

    // Save to Supabase for global statistics
    if (user && optionIndex !== undefined) {
      console.log(`[StudyContext] Recording question response for question ${questionId}, option ${optionIndex}, correct: ${isCorrect}`);
      try {
        const { error } = await supabase.from('question_responses').insert([{
          question_id: questionId,
          user_id: user.id,
          option_index: optionIndex,
          is_correct: isCorrect,
          subject: subject || null,
          topic: topic || null
        }]);
        
        if (error) {
          console.error('[StudyContext] Error saving question response to Supabase:', error);
        } else {
          console.log('[StudyContext] Question response saved successfully');
        }
      } catch (err) {
        console.error('[StudyContext] Exception saving question response:', err);
      }
    }
  }, [user]);

  const addNotebook = useCallback(async (notebook: Partial<Notebook>) => {
    const newNotebook: Notebook = {
      id: Math.random().toString(36).substring(2, 9),
      title: notebook.title || 'Novo Caderno',
      createdAt: new Date().toISOString(),
      count: 0,
      type: notebook.type || 'notebook',
      parentId: notebook.parentId || null,
      questionIds: notebook.questionIds || [],
    };
    setNotebooks(prev => [...prev, newNotebook]);
  }, []);

  const updateNotebook = useCallback(async (id: string, updates: Partial<Notebook>) => {
    setNotebooks(prev => prev.map(nb => nb.id === id ? { ...nb, ...updates } : nb));
  }, []);

  const deleteNotebook = useCallback(async (id: string) => {
    setNotebooks(prev => {
      const itemToDelete = prev.find(nb => nb.id === id);
      if (itemToDelete?.type === 'folder') {
        // Remove the folder and all its direct children
        return prev.filter(nb => nb.id !== id && nb.parentId !== id);
      }
      return prev.filter(nb => nb.id !== id);
    });
  }, []);

  const addQuestionsToNotebook = useCallback(async (notebookId: string, questionIds: string[]) => {
    setNotebooks(prev => prev.map(nb => {
      if (nb.id === notebookId) {
        const newQuestionIds = Array.from(new Set([...(nb.questionIds || []), ...questionIds]));
        return { ...nb, questionIds: newQuestionIds, count: newQuestionIds.length };
      }
      return nb;
    }));
  }, []);

  const saveFilter = useCallback(async (name: string, filters: any) => {
    const newFilter: SavedFilter = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      filters,
      createdAt: new Date().toISOString(),
    };
    setSavedFilters(prev => [...prev, newFilter]);
  }, []);

  const deleteSavedFilter = useCallback(async (id: string) => {
    setSavedFilters(prev => prev.filter(sf => sf.id !== id));
  }, []);


  const [activeSessionInitialSeconds, setActiveSessionInitialSeconds] = useState(0);

  const toggleStopwatch = useCallback(async () => {
    if (!user) return;

    const now = Date.now();

    if (!stopwatchActive) {
      // START — capture current totals as the session base
      const profileTotal = profileMap[user.id]?.total_seconds || 0;
      const baseToday = dailySubjectsData.reduce((a, c) => a + c.seconds, 0);
      const baseWeekly = Math.round(weeklyData.reduce((a, c) => a + c.value, 0) * 3600);
      const baseMonthly = dbStats.monthly || 0;
      const baseTotal = profileTotal;

      setSessionBaseStats({ today: baseToday, weekly: baseWeekly, monthly: baseMonthly, total: baseTotal });
      setActiveSessionInitialSeconds(baseToday);
      setSessionStartedAt(now);
      sessionStartedAtRef.current = now;
      setLastSyncAt(now);
      lastSyncAtRef.current = now;
      setStopwatchSessionSeconds(0);
      setStopwatchAccumulated(0);
      setStopwatchActive(true);

      localStorage.setItem('stopwatchActive', 'true');
      localStorage.setItem('sessionStartedAt', now.toString());
      localStorage.setItem('lastSyncAt', now.toString());

      updateStreak();

      supabase.rpc('start_study_session', {
        p_user_id: user.id,
        p_subject: activeSubject,
        p_initial_seconds: baseToday
      }).then(({ error }) => {
        if (error) console.error('[StudyContext] Error starting durable session:', error);
      });
    } else {
      // STOP — sync unsynced tail to DB, update local state, then clear session
      const syncAnchor = lastSyncAtRef.current;
      const unsyncedSecs = Math.floor((now - syncAnchor) / 1000);
      const sessionSecs = stopwatchSessionSeconds;

      // Insert any remaining unsynced time as a session row
      if (unsyncedSecs >= 1 && user) {
        supabase.from('study_sessions').insert([{
          user_id: user.id,
          subject: activeSubject || 'Geral',
          duration_minutes: Math.ceil(unsyncedSecs / 60),
          duration_seconds: Math.floor(unsyncedSecs)
        }]).then(({ error }) => {
          if (error) console.error('[StudyContext] Error syncing tail:', error);
        });
      }

      // Update local state with the full session time so display doesn't jump on stop
      if (sessionSecs > 0) {
        addStudyTime(sessionSecs, activeSubject);
      }

      // Clear active session in DB
      supabase.rpc('end_study_session', {
        p_user_id: user.id
      }).then(({ error }) => {
        if (error) console.error('[StudyContext] Error ending durable session:', error);
        fetchRanking(true);
      });

      if (!hasIncrementedStreakTodayRef.current) {
        updateStreak();
      }

      setStopwatchActive(false);
      setSessionStartedAt(null);
      sessionStartedAtRef.current = null;
      setStopwatchAccumulated(0);
      setStopwatchSessionSeconds(0);
      setActiveSessionInitialSeconds(0);
      setSessionBaseStats({ today: 0, weekly: 0, monthly: 0, total: 0 });

      localStorage.setItem('stopwatchActive', 'false');
      localStorage.removeItem('sessionStartedAt');
    }
  }, [user, stopwatchActive, activeSubject, stopwatchSessionSeconds, updateStreak, fetchRanking, addStudyTime, dailySubjectsData, dbStats, weeklyData, profileMap]);

  const resetStopwatch = useCallback(() => {
    if (stopwatchActive && user) {
      const syncAnchor = lastSyncAtRef.current;
      const unsyncedSecs = Math.floor((Date.now() - syncAnchor) / 1000);
      const sessionSecs = stopwatchSessionSecondsRef.current;
      if (unsyncedSecs >= 1) {
        supabase.from('study_sessions').insert([{
          user_id: user.id,
          subject: activeSubject || 'Geral',
          duration_minutes: Math.ceil(unsyncedSecs / 60),
          duration_seconds: Math.floor(unsyncedSecs)
        }]);
      }
      if (sessionSecs > 0) {
        addStudyTime(sessionSecs, activeSubject);
      }
      supabase.rpc('end_study_session', { p_user_id: user.id }).then(({ error }) => {
        if (error) console.error('[StudyContext] Error ending session on reset:', error);
        fetchRanking(true);
      });
    }
    setStopwatchActive(false);
    setSessionStartedAt(null);
    sessionStartedAtRef.current = null;
    setStopwatchTime(0);
    setStopwatchAccumulated(0);
    setStopwatchSessionSeconds(0);
    setSessionBaseStats({ today: 0, weekly: 0, monthly: 0, total: 0 });

    localStorage.setItem('stopwatchActive', 'false');
    localStorage.removeItem('sessionStartedAt');
    localStorage.removeItem('lastSyncAt');
  }, [stopwatchActive, activeSubject, user, fetchRanking, addStudyTime]);

  const currentSessionSecondsRef = React.useRef(0);
  const todayTotalSecondsRef = React.useRef(0);
  const allTimeSecondsRef = React.useRef(0);

  useEffect(() => {
    currentSessionSecondsRef.current = currentSessionSeconds;
  }, [currentSessionSeconds]);

  useEffect(() => {
    todayTotalSecondsRef.current = todayTotalSeconds;
  }, [todayTotalSeconds]);

  useEffect(() => {
    allTimeSecondsRef.current = allTimeSeconds;
  }, [allTimeSeconds]);

  const [totalStudyTime, setTotalStudyTime] = useState(Date.now());
  const [streak, setStreak] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('streak');
      return saved ? parseInt(saved) : 0;
    }
    return 0;
  });

  const getGlobalRanking = useCallback((type: 'diario' | 'semanal' | 'mensal' | 'geral'): RankingEntry[] => {
    const keyMap = {
      'diario': 'daily',
      'semanal': 'weekly',
      'mensal': 'monthly',
      'geral': 'total'
    } as const;

    const baseRanking = [...rankingData[keyMap[type]]];
    
    onlineUserIds.forEach(onlineId => {
      if (!baseRanking.some(r => r.email === onlineId)) {
        const profile = profileMap[onlineId] || presenceMetadata[onlineId];
        if (profile) {
          baseRanking.push({
            email: onlineId,
            name: profile.name,
            seconds: 0,
            totalSeconds: (profile as any).totalSeconds || 0,
            photo: (profile as any).photo_url || (profile as any).photo
          });
        }
      }
    });
    
    const now = totalStudyTime;
    const updatedRanking = baseRanking.map(entry => {
      const isMe = user?.id === entry.email;
      const profile = profileMap[entry.email] || presenceMetadata[entry.email];
      const name = isMe ? ((user?.name && user?.name !== 'Soldado') ? user.name : entry.name) : (profile?.name || entry.name || 'Soldado');
      const photo = isMe ? (user?.photo || entry.photo) : (profile?.photo || (profile as any)?.photo_url || entry.photo);

      if (isMe) {
        let liveSeconds = entry.seconds;
        if (type === 'diario') {
          liveSeconds = todayTotalSeconds;
        } else if (type === 'semanal') {
          liveSeconds = weeklyTotalSeconds;
        } else if (type === 'mensal') {
          liveSeconds = monthlyTotalSeconds;
        } else {
          liveSeconds = allTimeSeconds;
        }
        return { ...entry, name, photo, seconds: liveSeconds, totalSeconds: allTimeSeconds };
      } else {
        const meta = presenceMetadata[entry.email];
        let liveSeconds = (type === 'geral') ? entry.totalSeconds : entry.seconds;
        let liveTotalSeconds = entry.totalSeconds;

        if (meta) {
          let presenceDaily = meta.dailySeconds || meta.sessionSeconds || 0;
          let presenceTotal = meta.totalSeconds || entry.totalSeconds;

          if (meta.isStudying) {
            const elapsed = Math.floor((now - (meta.receivedAt || meta.timestamp)) / 1000);
            presenceDaily += Math.max(0, elapsed);
            presenceTotal += Math.max(0, elapsed);
          }
          
          const dbDaily = rankingData.daily.find(r => r.email === entry.email)?.seconds || 0;
          const liveIncrement = Math.max(0, presenceDaily - dbDaily);
          
          if (liveIncrement > 0) {
            if (type === 'diario') {
              liveSeconds = Math.max(liveSeconds, presenceDaily);
            } else {
              liveSeconds += liveIncrement;
            }
            liveTotalSeconds = Math.max(liveTotalSeconds, presenceTotal);
          }
        }
        return { ...entry, name, photo, seconds: liveSeconds, totalSeconds: liveTotalSeconds };
      }
    });

    return updatedRanking.sort((a, b) => {
      if (b.seconds !== a.seconds) return b.seconds - a.seconds;
      return a.name.localeCompare(b.name); 
    });
  }, [rankingData, user, todayTotalSeconds, weeklyTotalSeconds, monthlyTotalSeconds, onlineUserIds, profileMap, presenceMetadata, allTimeSeconds, totalStudyTime]);

  const addSubject = useCallback(async (name: string) => {
    if (!user) return;
    setSubjects(prev => {
      if (prev.includes(name)) return prev;
      const updated = [...prev, name];
      localStorage.setItem('subjects', JSON.stringify(updated));
      supabase.from('profiles').update({ subjects: updated }).eq('id', user.id).then(({ error }) => {
        if (error) {
          supabase.from('profiles').upsert({ id: user.id, subjects: updated }, { onConflict: 'id' }).then(() => {});
        }
      });
      return updated;
    });
  }, [user]);

  const deleteSubject = useCallback(async (name: string) => {
    if (!user) return;
    setSubjects(prev => {
      const updated = prev.filter(s => s !== name);
      localStorage.setItem('subjects', JSON.stringify(updated));
      supabase.from('profiles').update({ subjects: updated }).eq('id', user.id).then(({ error }) => {
        if (error) {
          supabase.from('profiles').upsert({ id: user.id, subjects: updated }, { onConflict: 'id' }).then(() => {});
        }
      });
      return updated;
    });
  }, [user]);

  useEffect(() => {
    setIsStudying(stopwatchActive);
  }, [stopwatchActive]);

  const stopwatchActiveRef = React.useRef(stopwatchActive);
  const sessionStartedAtRef = React.useRef(sessionStartedAt);
  const lastSyncAtRef = React.useRef(lastSyncAt);
  const stopwatchAccumulatedRef = React.useRef(stopwatchAccumulated);
  const stopwatchSessionSecondsRef = React.useRef(stopwatchSessionSeconds);
  const activeSubjectRef = React.useRef(activeSubject);

  useEffect(() => { stopwatchActiveRef.current = stopwatchActive; }, [stopwatchActive]);
  useEffect(() => { sessionStartedAtRef.current = sessionStartedAt; }, [sessionStartedAt]);
  useEffect(() => { lastSyncAtRef.current = lastSyncAt; }, [lastSyncAt]);
  useEffect(() => { stopwatchAccumulatedRef.current = stopwatchAccumulated; }, [stopwatchAccumulated]);
  useEffect(() => { stopwatchSessionSecondsRef.current = stopwatchSessionSeconds; }, [stopwatchSessionSeconds]);
  useEffect(() => { activeSubjectRef.current = activeSubject; }, [activeSubject]);

  // Timer heartbeat — recomputes derived values from timestamps every second
  useEffect(() => {
    const heartbeat = setInterval(() => {
      setTotalStudyTime(Date.now());

      const start = sessionStartedAtRef.current;
      if (stopwatchActiveRef.current && start) {
        const now = Date.now();
        const sessionSecs = Math.floor((now - start) / 1000);
        const syncAnchor = lastSyncAtRef.current;
        const unsyncedSecs = Math.floor((now - syncAnchor) / 1000);

        setStopwatchSessionSeconds(sessionSecs);
        setStopwatchAccumulated(unsyncedSecs);
      }
    }, 1000);

    return () => clearInterval(heartbeat);
  }, []);

  // Periodic sync to DB (every 60 seconds) — just inserts session rows for crash recovery
  useEffect(() => {
    const periodicSync = setInterval(() => {
      if (!stopwatchActiveRef.current || !user) return;
      const syncAnchor = lastSyncAtRef.current;
      const unsyncedSecs = Math.floor((Date.now() - syncAnchor) / 1000);
      if (unsyncedSecs < 5) return;

      const sub = activeSubjectRef.current;
      console.log(`[StudyContext] Periodic sync: ${unsyncedSecs}s to ${sub}`);

      supabase.from('study_sessions').insert([{
        user_id: user.id,
        subject: sub || 'Geral',
        duration_minutes: Math.ceil(unsyncedSecs / 60),
        duration_seconds: Math.floor(unsyncedSecs)
      }]).then(({ error }) => {
        if (error) console.error('[StudyContext] Periodic sync error:', error);
        else if (!hasIncrementedStreakTodayRef.current) updateStreak();
      });

      const now = Date.now();
      setLastSyncAt(now);
      lastSyncAtRef.current = now;
      localStorage.setItem('lastSyncAt', now.toString());
    }, 60000);

    return () => clearInterval(periodicSync);
  }, [user, updateStreak]);

  // Sync to DB on page unload or visibility change
  useEffect(() => {
    const syncUnsaved = () => {
      if (!stopwatchActiveRef.current || !user) return;
      const syncAnchor = lastSyncAtRef.current;
      const unsyncedSecs = Math.floor((Date.now() - syncAnchor) / 1000);
      if (unsyncedSecs < 1) return;

      console.log(`[StudyContext] Visibility/unload sync: ${unsyncedSecs}s`);
      supabase.from('study_sessions').insert([{
        user_id: user.id,
        subject: activeSubjectRef.current || 'Geral',
        duration_minutes: Math.ceil(unsyncedSecs / 60),
        duration_seconds: Math.floor(unsyncedSecs)
      }]);

      const now = Date.now();
      setLastSyncAt(now);
      lastSyncAtRef.current = now;
      localStorage.setItem('lastSyncAt', now.toString());
    };

    const handleBeforeUnload = () => syncUnsaved();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') syncUnsaved();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  // Global Data Fetching (Ranking & Profiles)
  useEffect(() => {
    fetchRanking();

    // Real-time updates for everyone
    const sessionsChannel = supabase.channel('global-sessions-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'study_sessions' }, (payload) => {
        console.log('[Ranking] New session inserted:', payload.new);
        setAllSessions(current => {
          if (current.some(s => s.id === (payload.new as any).id)) return current;
          return [payload.new as any, ...current];
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'study_sessions' }, (payload) => {
        setAllSessions(current => current.map(s => s.id === (payload.new as any).id ? payload.new as any : s));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'study_sessions' }, (payload) => {
        setAllSessions(current => current.filter(s => s.id === (payload.old as any).id));
      })
      .subscribe();

    const profilesChannel = supabase.channel('global-profiles-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, async (payload) => {
        console.log('[Ranking] Profile change detected:', payload.eventType);
        // For profiles, it's safer to re-fetch the specific profile or all profiles if it's a small table
        const { data } = await supabase.from('profiles').select('id, name, photo_url, total_seconds');
        if (data) setAllProfiles(data);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sessionsChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, [fetchRanking]);

  // User-specific Data Fetching
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        // User logged out
        if (lastLoadedUserIdRef.current !== null) {
          console.log('[StudyContext] User logged out, resetting data');
          resetData();
          lastLoadedUserIdRef.current = null;
        }
        return;
      }

      // Prevent redundant loading if user ID hasn't changed
      if (lastLoadedUserIdRef.current === user.id) {
        return;
      }
      lastLoadedUserIdRef.current = user.id;

      console.log('[StudyContext] Loading user study data for:', user.id);

      try {
        // Parallelize session fetch, profile fetch, and question responses fetch
        const [sessionsResult, profileResult, responsesResult] = await Promise.all([
          supabase
            .from('study_sessions')
            .select('duration_minutes, duration_seconds, created_at, subject')
            .eq('user_id', user.id),
          supabase
            .from('profiles')
            .select('subjects, streak, last_login_date, active_subject, total_seconds, subjects_data, active_session_type, active_session_start, active_session_subject, active_session_initial_seconds')
            .eq('id', user.id)
            .single(),
          supabase
            .from('question_responses')
            .select('question_id, is_correct, created_at, subject, topic')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true })
        ]);
        
        const { data: sessions, error } = sessionsResult;
        const { data: profile } = profileResult;
        const { data: responses } = responsesResult;

        if (responses) {
          const dbAnswers: QuestionAnswer[] = responses.map(r => ({
            questionId: r.question_id,
            isCorrect: r.is_correct,
            timestamp: r.created_at,
            subject: r.subject || undefined,
            topic: r.topic || undefined,
          }));
          setQuestionAnswers(dbAnswers);
          localStorage.setItem('questionAnswers', JSON.stringify(dbAnswers));
        }

        // Refresh ranking data to ensure DB totals are fresh
        fetchRanking(true);

        // Handle Streak Logic via RPC
        if (profile) {
          const { data: currentStreak, error: streakError } = await supabase.rpc('check_streak_health', {
            p_user_id: user.id
          });

          if (!streakError && currentStreak !== undefined) {
            setStreak(currentStreak);
          } else {
            console.error('[StudyContext] Error checking streak health RPC:', streakError);
            setStreak(profile.streak || 0);
          }

          const todayBr = new Intl.DateTimeFormat('en-CA', { 
            timeZone: 'America/Sao_Paulo'
          }).format(new Date());
          
          lastStudyDateRef.current = profile.last_login_date;
          hasIncrementedStreakTodayRef.current = profile.last_login_date === todayBr;
          setLastStudyDate(profile.last_login_date || '');

          if (profile.active_subject) {
            setInternalActiveSubject(profile.active_subject);
            localStorage.setItem('activeSubject', profile.active_subject);
          }

          // RECOVERY: Recover active session from SQL for 100% precision
          if (profile.active_session_type === 'stopwatch' && profile.active_session_start) {
            const startTime = new Date(profile.active_session_start).getTime();
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const initial = profile.active_session_initial_seconds || 0;
            const profileTotalSecs = profile.total_seconds || 0;

            console.log(`[StudyContext] Recovering STOPWATCH from SQL: ${elapsed}s elapsed, initial: ${initial}s`);
            setSessionStartedAt(startTime);
            sessionStartedAtRef.current = startTime;
            setLastSyncAt(Date.now());
            lastSyncAtRef.current = Date.now();
            setStopwatchSessionSeconds(elapsed);
            setStopwatchAccumulated(0);
            setActiveSessionInitialSeconds(initial);
            const recoveryWeekly = Math.round(weeklyData.reduce((a, c) => a + c.value, 0) * 3600);
            const recoveryMonthly = dbStats.monthly || 0;
            setSessionBaseStats({
              today: initial,
              weekly: recoveryWeekly,
              monthly: recoveryMonthly,
              total: profileTotalSecs
            });
            setStopwatchActive(true);

            localStorage.setItem('stopwatchActive', 'true');
            localStorage.setItem('sessionStartedAt', startTime.toString());
            localStorage.setItem('lastSyncAt', Date.now().toString());
          }
        }
        
          // Merge local and DB data instead of blindly overwriting
          if (sessions && !error) {
            // Process sessions to fill weeklyData, subjectsData, studiedDays
            const newWeeklyData = [...INITIAL_DATA].map(d => ({ ...d }));
            const newSubjectsMap: Record<string, number> = {};
            const newDailySubjectsMap: Record<string, number> = {};
            const newStudiedDays: number[] = [];
            const newDailyHistory: Record<number, number> = {};
            
            const now = new Date();
            const brNow = getBrasiliaDate(now);
            const todayBrasilia = new Intl.DateTimeFormat('en-CA', {
              timeZone: 'America/Sao_Paulo',
            }).format(now);

            sessions.forEach(session => {
              const date = new Date(session.created_at);
              const brDate = getBrasiliaDate(date);
              const sessionDateBrasilia = new Intl.DateTimeFormat('en-CA', {
                timeZone: 'America/Sao_Paulo',
              }).format(date);

              const dayIndex = (brDate.getDay() + 6) % 7;
              const seconds = (session as any).duration_seconds ?? (session.duration_minutes * 60);
              const hours = seconds / 3600;
              
              const brDayOfWeek = brNow.getDay();
              const brDiffToMonday = brDayOfWeek === 0 ? 6 : brDayOfWeek - 1;
              const brStartOfWeek = new Date(brNow);
              brStartOfWeek.setDate(brNow.getDate() - brDiffToMonday);
              brStartOfWeek.setHours(0, 0, 0, 0);
              
              if (brDate >= brStartOfWeek) {
                newWeeklyData[dayIndex].value += hours;
              }
              
              newSubjectsMap[session.subject] = (newSubjectsMap[session.subject] || 0) + seconds;
              
              if (sessionDateBrasilia === todayBrasilia) {
                newDailySubjectsMap[session.subject] = (newDailySubjectsMap[session.subject] || 0) + seconds;
              }

              const year = brDate.getFullYear();
              const startOfYear = new Date(Date.UTC(year, 0, 1));
              const dayOfYear = Math.floor((brDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              
              newDailyHistory[dayOfYear] = (newDailyHistory[dayOfYear] || 0) + seconds;

              if (!newStudiedDays.includes(dayOfYear)) {
                newStudiedDays.push(dayOfYear);
              }
            });

            // UPDATE LOGIC: Use the maximum between local and DB for each subject
            setSubjectsData(prev => {
              const merged = [...prev];
              Object.entries(newSubjectsMap).forEach(([name, seconds]) => {
                const idx = merged.findIndex(s => s.name === name);
                if (idx >= 0) {
                  merged[idx].seconds = Math.max(merged[idx].seconds, seconds);
                } else {
                  merged.push({ name, seconds });
                }
              });
              return merged;
            });
            
            setDailySubjectsData(prev => {
              const merged = [...prev];
              Object.entries(newDailySubjectsMap).forEach(([name, seconds]) => {
                const idx = merged.findIndex(s => s.name === name);
                if (idx >= 0) {
                  merged[idx].seconds = Math.max(merged[idx].seconds, seconds);
                } else {
                  merged.push({ name, seconds });
                }
              });
              return merged;
            });

            setWeeklyData(prev => {
              return prev.map((day, i) => ({
                ...day,
                value: Math.max(day.value, newWeeklyData[i].value)
              }));
            });
            
            setStudiedDays(newStudiedDays.sort((a, b) => a - b));
            setDailyHistory(newDailyHistory);

            // Update localStorage with merged state
            localStorage.setItem('weeklyData', JSON.stringify(newWeeklyData));
            localStorage.setItem('subjectsData', JSON.stringify(Object.entries(newSubjectsMap).map(([name, seconds]) => ({ name, seconds }))));
            localStorage.setItem('dailySubjectsData', JSON.stringify(Object.entries(newDailySubjectsMap).map(([name, seconds]) => ({ name, seconds }))));
            localStorage.setItem('studiedDays', JSON.stringify(newStudiedDays));
            localStorage.setItem('dailyHistory', JSON.stringify(newDailyHistory));
          }

        if (profile?.subjects && Array.isArray(profile.subjects)) {
          setSubjects(profile.subjects);
          localStorage.setItem('subjects', JSON.stringify(profile.subjects));
        }
      } catch (err) {
        console.error('[StudyContext] Error loading user data:', err);
      }
    };

    fetchUserData();
  }, [user, resetData, fetchRanking, syncStudyTimeToDb]);

  // Real-time Session Synchronization (Multi-device support)
  useEffect(() => {
    if (!user) return;

    console.log('[StudyContext] Setting up real-time session sync for:', user.id);

    const channel = supabase.channel(`user-session-sync-${user.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles', 
        filter: `id=eq.${user.id}` 
      }, (payload) => {
        const newProfile = payload.new as any;
        
        // 1. Sync Active Subject
        if (newProfile.active_subject && newProfile.active_subject !== activeSubjectRef.current) {
          console.log('[StudyContext] Syncing active subject from another device:', newProfile.active_subject);
          setInternalActiveSubject(newProfile.active_subject);
          localStorage.setItem('activeSubject', newProfile.active_subject);
        }

        // 2. Sync Session State
        const dbType = newProfile.active_session_type;
        const dbStart = newProfile.active_session_start;
        const dbInitial = newProfile.active_session_initial_seconds || 0;

        if (dbType === 'stopwatch' && dbStart) {
          const startTime = new Date(dbStart).getTime();
          const isDifferentSession = !sessionStartedAtRef.current || Math.abs(sessionStartedAtRef.current - startTime) > 5000;

          if (!stopwatchActiveRef.current || isDifferentSession) {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            console.log(`[StudyContext] Remote STOPWATCH detected. Elapsed: ${elapsed}s, Initial: ${dbInitial}s`);

            setSessionStartedAt(startTime);
            sessionStartedAtRef.current = startTime;
            setLastSyncAt(Date.now());
            lastSyncAtRef.current = Date.now();
            setStopwatchSessionSeconds(elapsed);
            setStopwatchAccumulated(0);
            setActiveSessionInitialSeconds(dbInitial);
            setStopwatchActive(true);

            localStorage.setItem('stopwatchActive', 'true');
            localStorage.setItem('sessionStartedAt', startTime.toString());
          }
        } else if (!dbType) {
          if (stopwatchActiveRef.current) {
            console.log('[StudyContext] Stopwatch stopped from another device.');
            setStopwatchActive(false);
            setSessionStartedAt(null);
            sessionStartedAtRef.current = null;
            setStopwatchAccumulated(0);
            setActiveSessionInitialSeconds(0);
            localStorage.setItem('stopwatchActive', 'false');
            localStorage.removeItem('sessionStartedAt');
            fetchRanking(true);
          }
        }
      })
      .subscribe();

    return () => {
      console.log('[StudyContext] Removing real-time session sync');
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Re-calculate ranking whenever allSessions or allProfiles change
  useEffect(() => {
    if (allSessions.length === 0 && allProfiles.length === 0) return;
    
    const now = new Date();
    const getBrasiliaISO = (date: Date) => {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(date);
    };

    const todayBrasilia = getBrasiliaISO(now);
    
    // Get Monday of current week in Brasilia
    const brDayLong = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'long' }).format(now);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days.indexOf(brDayLong);
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const mondayBrDate = new Date(now);
    mondayBrDate.setDate(now.getDate() - diffToMonday);
    const mondayBrasilia = getBrasiliaISO(mondayBrDate);

    const monthFirstBrDate = new Date(now);
    monthFirstBrDate.setDate(1);
    const monthFirstBrasilia = getBrasiliaISO(monthFirstBrDate);

    const dailyMap: Record<string, number> = {};
    const weeklyMap: Record<string, number> = {};
    const monthlyMap: Record<string, number> = {};

    allSessions.forEach(session => {
      const date = new Date(session.created_at);
      const sessionDateBr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(date);

      const seconds = session.duration_seconds ?? (session.duration_minutes * 60);
      const uid = session.user_id;

      if (sessionDateBr === todayBrasilia) dailyMap[uid] = (dailyMap[uid] || 0) + seconds;
      if (sessionDateBr >= mondayBrasilia) weeklyMap[uid] = (weeklyMap[uid] || 0) + seconds;
      if (sessionDateBr >= monthFirstBrasilia) monthlyMap[uid] = (monthlyMap[uid] || 0) + seconds;
    });

    const mapToRanking = (map: Record<string, number>, useTotalSeconds = false) => {
      const allUids = new Set([
        ...Object.keys(map), 
        ...allProfiles.map(p => p.id)
      ]);
      
      return Array.from(allUids)
        .filter(uid => typeof uid === 'string' && uid.length > 0)
        .map(uid => {
          const profile = profileMap[uid];
          const seconds = useTotalSeconds ? (profile?.total_seconds || 0) : (map[uid] || 0);
          const totalSeconds = profile?.total_seconds || 0;
          
          let name = profile?.name || 'Soldado';
          let photo = profile?.photo_url;
          
          if (user?.id === uid) {
            name = (user?.name && user?.name !== 'Soldado') ? user.name : name;
            photo = user?.photo || photo;
          }
          
          return { email: uid, name, seconds, totalSeconds, photo };
        })
        .sort((a, b) => {
          if (b.seconds !== a.seconds) return b.seconds - a.seconds;
          return a.name.localeCompare(b.name);
        });
    };

    setRankingData({
      daily: mapToRanking(dailyMap),
      weekly: mapToRanking(weeklyMap),
      monthly: mapToRanking(monthlyMap),
      total: mapToRanking({}, true),
      lastFetched: Date.now()
    });
  }, [allSessions, allProfiles, user, profileMap]);

  // Load data from Supabase or LocalStorage
  useEffect(() => {
    fetchRanking();
    refreshTotalQuestions();
  }, [fetchRanking, refreshTotalQuestions]);

  // Save to localStorage as backup
  useEffect(() => {
    localStorage.setItem('weeklyData', JSON.stringify(weeklyData));
    localStorage.setItem('subjectsData', JSON.stringify(subjectsData));
    localStorage.setItem('dailySubjectsData', JSON.stringify(dailySubjectsData));
    localStorage.setItem('studiedDays', JSON.stringify(studiedDays));
    localStorage.setItem('dailyHistory', JSON.stringify(dailyHistory));
    localStorage.setItem('subjects', JSON.stringify(subjects));
    localStorage.setItem('dbStats', JSON.stringify(dbStats));
    localStorage.setItem('notebooks', JSON.stringify(notebooks));
    localStorage.setItem('savedFilters', JSON.stringify(savedFilters));
    localStorage.setItem('streak', streak.toString());
    if (lastStudyDate) localStorage.setItem('lastStudyDate', lastStudyDate);
  }, [
    weeklyData, 
    subjectsData, 
    dailySubjectsData, 
    studiedDays, 
    dailyHistory, 
    subjects, 
    dbStats, 
    notebooks, 
    savedFilters,
    streak,
    lastStudyDate
  ]);

  // Midnight reset check
  useEffect(() => {
    // Reset timers and accumulated seconds
    const performMidnightReset = (isStudyingNow: boolean) => {
      console.log('Midnight detected! Resetting daily timers...');

      if (isStudyingNow && user) {
        // Sync un-synced time to the previous day
        const syncAnchor = lastSyncAtRef.current;
        const unsyncedSecs = Math.floor((Date.now() - syncAnchor) / 1000);
        if (unsyncedSecs >= 1) {
          console.log(`[StudyContext] Midnight transition while studying! Syncing ${unsyncedSecs}s to previous day.`);
          supabase.from('study_sessions').insert([{
            user_id: user.id,
            subject: activeSubjectRef.current || 'Geral',
            duration_minutes: Math.ceil(unsyncedSecs / 60),
            duration_seconds: Math.floor(unsyncedSecs)
          }]);
        }
        // Reset sync anchor to now for the new day
        const now = Date.now();
        setLastSyncAt(now);
        lastSyncAtRef.current = now;
        localStorage.setItem('lastSyncAt', now.toString());
        // Reset session start to now so session counter restarts for new day
        setSessionStartedAt(now);
        sessionStartedAtRef.current = now;
        localStorage.setItem('sessionStartedAt', now.toString());
      } else {
        setSessionStartedAt(null);
        sessionStartedAtRef.current = null;
        localStorage.removeItem('sessionStartedAt');
      }

      setStopwatchTime(0);
      setStopwatchAccumulated(0);
      setStopwatchSessionSeconds(0);
      setDailySubjectsData([]);
      localStorage.setItem('dailySubjectsData', '[]');
    };

    const checkMidnight = () => {
      try {
        if (typeof window === 'undefined' || !window.localStorage || !user) return;
        
        const now = new Date();
        const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(now);
        const lastResetDate = localStorage.getItem('last_midnight_reset');

        if (lastResetDate && lastResetDate !== todayStr) {
          // IMPORTANT: Prevent race condition if user data hasn't been loaded into refs yet
          if (lastLoadedUserIdRef.current !== user.id) {
            return;
          }

          localStorage.setItem('last_midnight_reset', todayStr);
          
          const isStudyingNow = stopwatchActiveRef.current;
          performMidnightReset(isStudyingNow);
          
          // Check if streak is broken
          const [y, m, d] = todayStr.split('-').map(Number);
          const todayNoon = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
          const yesterdayBr = new Intl.DateTimeFormat('en-CA', { 
            timeZone: 'America/Sao_Paulo',
            year: 'numeric', month: '2-digit', day: '2-digit' 
          }).format(new Date(todayNoon.getTime() - 24 * 60 * 60 * 1000));
          
          if (lastStudyDateRef.current !== yesterdayBr && lastStudyDateRef.current !== todayStr && !isStudyingNow) {
            console.log('[StudyContext] Midnight check: Streak broken.');
            setStreak(0);
            supabase.from('profiles').update({ streak: 0 }).eq('id', user.id).then(() => {
              console.log('[StudyContext] Streak reset to 0 in DB (midnight)');
            });
          }
          
          // Reset increment flag for the new day
          hasIncrementedStreakTodayRef.current = false;

          // If studying during transition, automatically update streak for the new day
          if (isStudyingNow) {
            console.log('[StudyContext] Midnight transition while studying! Incrementing streak for new day.');
            updateStreak();
          }
          
          // New week check: if today is Monday OR if last reset was before the most recent Monday
          const brNow = getBrasiliaDate(now);
          const brDayOfWeek = brNow.getDay();
          const brDiffToMonday = brDayOfWeek === 0 ? 6 : brDayOfWeek - 1;
          const brMonday = new Date(brNow);
          brMonday.setDate(brNow.getDate() - brDiffToMonday);
          brMonday.setHours(0, 0, 0, 0);

          const lastReset = new Date(lastResetDate);
          if (lastReset.getTime() < brMonday.getTime()) {
            console.log('[StudyContext] New week detected. Resetting weekly data.');
            setWeeklyData([...INITIAL_DATA]);
            localStorage.setItem('weeklyData', JSON.stringify(INITIAL_DATA));
            setStudiedDays([]);
            localStorage.setItem('studiedDays', '[]');
          }

          // New week check automatically updates rankings
          fetchRanking(true);
        } else if (!lastResetDate) {
          localStorage.setItem('last_midnight_reset', todayStr);
        }
      } catch (e) {
        console.error('Error in midnight check:', e);
      }
    };

    checkMidnight(); // Run once on mount
    const interval = setInterval(checkMidnight, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [fetchRanking, user, isStudying, updateStreak, addStudyTime, syncStudyTimeToDb]);

  // Sync dailySubjectsData from DB on load if local is empty
  useEffect(() => {
    if (user && allSessions.length > 0 && dailySubjectsData.length === 0) {
      const now = new Date();
      const todayBrasilia = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(now);
      
      const myTodaySessions = allSessions.filter(s => {
        const date = new Date(s.created_at);
        const sessionDateBr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(date);
        return s.user_id === user.id && sessionDateBr === todayBrasilia;
      });

      if (myTodaySessions.length > 0) {
        const subjectMap: Record<string, number> = {};
        myTodaySessions.forEach(s => {
          const secs = s.duration_seconds ?? (s.duration_minutes * 60);
          const sub = s.subject || 'Geral';
          subjectMap[sub] = (subjectMap[sub] || 0) + secs;
        });
        
        const newData = Object.entries(subjectMap).map(([name, seconds]) => ({ name, seconds }));
        setDailySubjectsData(newData);
      }
    }
  }, [user, allSessions, dailySubjectsData.length]);

  // Presence Tracking - Subscription
  useEffect(() => {
    if (!user) return;

    console.log('[Presence] Setting up channel for user:', user.id);
    const channel = supabase.channel('online-soldiers', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    const syncPresence = () => {
      const state = channel.presenceState();
      const activeIds: string[] = [];
      const studyingIds: string[] = [];
      const metadata: Record<string, any> = {};
      const now = Date.now();
      
      Object.entries(state).forEach(([key, presences]: [string, any]) => {
        activeIds.push(key);
        const p = presences[0];
        if (p?.isStudying) {
          studyingIds.push(key);
        }
        metadata[key] = {
          isStudying: !!p?.isStudying,
          dailySeconds: p?.dailySeconds || p?.sessionSeconds || 0,
          sessionSeconds: p?.sessionSeconds || 0,
          totalSeconds: p?.totalSeconds || 0,
          timestamp: p?.timestamp || now,
          receivedAt: now,
          name: p?.name || 'Soldado',
          photo: p?.photo
        };
      });
      
      setOnlineUserIds(activeIds);
      setStudyingUserIds(studyingIds);
      setOnlineCount(activeIds.length);
      setPresenceMetadata(metadata);
    };

    channel
      .on('presence', { event: 'sync' }, syncPresence)
      .on('presence', { event: 'join' }, syncPresence)
      .on('presence', { event: 'leave' }, syncPresence)
      .subscribe((status) => {
        console.log('[Presence] Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setIsPresenceSubscribed(true);
        } else {
          setIsPresenceSubscribed(false);
        }
      });

    setPresenceChannel(channel);

    return () => {
      console.log('[Presence] Cleaning up channel');
      supabase.removeChannel(channel);
      setPresenceChannel(null);
      setIsPresenceSubscribed(false);
      setOnlineCount(0);
      setOnlineUserIds([]);
    };
  }, [user]);

  // Presence Tracking - Tracking Updates
  useEffect(() => {
    if (!presenceChannel || !isPresenceSubscribed || !user) return;

    const isStudying = stopwatchActive;
    const bestName = (user.name && user.name !== 'Soldado') ? user.name : (profileMap[user.id]?.name || 'Soldado');

    const trackPresence = async () => {
      try {
        await presenceChannel.track({
          isStudying,
          dailySeconds: todayTotalSecondsRef.current,
          sessionSeconds: currentSessionSecondsRef.current,
          totalSeconds: allTimeSecondsRef.current,
          timestamp: Date.now(),
          name: bestName,
          photo: user.photo,
          lastActive: new Date().toISOString(),
        });
      } catch (err) {
        console.error('[Presence] Error tracking:', err);
      }
    };

    trackPresence();

    // Periodic sync every 10 seconds to keep time accurate and ranking live
    const syncInterval = setInterval(trackPresence, 10000);

    return () => clearInterval(syncInterval);
  }, [user, presenceChannel, isPresenceSubscribed, stopwatchActive, profileMap, lastSyncTimestamp]);

  // stopwatchTime is no longer independently tracked — kept for API compatibility

  const daysSinceLastStudy = useMemo(() => {
    if (!lastStudyDate) return 0;
    
    const now = new Date();
    const todayBr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(now);
    
    if (lastStudyDate === todayBr) return 0;
    
    // Parse dates manually to avoid timezone issues
    const [y1, m1, d1] = lastStudyDate.split('-').map(Number);
    const [y2, m2, d2] = todayBr.split('-').map(Number);
    
    const dLast = new Date(y1, m1 - 1, d1, 12, 0, 0); 
    const dToday = new Date(y2, m2 - 1, d2, 12, 0, 0);
    
    const diffTime = Math.abs(dToday.getTime() - dLast.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }, [lastStudyDate]);

  return (
    <StudyContext.Provider value={{ 
      weeklyData: liveWeeklyData, 
      subjectsData, 
      dailySubjectsData,
      studiedDays,
      addStudyTime, 
      syncStudyTimeToDb,
      totalHours, 
      weeklyTotalHours,
      todayTotalHours,
      formatTotalTime,
      formatFriendlyTime,
      formatSeconds,
      getGlobalRanking,
      fetchRanking,
      isRankingLoading,
      dbStats,
      rankingData,
      resetData,
      subjects,
      addSubject,
      deleteSubject,
      stopwatchActive,
      stopwatchTime,
      stopwatchAccumulated,
      stopwatchSessionSeconds,
      toggleStopwatch,
      resetStopwatch,
      activeSubject,
      setActiveSubject,
      onlineCount,
      onlineUserIds,
      studyingUserIds,
      todayTotalSeconds,
      allTimeSeconds,
      weeklyTotalSeconds,
      monthlyTotalSeconds,
      totalStudyTime,
      isStudying,
      weeklyGoalHours,
      updateWeeklyGoalHours,
      questionAnswers,
      recordQuestionAnswer,
      streak,
      lastStudyDate,
      daysSinceLastStudy,
      updateStreak,
      getRank,
      getRankIcon,
      getNextRank,
      getRankProgress,
      dailyHistory,
      notebooks,
      addNotebook,
      updateNotebook,
      deleteNotebook,
      addQuestionsToNotebook,
      savedFilters,
      saveFilter,
      deleteSavedFilter,
      totalBankQuestions,
      refreshTotalQuestions
    }}>
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
}
