import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

type BehaviorData = {
  mouseMovements: number[];
  keystrokePatterns: number[];
  activityShifts: number[];
  inactivePeriods: number[];
  typingMetrics: {
    speed: number;
    averageSpeed: number;
    discrepancy: number;
    keystrokes: number[];
    intervals: number[];
  };
  suspiciousPatterns?: {
    tabSwitchCount: number;
    inactivityCount: number;
    erraticMovementScore: number;
    keystrokePatternScore: number;
    copyPasteCount: number;
  };
};

type StudentData = {
  id: string;
  name: string;
  email: string;
  score: number;
  timeSpent: number;
  submissionTime: string;
  riskScore: number;
  behaviorFlags: string[];
  status: string;
  behavior: BehaviorData;
};

// Add these at the top of your component
interface MouseStats {
  position: { x: number; y: number };
  speed: number;
  distance: number;
  variance: number;
}

// This component tracks student behavior during exams
const StudentDataCollector = () => {
  // Disabled monitoring functionality
  return null;
};

export default StudentDataCollector;
