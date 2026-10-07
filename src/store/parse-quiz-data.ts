import { isQuizData } from './is-quiz-data';
import { QuizData } from './types';

export const parseQuizData = (data: string): QuizData[] => {
  // If the data looks like JSON, treat it as such.
  if (data.trimStart().startsWith('[')) {
    const parsedData = JSON.parse(data);
    if (Array.isArray(parsedData) && parsedData.every(isQuizData)) {
      return parsedData;
    }
  }

  const blocks = data
    .split(/\r?\n/)
    .reduce<string[][]>((result, line) => {
      if (line.trim() === '') {
        if (result[result.length - 1]?.length) {
          result.push([]);
        }
      } else {
        if (result.length === 0) {
          result.push([]);
        }
        result[result.length - 1].push(line.trim());
      }
      return result;
    }, [])
    .filter(block => block.length > 0);

  const items: QuizData[] = [];
  let topic = '';
  blocks.forEach((block) => {
    if (block.length === 1) {
      topic = block[0];
    } else {
      items.push({ topic, question: block[0], answer: block[1] });
    }
  });

  return items;
};
