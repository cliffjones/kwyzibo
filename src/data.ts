import type { QuizItem } from './types';

const DATA_PATH = '/data/';

type QuizManifest = {
  files: string[];
};

type QuizData = {
  question: string;
  answer: string;
  topic?: string;
};

export const loadItems = async (): Promise<QuizItem[]> => {
  const manifestResponse = await fetch(`${DATA_PATH}index.json`);
  if (!manifestResponse.ok) {
    throw new Error(`Unable to load question manifest: ${manifestResponse.status}`);
  }

  const manifest = await manifestResponse.json() as QuizManifest;
  const questionGroups = await Promise.all(
    manifest.files.map(async file => {
      const response = await fetch(`${DATA_PATH}${encodeURIComponent(file)}`);
      if (!response.ok) {
        throw new Error(`Unable to load ${file}: ${response.status}`);
      }

      return await response.json() as QuizData[];
    })
  );

  return questionGroups.flat().map((question, index) => ({
    ...question,
    id: index + 1,
    topic: question?.topic ?? '',
    confidence: 0
  }));
};
