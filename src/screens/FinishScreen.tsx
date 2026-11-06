import React from 'react';
import { Sentence, SentenceProgress } from '../types';
import { MOVIE_SETTINGS } from '../data/defaultData';
import { Sparkles, Trophy, RotateCcw, List, ArrowRight, Mic, CheckCircle } from 'lucide-react';

interface FinishScreenProps {
  sentences: Sentence[];
  progress: Record<number, SentenceProgress>;
  onPracticeSentence: (sentenceIndex: number) => void;
  onRestartAll: () => void;
  onGoToList: () => void;
}

export const FinishScreen: React.FC<FinishScreenProps> = ({
  sentences,
  progress,
  onPracticeSentence,
  onRestartAll,
  onGoToList,
}) => {
  // Compute statistics
  const completedSentences = sentences.filter(
    (s) => progress[s.id]?.status === 'done' || progress[s.id]?.status === 'practiced'
  );

  const totalRecordings = Object.values(progress).reduce(
    (acc, p) => acc + (p?.recordings || 0),
    0
  );

  // Sentences marked 😐 in any self-check criterion
  const neutralSentences = sentences.filter((s) => {
    const checks = progress[s.id]?.selfCheck;
    return checks && checks.some((c) => c === '😐');
  });

  return (
    <div className="w-full flex flex-col items-center gap-6 py-4 px-1">
      {/* Celebration Header */}
      <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 text-center shadow-md space-y-3 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-200 rounded-full blur-2xl opacity-50" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-200 rounded-full blur-2xl opacity-50" />

        <div className="relative">
          <div className="w-16 h-16 mx-auto bg-amber-100 border-2 border-yellow-400 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm mb-3">
            <Trophy className="w-8 h-8 fill-current" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-amber-900 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Mission Accomplished!</span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Great Job! / 쉐도잉 완료!
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            {MOVIE_SETTINGS.titleEn} 클립 쉐도잉 세션을 성공적으로 마쳤습니다.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3 text-center">
            <p className="text-[11px] font-semibold text-slate-500">Completed Sentences</p>
            <p className="text-2xl font-black text-[#4267B2]">
              {completedSentences.length} <span className="text-xs font-normal text-slate-600">/ {sentences.length}</span>
            </p>
            <p className="text-[10px] text-slate-500">완료한 대사</p>
          </div>

          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 text-center">
            <p className="text-[11px] font-semibold text-slate-500">Voice Recordings</p>
            <p className="text-2xl font-black text-amber-700">
              {totalRecordings} <span className="text-xs font-normal text-slate-600">takes</span>
            </p>
            <p className="text-[10px] text-slate-500">총 녹음 횟수</p>
          </div>
        </div>
      </div>

      {/* Review Section: sentences marked with 😐 */}
      {neutralSentences.length > 0 && (
        <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="text-base">😐</span>
              <span>Needs More Practice / 다시 점검할 문장</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              스스로 점검(Self-check)에서 😐 평가를 남긴 문장들입니다. 한 번 더 연습해보세요!
            </p>
          </div>

          <div className="space-y-2.5">
            {neutralSentences.map((s) => {
              const origIndex = sentences.findIndex((item) => item.id === s.id);
              return (
                <div
                  key={s.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 text-left"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                      <span className="font-bold text-[#4267B2]">#{origIndex + 1}</span>
                      <span>·</span>
                      <span className="font-medium text-slate-700">{s.speaker}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {s.text}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {s.korean}
                    </p>
                  </div>

                  <button
                    onClick={() => onPracticeSentence(origIndex)}
                    className="min-h-[40px] px-3 py-1.5 bg-[#FFD93D] hover:bg-yellow-400 text-slate-900 font-bold text-xs rounded-xl shrink-0 flex items-center gap-1 shadow-xs transition-all active:scale-95"
                  >
                    <span>Practice again</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="w-full space-y-2.5">
        <button
          onClick={onRestartAll}
          className="w-full min-h-[50px] bg-[#FFD93D] hover:bg-yellow-400 active:scale-[0.98] text-slate-900 font-extrabold text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 py-2 px-4 border border-yellow-400 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Practice Again from #1 / 1번부터 다시 연습</span>
        </button>

        <button
          onClick={onGoToList}
          className="w-full min-h-[48px] bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 font-bold text-xs rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 py-2 px-4 border border-slate-200 cursor-pointer"
        >
          <List className="w-4 h-4 text-blue-600" />
          <span>Go to Sentence List / 문장 목록으로 이동</span>
        </button>
      </div>

      {/* Mandatory one-line credit at the bottom of the finish screen */}
      <div className="w-full pt-4 border-t border-slate-200/80 text-center">
        <p className="text-[13px] text-slate-500 leading-relaxed">
          Clip: <span className="italic font-medium">{MOVIE_SETTINGS.titleEn}</span> ({MOVIE_SETTINGS.releaseYear}), {MOVIE_SETTINGS.distribution} / {MOVIE_SETTINGS.production} · via YouTube · For educational use only
        </p>
      </div>
    </div>
  );
};
