import React from 'react';
import { EducationalNoticeCard } from '../components/EducationalNoticeCard';
import { MOVIE_SETTINGS } from '../data/defaultData';
import { Play, Settings2, Sparkles, Volume2, Mic, Film } from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
  onEdit: () => void;
  totalSentences: number;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  onEdit,
  totalSentences,
}) => {
  return (
    <div className="w-full flex flex-col items-center gap-6 py-2 px-1">
      {/* Hero Header */}
      <div className="w-full text-center space-y-2 pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-full text-xs font-semibold text-amber-900 shadow-xs mb-1">
          <Film className="w-3.5 h-3.5 text-blue-600" />
          <span>Movie-Clip English Shadowing</span>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Scene Shadow: <br />
          <span className="text-[#4267B2]">{MOVIE_SETTINGS.titleEn}</span>
        </h1>
        <p className="text-sm font-medium text-slate-600">
          슈퍼배드 4 · 영화 대사 쉐도잉 훈련
        </p>

        <p className="text-base text-slate-800 font-semibold bg-amber-50 border border-amber-200 py-2 px-4 rounded-xl inline-block mt-1">
          "Listen. Copy. Speak at the same time."
        </p>
      </div>

      {/* What is Shadowing Card */}
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-bold">
            What is Shadowing? / 쉐도잉이란?
          </h2>
        </div>

        <div className="space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-blue-50 text-[#4267B2] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
              1
            </div>
            <div>
              <p className="font-semibold text-slate-900">Listen & Echo (동시 따라 말하기)</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Listen to the native actor and repeat almost at the same time, copying like a shadow.
                (원어민 배우의 목소리를 들으며 그림자처럼 0.5초 차이로 즉시 따라 말합니다.)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
              2
            </div>
            <div>
              <p className="font-semibold text-slate-900">Rhythm & Intonation (억양과 리듬 체화)</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Replicate the character's real emotions, word stress, and melody.
                (단순한 발음뿐 아니라 강조 단어와 높낮이, 감정선까지 동일하게 복제합니다.)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
              3
            </div>
            <div>
              <p className="font-semibold text-slate-900">Vocal Muscle Memory (발성 근육 훈련)</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Train your mouth and tongue for fast, authentic English conversational flow.
                (자연스러운 호흡과 혀의 움직임을 익혀 자신감 있는 실전 영어 회화를 완성합니다.)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Target Scene Info */}
      <div className="w-full bg-blue-50/70 border border-blue-200 rounded-2xl p-4 text-xs space-y-1.5 text-slate-700">
        <div className="flex items-center justify-between font-semibold text-[#4267B2]">
          <span>Scene: Gru's New Identity</span>
          <span className="bg-white/90 px-2 py-0.5 rounded text-[11px] border border-blue-200">
            {totalSentences} Practice Lines
          </span>
        </div>
        <p className="text-slate-600 leading-relaxed">
          {MOVIE_SETTINGS.sceneDescription}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="w-full space-y-3 pt-1">
        <button
          onClick={onStart}
          className="w-full min-h-[54px] bg-[#FFD93D] hover:bg-yellow-400 active:scale-[0.98] text-slate-900 font-extrabold text-lg rounded-2xl shadow-md transition-all flex flex-col items-center justify-center py-2.5 px-4 cursor-pointer border border-yellow-400/80"
        >
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 fill-current" />
            <span>Start Practice</span>
          </div>
          <span className="text-xs font-semibold text-slate-800 -mt-0.5">
            연습 시작 ({totalSentences}문장)
          </span>
        </button>

        <div className="flex justify-center">
          <button
            onClick={onEdit}
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Sentences / 문장 편집</span>
          </button>
        </div>
      </div>

      {/* Educational Use & Source Card */}
      <div className="w-full pt-2">
        <EducationalNoticeCard />
      </div>
    </div>
  );
};
