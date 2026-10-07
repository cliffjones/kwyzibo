export type QuizManifest = {
  files: string[];
};

export type QuizData = {
  question: string;
  answer: string;
  topic?: string;
};

export type QuizItem = {
  id: number;
  topic: string;
  question: string;
  answer: string;
  confidence: number;
};

export type AppState = {
  items: QuizItem[];
  customData: string;
  initializing: boolean;
  sourcePath: string;
  selectedTopics: string[];
  remainingIds: number[];
  currentId: number | null;
};
