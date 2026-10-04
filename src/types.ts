export type QuizItem = {
  id: number;
  topic: string;
  confidence: number;
  question: string;
  answer: string;
};

export type ConfidenceRating = {
  icon: string;
  label: string;
};
