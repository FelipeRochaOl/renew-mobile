export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type LearningLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface ProfessionRisk {
  profession: string;
  riskLevel: RiskLevel;
  description: string;
  trends: string[];
}

export interface LearningModule {
  id: string;
  title: string;
  durationHours: number;
  skills: string[];
  externalLink?: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  targetProfession: string;
  forCurrentProfession: boolean;
  level: LearningLevel;
  modules: LearningModule[];
}

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: "worker" | "company" | "admin";
  password?: string;
  currentProfession?: string;
  region?: string;
  educationLevel?: string;
}

export interface RecommendationsForUserResponse {
  user: User;
  professionRisk: ProfessionRisk;
  suggestedPaths: LearningPath[];
}
