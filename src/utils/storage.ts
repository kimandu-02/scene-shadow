import { Sentence, SentenceProgress } from '../types';
import { DEFAULT_SENTENCES, INITIAL_PROGRESS } from '../data/defaultData';

const SENTENCES_STORAGE_KEY = 'scene_shadow_dm4_sentences_v5';
const PROGRESS_STORAGE_KEY = 'scene_shadow_dm4_progress_v5';

export function loadStoredSentences(): Sentence[] {
  try {
    // If old versions exist, clean them up so latest timestamps apply
    localStorage.removeItem('scene_shadow_dm4_sentences_v1');
    localStorage.removeItem('scene_shadow_dm4_sentences_v2');
    localStorage.removeItem('scene_shadow_dm4_sentences_v3');
    localStorage.removeItem('scene_shadow_dm4_sentences_v4');
    const raw = localStorage.getItem(SENTENCES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read sentences from localStorage:', err);
  }
  return DEFAULT_SENTENCES;
}

export function saveStoredSentences(sentences: Sentence[]): void {
  try {
    localStorage.setItem(SENTENCES_STORAGE_KEY, JSON.stringify(sentences));
  } catch (err) {
    console.warn('Could not save sentences to localStorage:', err);
  }
}

export function loadStoredProgress(): Record<number, SentenceProgress> {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read progress from localStorage:', err);
  }
  return { ...INITIAL_PROGRESS };
}

export function saveStoredProgress(progress: Record<number, SentenceProgress>): void {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.warn('Could not save progress to localStorage:', err);
  }
}

export function resetStoredData(): { sentences: Sentence[]; progress: Record<number, SentenceProgress> } {
  try {
    localStorage.removeItem(SENTENCES_STORAGE_KEY);
    localStorage.removeItem(PROGRESS_STORAGE_KEY);
  } catch (err) {
    console.warn('Could not clear storage:', err);
  }
  return {
    sentences: DEFAULT_SENTENCES,
    progress: { ...INITIAL_PROGRESS },
  };
}
