import { QuizItem } from './types';

export const isQuizItem = (value: unknown): value is QuizItem => {
  if (typeof value !== 'object' || value == null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return typeof item.id === 'number'
    && Number.isInteger(item.id)
    && typeof item.topic === 'string'
    && typeof item.confidence === 'number'
    && Number.isInteger(item.confidence)
    && item.confidence >= 0
    && item.confidence <= 5
    && typeof item.question === 'string'
    && typeof item.answer === 'string';
};
