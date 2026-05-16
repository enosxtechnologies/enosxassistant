import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface Preferences {
  voiceEnabled: boolean;
  darkMode: boolean;
  autoSuggest: boolean;
  notificationsEnabled: boolean;
  privacyLevel: 'strict' | 'normal' | 'relaxed';
}

interface Traits {
  creativity: number;
  analyticalThinking: number;
  speedVsPrecision: number;
  riskTolerance: number;
  collaboration: number;
}

interface EnoshProfile {
  id: string;
  name: string;
  createdAt: Date;
  lastActive: Date;
  totalSessions: number;
  communicationStyle: 'formal' | 'casual' | 'technical' | 'mixed';
  preferredLanguage: string;
  timezone: string;
  favoriteCommands: { command: string; count: number }[];
  activeHours: number[];
  sessionDuration: number;
  expertiseAreas: { area: string; level: number; lastUsed: Date }[];
  learningGoals: string[];
  completedGoals: string[];
  preferences: Preferences;
  traits: Traits;
  personalFacts: { fact: string; addedAt: Date; importance: number }[];
  goals: { goal: string; status: 'active' | 'completed' | 'paused'; createdAt: Date }[];
  interests: { interest: string; frequency: number }[];
  commandPatterns: {
    totalCommands: number;
    averageCommandLength: number;
    errorRate: number;
    successRate: number;
  };
  suggestedFeatures: { feature: string; confidence: number; reason: string }[];
  lastSuggestionTime: Date;
}

interface EnoshLearningContextType {
  profile: EnoshProfile | null;
  recordInteraction: (command: string, duration: number, success: boolean) => void;
  addPersonalFact: (fact: string, importance?: number) => void;
  addGoal: (goal: string) => void;
  completeGoal: (goalIndex: number) => void;
  addInterest: (interest: string) => void;
  updatePreferences: (prefs: Partial<Preferences>) => void;
  updateTraits: (traits: Partial<Traits>) => void;
  generateAdaptiveSuggestions: () => string[];
  getEnoshInsights: () => string;
  exportProfile: () => string;
  importProfile: (data: string) => void;
}

const EnoshLearningContext = createContext<EnoshLearningContextType | undefined>(undefined);

const DEFAULT_PROFILE: EnoshProfile = {
  id: 'enosh-001',
  name: 'Enosh',
  createdAt: new Date(),
  lastActive: new Date(),
  totalSessions: 1,
  communicationStyle: 'technical',
  preferredLanguage: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  favoriteCommands: [],
  activeHours: [],
  sessionDuration: 0,
  expertiseAreas: [],
  learningGoals: [],
  completedGoals: [],
  preferences: {
    voiceEnabled: true,
    darkMode: true,
    autoSuggest: true,
    notificationsEnabled: true,
    privacyLevel: 'normal',
  },
  traits: {
    creativity: 50,
    analyticalThinking: 50,
    speedVsPrecision: 50,
    riskTolerance: 50,
    collaboration: 50,
  },
  personalFacts: [],
  goals: [],
  interests: [],
  commandPatterns: {
    totalCommands: 0,
    averageCommandLength: 0,
    errorRate: 0,
    successRate: 100,
  },
  suggestedFeatures: [],
  lastSuggestionTime: new Date(),
};

export const EnoshLearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<EnoshProfile | null>(null);

  // Load profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('enoshProfile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        // Convert string dates back to Date objects
        parsed.createdAt = new Date(parsed.createdAt);
        parsed.lastActive = new Date(parsed.lastActive);
        parsed.lastSuggestionTime = new Date(parsed.lastSuggestionTime);
        parsed.personalFacts = parsed.personalFacts.map((f: any) => ({ ...f, addedAt: new Date(f.addedAt) }));
        parsed.goals = parsed.goals.map((g: any) => ({ ...g, createdAt: new Date(g.createdAt) }));
        setProfile(parsed);
      } catch (e) {
        console.error('Failed to parse Enosh profile', e);
        setProfile(DEFAULT_PROFILE);
      }
    } else {
      setProfile(DEFAULT_PROFILE);
    }
  }, []);

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    if (profile) {
      localStorage.setItem('enoshProfile', JSON.stringify(profile));
    }
  }, [profile]);

  const recordInteraction = useCallback((command: string, duration: number, success: boolean) => {
    setProfile(prev => {
      if (!prev) return null;

      const now = new Date();
      const hour = now.getHours();
      
      // Update active hours
      const newActiveHours = [...prev.activeHours];
      if (!newActiveHours.includes(hour)) {
        newActiveHours.push(hour);
      }

      // Update favorite commands
      const newFavoriteCommands = [...prev.favoriteCommands];
      const cmdIndex = newFavoriteCommands.findIndex(c => c.command === command);
      if (cmdIndex >= 0) {
        newFavoriteCommands[cmdIndex].count += 1;
      } else {
        newFavoriteCommands.push({ command, count: 1 });
      }
      newFavoriteCommands.sort((a, b) => b.count - a.count);

      // Update patterns
      const totalCmds = prev.commandPatterns.totalCommands + 1;
      const newSuccessRate = ((prev.commandPatterns.successRate * prev.commandPatterns.totalCommands) + (success ? 100 : 0)) / totalCmds;
      const newErrorRate = 100 - newSuccessRate;
      const newAvgLen = ((prev.commandPatterns.averageCommandLength * prev.commandPatterns.totalCommands) + command.length) / totalCmds;

      return {
        ...prev,
        lastActive: now,
        activeHours: newActiveHours,
        favoriteCommands: newFavoriteCommands.slice(0, 20),
        commandPatterns: {
          totalCommands: totalCmds,
          averageCommandLength: newAvgLen,
          successRate: newSuccessRate,
          errorRate: newErrorRate,
        }
      };
    });
  }, []);

  const addPersonalFact = useCallback((fact: string, importance: number = 50) => {
    setProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        personalFacts: [...prev.personalFacts, { fact, addedAt: new Date(), importance }]
      };
    });
  }, []);

  const addGoal = useCallback((goal: string) => {
    setProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        learningGoals: [...prev.learningGoals, goal],
        goals: [...prev.goals, { goal, status: 'active', createdAt: new Date() }]
      };
    });
  }, []);

  const completeGoal = useCallback((goalIndex: number) => {
    setProfile(prev => {
      if (!prev) return null;
      const newGoals = [...prev.goals];
      if (newGoals[goalIndex]) {
        newGoals[goalIndex].status = 'completed';
      }
      const goalText = newGoals[goalIndex]?.goal;
      return {
        ...prev,
        goals: newGoals,
        completedGoals: goalText ? [...prev.completedGoals, goalText] : prev.completedGoals
      };
    });
  }, []);

  const addInterest = useCallback((interest: string) => {
    setProfile(prev => {
      if (!prev) return null;
      const newInterests = [...prev.interests];
      const idx = newInterests.findIndex(i => i.interest.toLowerCase() === interest.toLowerCase());
      if (idx >= 0) {
        newInterests[idx].frequency += 1;
      } else {
        newInterests.push({ interest, frequency: 1 });
      }
      return { ...prev, interests: newInterests };
    });
  }, []);

  const updatePreferences = useCallback((prefs: Partial<Preferences>) => {
    setProfile(prev => {
      if (!prev) return null;
      return { ...prev, preferences: { ...prev.preferences, ...prefs } };
    });
  }, []);

  const updateTraits = useCallback((traits: Partial<Traits>) => {
    setProfile(prev => {
      if (!prev) return null;
      return { ...prev, traits: { ...prev.traits, ...traits } };
    });
  }, []);

  const generateAdaptiveSuggestions = useCallback(() => {
    if (!profile) return [];
    const suggestions: string[] = [];
    
    if (profile.commandPatterns.totalCommands > 10 && profile.commandPatterns.successRate < 80) {
      suggestions.push("I noticed some command errors. Would you like a quick tutorial on advanced syntax?");
    }
    
    if (profile.activeHours.length > 0) {
      const currentHour = new Date().getHours();
      if (profile.activeHours.includes(currentHour)) {
        suggestions.push("Welcome back! You're usually very productive at this hour. Ready to continue your goals?");
      }
    }

    if (profile.goals.filter(g => g.status === 'active').length === 0) {
      suggestions.push("You don't have any active goals. Want to set a new learning objective for today?");
    }

    return suggestions.length > 0 ? suggestions : ["System ready for deployment. What's the focus today?"];
  }, [profile]);

  const getEnoshInsights = useCallback(() => {
    if (!profile) return "No profile data available.";
    
    const traits = Object.entries(profile.traits)
      .map(([k, v]) => `  ${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}/100`)
      .join('\n');

    const topCmds = profile.favoriteCommands
      .slice(0, 5)
      .map(c => `  • ${c.command} (${c.count}x)`)
      .join('\n');

    const facts = profile.personalFacts
      .slice(-5)
      .map(f => `  • ${f.fact}`)
      .join('\n');

    return `
=== ENOSH PROFILE INSIGHTS ===
Name: ${profile.name}
Total Sessions: ${profile.totalSessions}
Communication Style: ${profile.communicationStyle}
Last Active: ${profile.lastActive.toLocaleString()}

PERSONALITY TRAITS:
${traits}

COMMAND PATTERNS:
  Total Commands: ${profile.commandPatterns.totalCommands}
  Success Rate: ${profile.commandPatterns.successRate.toFixed(1)}%
  Avg Command Length: ${Math.round(profile.commandPatterns.averageCommandLength)} chars

TOP COMMANDS:
${topCmds || '  No commands recorded yet.'}

PERSONAL FACTS:
${facts || '  No facts recorded yet.'}

ACTIVE GOALS:
${profile.goals.filter(g => g.status === 'active').map(g => `  ☐ ${g.goal}`).join('\n') || '  No active goals.'}
    `.trim();
  }, [profile]);

  const exportProfile = useCallback(() => {
    return JSON.stringify(profile);
  }, [profile]);

  const importProfile = useCallback((data: string) => {
    try {
      const parsed = JSON.parse(data);
      setProfile(parsed);
    } catch (e) {
      console.error('Failed to import profile', e);
    }
  }, []);

  return (
    <EnoshLearningContext.Provider
      value={{
        profile,
        recordInteraction,
        addPersonalFact,
        addGoal,
        completeGoal,
        addInterest,
        updatePreferences,
        updateTraits,
        generateAdaptiveSuggestions,
        getEnoshInsights,
        exportProfile,
        importProfile,
      }}
    >
      {children}
    </EnoshLearningContext.Provider>
  );
};

export const useEnoshLearning = () => {
  const context = useContext(EnoshLearningContext);
  if (context === undefined) {
    throw new Error('useEnoshLearning must be used within an EnoshLearningProvider');
  }
  return context;
};
