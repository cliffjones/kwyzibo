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
  confidence: number;
  question: string;
  answer: string;
};

export type AppState = {
  items: QuizItem[];
  remainingIds: number[];
  currentId: number | null;
};
