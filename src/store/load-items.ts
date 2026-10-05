import { DATA_PATH } from './constants';
import type { QuizItem, QuizManifest, QuizData } from './types';

const parseKwyz = (contents: string, file: string): QuizData[] => {
  const blocks = contents
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
  blocks.forEach((block, index) => {
    if (block.length === 1) {
      topic = block[0];
    } else if (block.length === 2) {
      items.push({ topic, question: block[0], answer: block[1] });
    } else {
      throw new Error(
        `Unable to parse ${file}: expected a topic line or question-answer pair in block ${index + 1}.`
      );
    }
  });

  return items;
};

export const loadItems = async (): Promise<QuizItem[]> => {
  const manifestResponse = await fetch(`${DATA_PATH}index.json`);
  if (!manifestResponse.ok) {
    throw new Error(`Unable to load quiz manifest: ${manifestResponse.status}`);
  }

  const manifest = await manifestResponse.json() as QuizManifest;
  const itemGroups = await Promise.all(
    manifest.files.map(async file => {
      const response = await fetch(`${DATA_PATH}${encodeURIComponent(file)}`);
      if (!response.ok) {
        throw new Error(`Unable to load ${file}: ${response.status}`);
      }

      if (file.toLowerCase().endsWith('.json')) {
        return await response.json() as QuizData[];
      }

      const contents = await response.text();
      if (contents.trimStart().startsWith('[')) {
        return JSON.parse(contents) as QuizData[];
      }
      return parseKwyz(contents, file);
    })
  );

  return itemGroups.flat().map((item, index) => ({
    ...item,
    id: index + 1,
    topic: item?.topic ?? '',
    confidence: 0
  }));
};
