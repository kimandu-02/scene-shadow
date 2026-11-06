export interface MovieSettings {
  titleEn: string;
  titleKo: string;
  releaseYear: string;
  director: string;
  screenplay: string;
  production: string;
  distribution: string;
  sceneDescription: string;
  youtubeTitle: string;
  youtubeChannel: string;
  youtubeUrl: string;
  videoId: string;
  start: number;
  end: number;
  madeBy: string;
}

export interface Sentence {
  id: number;
  speaker: string;
  text: string;
  korean: string;
  stress: string[];
  start: number;
  end: number;
}

export type SelfCheckScore = '😀' | '🙂' | '😐' | null;

export interface SentenceProgress {
  id: number;
  plays: number;
  recordings: number;
  selfCheck: [SelfCheckScore, SelfCheckScore, SelfCheckScore];
  status: 'new' | 'practiced' | 'done';
}

export type ShadowingStep = 1 | 2 | 3 | 4;

export type ScreenType = 'start' | 'list' | 'practice' | 'edit' | 'finish';

// YouTube IFrame Player API declarations
export interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  setPlaybackRate(suggestedRate: number): void;
  getPlaybackRate(): number;
  getAvailablePlaybackRates(): number[];
  destroy(): void;
}

export interface YTPlayerOptions {
  height?: string | number;
  width?: string | number;
  videoId: string;
  playerVars?: Record<string, any>;
  events?: {
    onReady?: (event: { target: YTPlayer }) => void;
    onStateChange?: (event: { data: number; target: YTPlayer }) => void;
    onError?: (event: { data: number; target: YTPlayer }) => void;
  };
}

declare global {
  interface Window {
    YT?: {
      Player: new (elementId: string | HTMLElement, options: YTPlayerOptions) => YTPlayer;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}
