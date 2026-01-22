export interface WordDef {
  id: string;
  word: string;
  translation: string;
  original: string; // The word as it appears in text (clean)
  category: string;
  difficultyLevel?: string;
  partOfSpeech: string;
  example: string;
  exampleTranslation: string;
  definition?: string;
  storyTitle?: string;
}

export interface StoryData {
  id: number;
  title: string;
  titleTranslation?: string;
  difficultyLevel: string;
  genre: string; // New field
  isAIGenerated: boolean;
  createdDate: string;
  storyText: string;
  storyTranslation: string;
  vocabulary: WordDef[];
  imageUrl?: string;
  liked: boolean;
}

export interface StorySummary {
  id: number;
  title: string;
  difficultyLevel: string;
  genre: string; // New field
  isAIGenerated: boolean;
  createdDate: string;
  active: boolean; // UI state
  liked: boolean; // UI state
}

export function getGenreIcon(genre?: string): string {
  const icons: { [key: string]: string } = {
    'Adventure': 'ar',
    'Fantasy': 'mage',
    'Sci-Fi': 'robot',
    'Mystery': 'detective',
    'Horror': 'zombie',
    'Romance': 'heart',
    'History': 'scroll',
    'Comedy': 'clown',
    'Drama': 'masks',
    'Crime': 'police',
    'Biography': 'book',
    'General': 'book'
  };

  // Emoji mapping fallback if simple icons preferred
  const emojis: { [key: string]: string } = {
    'Adventure': '🗺️',
    'Fantasy': '🧙',
    'Sci-Fi': '👽',
    'Mystery': '🔍',
    'Horror': '👻',
    'Romance': '💖',
    'History': '📜',
    'Comedy': '😂',
    'Drama': '🎭',
    'Crime': '🚓',
    'Biography': '📖',
    'General': '📚'
  };

  return emojis[genre || 'General'] || '📚';
}

import { API_BASE_URL } from '../lib/config';
export { API_BASE_URL };


export async function fetchStory(date?: string, id?: number): Promise<StoryData> {
  let url = `${API_BASE_URL}/api/story`;

  const params = new URLSearchParams();
  if (id) params.append('id', id.toString());
  if (date) params.append('date', date);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  console.log('🚀 Fetching story from API:', url);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error('❌ Failed to fetch story:', response.statusText);
      throw new Error(`Failed to fetch story: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Story data received:', data);
    return data;
  } catch (error) {
    console.error('❌ Error in fetchStory:', error);
    throw error;
  }
}

export async function fetchStories(): Promise<StorySummary[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stories`);
    if (!response.ok) {
      throw new Error(`Failed to fetch stories: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching stories:', error);
    return [];
  }
}


export async function fetchKnownWords(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/vocabulary/known`);
    if (!response.ok) {
      throw new Error(`Failed to fetch known words: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching known words:', error);
    return [];
  }
}

export async function markWordAsKnown(wordId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/vocabulary/mark`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ wordId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to mark word as known: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error marking word as known:', error);
    throw error;
  }
}

export async function fetchKnownWordsDetails(): Promise<WordDef[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/vocabulary/my-list-details`);
    if (!response.ok) {
      throw new Error(`Failed to fetch known words details: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching known words details:', error);
    return [];
  }
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  const data = await response.json();
  return data.url; // Returns relative URL like /uploads/xyz.jpg
}

export async function updateStoryImage(storyId: number, imageUrl: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/story/${storyId}/image`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageUrl }),
  });

  if (!response.ok) {
    throw new Error('Failed to update story image');
  }
}

export async function generateStory(
  topic: string,
  difficulty: string,
  vocabCount: number,
  genre: string,
  knownWords?: string[]
): Promise<{ id: number; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/story/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic,
      difficulty,
      vocabCount,
      genre,
      knownWords: knownWords || []
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate story');
  }

  return await response.json();
}
