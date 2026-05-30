'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface ImprovementSettings {
  name: string;
  targetHits: number;
  windowSize: number;
  addCorrectionTime: boolean;
}

interface AnswerRecord {
  isCorrect: boolean;
  timeSpent: number;
}

interface ImprovementContextType {
  isActive: boolean;
  isCompleted: boolean;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  settings: ImprovementSettings;
  startTime: number | null;
  elapsedTime: number;
  answers: AnswerRecord[];
  currentHitsInWindow: number;
  totalAnswered: number;
  startImprovement: (settings: ImprovementSettings) => void;
  stopImprovement: () => void;
  recordImprovementAnswer: (isCorrect: boolean, timeSpent: number) => void;
  resetImprovement: () => void;
}

const INITIAL_SETTINGS: ImprovementSettings = {
  name: '',
  targetHits: 5,
  windowSize: 5,
  addCorrectionTime: false,
};

const ImprovementContext = createContext<ImprovementContextType | undefined>(undefined);

export function ImprovementProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [settings, setSettings] = useState<ImprovementSettings>(INITIAL_SETTINGS);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);

  // Calculate stats
  const totalAnswered = answers.length;
  const recentAnswers = answers.slice(-settings.windowSize);
  const currentHitsInWindow = recentAnswers.filter(a => a.isCorrect).length;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && !isCompleted && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isCompleted, startTime]);

  const startImprovement = useCallback((newSettings: ImprovementSettings) => {
    setSettings(newSettings);
    setIsActive(true);
    setIsCompleted(false);
    setStartTime(Date.now());
    setElapsedTime(0);
    setAnswers([]);
  }, []);

  const stopImprovement = useCallback(() => {
    setIsActive(false);
    setIsCompleted(false);
  }, []);

  const resetImprovement = useCallback(() => {
    setStartTime(Date.now());
    setElapsedTime(0);
    setAnswers([]);
    setIsCompleted(false);
  }, []);

  const recordImprovementAnswer = useCallback((isCorrect: boolean, timeSpent: number) => {
    if (!isActive || isCompleted) return;

    setAnswers(prev => {
      const newAnswers = [...prev, { isCorrect, timeSpent }];
      
      const window = newAnswers.slice(-settings.windowSize);
      const hits = window.filter(a => a.isCorrect).length;
      
      if (hits >= settings.targetHits && window.length >= settings.windowSize) {
        setIsCompleted(true);
        setIsModalOpen(true);
      }
      
      return newAnswers;
    });
  }, [isActive, isCompleted, settings]);

  return (
    <ImprovementContext.Provider value={{
      isActive,
      isCompleted,
      isModalOpen,
      setIsModalOpen,
      settings,
      startTime,
      elapsedTime,
      answers,
      currentHitsInWindow,
      totalAnswered,
      startImprovement,
      stopImprovement,
      recordImprovementAnswer,
      resetImprovement,
    }}>
      {children}
    </ImprovementContext.Provider>
  );
}

export function useImprovement() {
  const context = useContext(ImprovementContext);
  if (context === undefined) {
    throw new Error('useImprovement must be used within an ImprovementProvider');
  }
  return context;
}
