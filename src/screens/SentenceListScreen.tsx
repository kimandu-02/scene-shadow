import React, { useState } from 'react';
import { Sentence, SentenceProgress } from '../types';
import { YouTubePlayer } from '../components/YouTubePlayer';
import { Eye, EyeOff, Play, ArrowLeft, Settings2, CheckCircle2, RotateCcw } from 'lucide-react';

interface SentenceListScreenProps {
  sentences: Sentence[];
  progress: Record<number, SentenceProgress>;
  onSelectSentence: (sentenceIndex: number) => void;
  onBack: () => void;
  onEdit: () => void;
  onResetProgress: () => void;
}

export const SentenceListScreen: React.FC<SentenceListScreenProps> = ({
  sentences,
  progress,
  onSelectSentence,
  onBack,
  onEdit,
  onResetProgress,
}) => {
  const [hideAllText, setHideAllText] = useState(false);

  const getStatusBadge = (sentenceId: number) => {
    const itemProgress = progress[sentenceId];
    const status = itemProgress?.status || 'new';

    if (status === 'done') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          <span>★</span>
          <span>Done (완료)</span>
        </span>
      );
    }
    if (status === 'practiced') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
          <span>◐</span>
          <span>Practiced (연습함)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
        <span>☆</span>
        <span>Not started (미시작)</span>
      </span>
    );
  };

  const completedCount = sentences.filter(
    (s) => progress[s.id]?.status === 'done' || progress[s.id]?.status === 'practiced'
  ).length;

  return (
    <div className="w-full flex flex-col gap-4 py-2">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium py-1.5 px-2.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Start (처음으로)</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHideAllText(!hideAllText)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            {hideAllText ? <Eye className="w-3.5 h-3.5 text-blue-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
            <span>{hideAllText ? 'Show Text' : 'Hide Text'}</span>
          </button>

          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 py-1.5 px-2 rounded-lg hover:bg-slate-100 transition-colors"
            title="Edit Sentences"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Video Player (16:9) with mandatory credit line */}
      <YouTubePlayer />

      {/* Progress Summary header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Practice Sentences / 연습 문장
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Progress: {completedCount} / {sentences.length} lines completed
          </p>
        </div>

        <button
          onClick={() => onSelectSentence(0)}
          className="min-h-[44px] px-3.5 py-2 bg-[#FFD93D] hover:bg-yellow-400 active:scale-95 text-slate-900 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Start from #1</span>
        </button>
      </div>

      {/* Sentence Cards List */}
      {sentences.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
          <p className="text-slate-600 font-medium">No sentences available.</p>
          <p className="text-xs text-slate-400">문장이 없습니다. 문장 편집 화면에서 기본 문장을 불러오거나 새 문장을 추가하세요.</p>
          <button
            onClick={onEdit}
            className="min-h-[48px] px-4 py-2 bg-[#4267B2] text-white font-bold text-sm rounded-xl"
          >
            Open Sentence Editor
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sentences.map((sentence, index) => {
            return (
              <div
                key={sentence.id}
                onClick={() => onSelectSentence(index)}
                className="w-full bg-white border border-slate-200 hover:border-[#4267B2] rounded-2xl p-4 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col gap-2.5 active:scale-[0.99] text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center">
                      #{index + 1}
                    </span>
                    <span className="text-xs font-semibold text-[#4267B2]">
                      {sentence.speaker}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {sentence.start.toFixed(1)}s – {sentence.end.toFixed(1)}s
                    </span>
                  </div>

                  <div>{getStatusBadge(sentence.id)}</div>
                </div>

                {/* English Text */}
                <div className="text-base font-semibold text-slate-900 leading-snug">
                  {hideAllText ? (
                    <span className="text-slate-400 italic font-normal text-sm bg-slate-100 px-2 py-0.5 rounded">
                      [Text Hidden · Tap to practice]
                    </span>
                  ) : (
                    <span>{sentence.text}</span>
                  )}
                </div>

                {/* Korean Meaning */}
                {!hideAllText && (
                  <div className="text-xs text-slate-500">
                    {sentence.korean}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer controls */}
      <div className="flex justify-between items-center text-xs text-slate-400 px-2 pt-2 pb-4">
        <button
          onClick={onResetProgress}
          className="inline-flex items-center gap-1 hover:text-slate-600 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Progress (진도 초기화)</span>
        </button>
        <span>Despicable Me 4 · Clip Practice</span>
      </div>
    </div>
  );
};
