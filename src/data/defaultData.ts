import { MovieSettings, Sentence, SentenceProgress } from '../types';

export const MOVIE_SETTINGS: MovieSettings = {
  titleEn: 'Despicable Me 4',
  titleKo: '슈퍼배드 4',
  releaseYear: '2024',
  director: 'Chris Renaud',
  screenplay: 'Mike White, Ken Daurio',
  production: 'Illumination',
  distribution: 'Universal Pictures',
  sceneDescription: 'Gru and his family receive new identities to hide from a dangerous villain. (그루와 가족들이 악당을 피해 새로운 신분을 부여받는 장면)',
  youtubeTitle: 'Despicable Me 4 Movie Clip - Gru and His Family Get New Identities (2024)',
  youtubeChannel: 'Rotten Tomatoes Family',
  youtubeUrl: 'https://www.youtube.com/watch?v=d03MlypePfs',
  videoId: 'd03MlypePfs',
  start: 0,
  end: 58,
  madeBy: '김민서',
};

export const DEFAULT_SENTENCES: Sentence[] = [
  {
    id: 1,
    speaker: 'Silas',
    text: 'All right, now down to business.',
    korean: '좋아요, 이제 본론으로 들어가죠.',
    stress: ['business'],
    start: 0.0,
    end: 2.3,
  },
  {
    id: 2,
    speaker: 'Gru',
    text: 'Is that really necessary?',
    korean: '그게 정말 필요한가요?',
    stress: ['really', 'necessary'],
    start: 7.0,
    end: 8.0,
  },
  {
    id: 3,
    speaker: 'Silas',
    text: "It's not up for debate.",
    korean: '이건 논의할 문제가 아닙니다.',
    stress: ['not', 'debate'],
    start: 9.0,
    end: 10.5,
  },
  {
    id: 4,
    speaker: 'Lucy',
    text: 'Did you choose that because you knew I cut my own hair?',
    korean: '제가 직접 머리를 자른다는 걸 알고 그걸 선택하신 건가요?',
    stress: ['choose', 'knew'],
    start: 20.0,
    end: 23.0,
  },
  {
    id: 5,
    speaker: 'Margo',
    text: 'Oh, come on!',
    korean: '아, 말도 안 돼요!',
    stress: ['come', 'on'],
    start: 38.0,
    end: 40.0,
  },
  {
    id: 6,
    speaker: 'Lucy',
    text: 'There are worse names than Brie.',
    korean: '브리보다 더 별로인 이름도 있어.',
    stress: ['worse', 'names'],
    start: 40.0,
    end: 41.5,
  },
  {
    id: 7,
    speaker: 'Margo',
    text: 'Imagine being named Blanche.',
    korean: '블랑슈라는 이름을 가졌다고 상상해 봐.',
    stress: ['imagine', 'Blanche'],
    start: 48.0,
    end: 50.0,
  },
  {
    id: 8,
    speaker: 'Lucy',
    text: "I'll get used to it.",
    korean: '익숙해질 거야.',
    stress: ['get', 'used'],
    start: 56.5,
    end: 59.0,
  },
];

export const INITIAL_PROGRESS: Record<number, SentenceProgress> = {};
DEFAULT_SENTENCES.forEach((s) => {
  INITIAL_PROGRESS[s.id] = {
    id: s.id,
    plays: 0,
    recordings: 0,
    selfCheck: [null, null, null],
    status: 'new',
  };
});
