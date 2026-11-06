import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sentence, SentenceProgress, ShadowingStep, SelfCheckScore, YTPlayer } from '../types';
import { YouTubePlayer } from '../components/YouTubePlayer';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useSpeechRecognition, cleanToken } from '../utils/speechRecognition';
import {
  Play,
  Pause,
  Repeat,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Mic,
  Square,
  Volume2,
  CheckCircle,
  HelpCircle,
  Headphones,
  Speech,
  Sparkles,
  ArrowRight,
  List,
  AlertCircle
} from 'lucide-react';

interface PracticeScreenProps {
  sentence: Sentence;
  sentenceIndex: number;
  totalSentences: number;
  progress: SentenceProgress;
  onUpdateProgress: (updated: SentenceProgress) => void;
  onPrev: () => void;
  onNext: () => void;
  onBackToList: () => void;
  onFinishCourse: () => void;
}

export const PracticeScreen: React.FC<PracticeScreenProps> = ({
  sentence,
  sentenceIndex,
  totalSentences,
  progress,
  onUpdateProgress,
  onPrev,
  onNext,
  onBackToList,
  onFinishCourse,
}) => {
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [segmentTrigger, setSegmentTrigger] = useState<{
    start: number;
    end: number;
    loop: boolean;
    key: number;
  } | null>(null);

  // Practice settings
  const [currentStep, setCurrentStep] = useState<ShadowingStep>(1);
  const [isTextHidden, setIsTextHidden] = useState<boolean>(true);
  const [isKoreanHidden, setIsKoreanHidden] = useState<boolean>(false);

  // Audio recording
  const {
    isRecording,
    audioUrl,
    isPlayingMyVoice,
    micPermissionDenied,
    errorMessage: audioError,
    startRecording,
    stopRecording,
    playMyVoice,
    stopMyVoice,
    clearRecording,
  } = useAudioRecorder();

  // Speech recognition
  const {
    isSupported: isSpeechRecognitionSupported,
    isListening: isCheckingWords,
    comparison: speechComparison,
    startListening: startWordCheck,
    stopListening: stopWordCheck,
    resetSpeechCheck,
  } = useSpeechRecognition(sentence.text);

  // Reset local state when sentence changes
  useEffect(() => {
    setIsPlaying(false);
    setSegmentTrigger(null);
    clearRecording();
    resetSpeechCheck();
    // Default step 1 text hidden
    setCurrentStep(1);
    setIsTextHidden(true);
  }, [sentence.id, clearRecording, resetSpeechCheck]);

  // Adjust text visibility when step changes according to PRD
  const handleStepChange = (step: ShadowingStep) => {
    setCurrentStep(step);
    if (step === 1 || step === 2 || step === 4) {
      setIsTextHidden(true);
    } else if (step === 3) {
      setIsTextHidden(false);
    }
  };

  // Play sentence segment
  const handlePlaySentence = useCallback(() => {
    if (isPlaying) {
      setSegmentTrigger(null);
      setIsPlaying(false);
    } else {
      setSegmentTrigger({
        start: sentence.start,
        end: sentence.end,
        loop: isLooping,
        key: Date.now(),
      });
      setIsPlaying(true);

      // Increment plays
      onUpdateProgress({
        ...progress,
        plays: (progress?.plays || 0) + 1,
      });
    }
  }, [isPlaying, isLooping, sentence, progress, onUpdateProgress]);

  // Handle loop toggle
  const handleToggleLoop = () => {
    const nextLoop = !isLooping;
    setIsLooping(nextLoop);
    if (isPlaying) {
      // Re-trigger segment with new loop setting
      setSegmentTrigger({
        start: sentence.start,
        end: sentence.end,
        loop: nextLoop,
        key: Date.now(),
      });
    }
  };

  // Trigger segment end callback
  const handleSegmentEnd = useCallback(() => {
    if (!isLooping && !isRecording) {
      setIsPlaying(false);
    }
  }, [isLooping, isRecording]);

  // Handle record click
  const handleStartRecording = async () => {
    if (isRecording) {
      stopRecording();
      setSegmentTrigger(null);
      setIsPlaying(false);
      return;
    }

    const started = await startRecording();
    if (!started) return;

    // Simultaneously play the sentence once without loop
    setIsPlaying(true);
    setSegmentTrigger({
      start: sentence.start,
      end: sentence.end,
      loop: false,
      key: Date.now(),
    });

    // Auto-stop recording 1.0 second after the sentence end
    const durationMs = ((sentence.end - sentence.start) / playbackSpeed) * 1000 + 1000;
    setTimeout(() => {
      stopRecording();
      setIsPlaying(false);
      setSegmentTrigger(null);

      // Update progress
      const newStatus = currentStep === 4 ? 'done' : progress.status === 'done' ? 'done' : 'practiced';
      onUpdateProgress({
        ...progress,
        recordings: (progress?.recordings || 0) + 1,
        status: newStatus,
      });
    }, durationMs);
  };

  // Play original clip segment again (comparison)
  const handlePlayOriginal = () => {
    stopMyVoice();
    setSegmentTrigger({
      start: sentence.start,
      end: sentence.end,
      loop: false,
      key: Date.now(),
    });
    setIsPlaying(true);
  };

  // Handle self-check answer
  const handleSelfCheck = (index: 0 | 1 | 2, score: SelfCheckScore) => {
    const updatedChecks = [...(progress?.selfCheck || [null, null, null])] as [
      SelfCheckScore,
      SelfCheckScore,
      SelfCheckScore
    ];
    updatedChecks[index] = score;

    onUpdateProgress({
      ...progress,
      selfCheck: updatedChecks,
    });
  };

  // Helper to format words with stress highlighting
  const renderHighlightedSentence = useMemo(() => {
    const stressSet = new Set(sentence.stress.map((s) => cleanToken(s)));
    const words = sentence.text.split(/(\s+)/);

    return words.map((chunk, i) => {
      const cleaned = cleanToken(chunk);
      const isStressed = cleaned && stressSet.has(cleaned);

      if (isStressed) {
        return (
          <span
            key={i}
            className="font-extrabold text-[#4267B2] underline decoration-[#FFD93D] decoration-4 underline-offset-4"
          >
            {chunk}
          </span>
        );
      }
      return <span key={i}>{chunk}</span>;
    });
  }, [sentence.text, sentence.stress]);

  const stepInstructions: Record<ShadowingStep, { en: string; ko: string }> = {
    1: {
      en: 'Listen 2–3 times with text hidden to train your ear.',
      ko: '자막을 가리고 원어민의 음성과 속도에만 집중해 2~3회 들어보세요.',
    },
    2: {
      en: 'Quietly mumble or whisper along with the sound rhythm.',
      ko: '자막 없이 소리의 억양과 박자를 작게 웅얼거리며 따라해보세요.',
    },
    3: {
      en: 'Look at the text and speak out loud together with the clip.',
      ko: '자막을 보며 강조 단어에 힘을 주고 동시에 큰 소리로 쉐도잉하세요.',
    },
    4: {
      en: 'Final test! Hide text and shadow at the exact same rhythm.',
      ko: '최종 쉐도잉! 자막 없이 배우와 한 사람처럼 완전히 똑같이 말해보세요.',
    },
  };

  const isLastSentence = sentenceIndex === totalSentences - 1;

  return (
    <div className="w-full flex flex-col gap-4 py-2">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={onBackToList}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold py-1.5 px-2.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <List className="w-4 h-4 text-blue-600" />
          <span>All Sentences (목록)</span>
        </button>

        {/* Sentence Counter ◀ Sentence 3 / 8 ▶ */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs">
          <button
            onClick={onPrev}
            disabled={sentenceIndex === 0}
            className="p-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
            title="Previous sentence (이전 문장)"
          >
            <ChevronLeft className="w-4 h-4 text-blue-600" />
          </button>

          <span className="text-xs font-bold text-slate-800">
            Sentence {sentenceIndex + 1} / {totalSentences}
          </span>

          <button
            onClick={onNext}
            disabled={isLastSentence}
            className="p-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
            title="Next sentence (다음 문장)"
          >
            <ChevronRight className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      </div>

      {/* 1. Video Player (16:9) with mandatory credit line */}
      <YouTubePlayer
        segmentPlaying={segmentTrigger}
        onSegmentEnd={handleSegmentEnd}
        playbackRate={playbackSpeed}
      />

      {/* 6. Step Guide (4 tabs) */}
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2.5">
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl">
          {([1, 2, 3, 4] as ShadowingStep[]).map((stepNum) => {
            const isActive = currentStep === stepNum;
            const labels: Record<ShadowingStep, string> = {
              1: 'Listen',
              2: 'Mumble',
              3: 'Read & Shadow',
              4: 'Shadow',
            };
            return (
              <button
                key={stepNum}
                onClick={() => handleStepChange(stepNum)}
                className={`py-2 px-1 text-xs font-bold rounded-lg transition-all text-center ${
                  isActive
                    ? 'bg-[#FFD93D] text-slate-900 shadow-sm border border-yellow-400'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <div>Step {stepNum}</div>
                <div className="text-[10px] truncate">{labels[stepNum]}</div>
              </button>
            );
          })}
        </div>

        {/* Step Instruction text */}
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-2.5 text-xs text-slate-700">
          <p className="font-semibold text-slate-900">
            {stepInstructions[currentStep].en}
          </p>
          <p className="text-slate-600 text-[11px] mt-0.5">
            {stepInstructions[currentStep].ko}
          </p>
        </div>
      </div>

      {/* 3 & 4. Sentence Display Card */}
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        {/* Speaker and Time and Hide Toggle */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-[#4267B2] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              {sentence.speaker}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {sentence.start.toFixed(1)}s – {sentence.end.toFixed(1)}s
            </span>
          </div>

          <button
            onClick={() => setIsTextHidden(!isTextHidden)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold py-1 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-700 shadow-xs"
          >
            {isTextHidden ? (
              <>
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>Show Text / 문장 보기</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                <span>Hide Text / 문장 숨기기</span>
              </>
            )}
          </button>
        </div>

        {/* Sentence Text in Large Font (>= 22px) */}
        <div className="min-h-[70px] flex items-center justify-center text-center px-1">
          {isTextHidden ? (
            <div className="w-full py-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-400">
              <Headphones className="w-6 h-6 text-slate-400" />
              <span className="text-sm font-medium">Text is hidden for listening & shadowing</span>
              <span className="text-xs text-slate-400">(자막 가림 상태 · 귀로 먼저 들어보세요)</span>
            </div>
          ) : (
            <div className="text-[23px] font-bold text-slate-900 leading-snug tracking-tight">
              {renderHighlightedSentence}
            </div>
          )}
        </div>

        {/* Korean Meaning (small, gray, can be toggled) */}
        {!isTextHidden && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">
              {isKoreanHidden ? '[Korean translation hidden]' : sentence.korean}
            </span>
            <button
              onClick={() => setIsKoreanHidden(!isKoreanHidden)}
              className="text-[11px] text-slate-400 hover:text-slate-700 underline"
            >
              {isKoreanHidden ? 'Show translation' : 'Hide'}
            </button>
          </div>
        )}

        {/* Stress Words Hint */}
        {!isTextHidden && sentence.stress.length > 0 && (
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 bg-yellow-50/70 p-2 rounded-lg border border-yellow-200/60">
            <span className="font-bold text-amber-800">Stress / 강조 단어:</span>
            <span className="font-semibold text-slate-800">
              {sentence.stress.join(', ')}
            </span>
            <span className="text-slate-400 ml-auto">힘을 주어 말하세요!</span>
          </div>
        )}
      </div>

      {/* 5. Control Row: Play, Loop, Speed */}
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex items-center justify-between gap-2">
        {/* Play Button */}
        <button
          onClick={handlePlaySentence}
          className={`min-h-[48px] px-5 py-2 rounded-xl font-extrabold text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
            isPlaying
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-[#FFD93D] hover:bg-yellow-400 text-slate-900'
          }`}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{isPlaying ? 'Pause / 일시정지' : '▶ Play / 재생'}</span>
        </button>

        {/* Loop Toggle */}
        <button
          onClick={handleToggleLoop}
          className={`min-h-[48px] px-3.5 py-1.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all border ${
            isLooping
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center gap-1">
            <Repeat className="w-3.5 h-3.5" />
            <span>Loop</span>
          </div>
          <span className="text-[10px] font-medium opacity-90">
            {isLooping ? 'ON (1.5s 쉼)' : 'OFF'}
          </span>
        </button>

        {/* Speed Controls: 0.5x / 0.75x / 1.0x */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {[0.5, 0.75, 1.0].map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              className={`min-h-[40px] px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                playbackSpeed === speed
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {speed}×
            </button>
          ))}
        </div>
      </div>

      {/* 7. Record Area */}
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-900">
              Voice Shadowing / 내 목소리 녹음
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {progress?.recordings || 0} takes recorded
          </span>
        </div>

        {/* Audio Error / Mic off notice */}
        {audioError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <p>{audioError}</p>
          </div>
        )}

        {/* Big Record Button */}
        <button
          onClick={handleStartRecording}
          className={`w-full min-h-[52px] rounded-2xl font-extrabold text-base flex flex-col items-center justify-center py-2 px-4 transition-all shadow-md active:scale-[0.99] cursor-pointer ${
            isRecording
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-[#4267B2] hover:bg-blue-700 text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
            <span>{isRecording ? 'Recording Now... (녹음 중지)' : '🎙 Record / 녹음하기'}</span>
          </div>
          <span className="text-[11px] font-normal opacity-90">
            {isRecording
              ? '문장 종료 후 1초 뒤 자동 정지됩니다'
              : '클립이 재생되며 내 목소리가 동시에 녹음됩니다'}
          </span>
        </button>

        {/* Playback Controls after recording */}
        {audioUrl && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={isPlayingMyVoice ? stopMyVoice : playMyVoice}
              className={`min-h-[48px] px-3 py-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center border transition-all ${
                isPlayingMyVoice
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#4267B2]" />
                <span>{isPlayingMyVoice ? 'Pause' : '▶ My Voice'}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-normal">내 목소리 듣기</span>
            </button>

            <button
              onClick={handlePlayOriginal}
              className="min-h-[48px] px-3 py-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-all"
            >
              <div className="flex items-center gap-1.5">
                <Play className="w-4 h-4 text-amber-500 fill-current" />
                <span>▶ Original</span>
              </div>
              <span className="text-[10px] text-slate-500 font-normal">배우 원본 음성 비교</span>
            </button>
          </div>
        )}
      </div>

      {/* 8. Self-Check (after recording) */}
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Self-Check / 스스로 점검하기
            </h3>
          </div>
          <span className="text-xs text-slate-400">솔직하게 평가해보세요</span>
        </div>

        {/* 3 Questions */}
        {[
          {
            index: 0 as const,
            qEn: 'Did I keep up with the speed?',
            qKo: '배우의 말하는 속도를 잘 따라갔나요?',
          },
          {
            index: 1 as const,
            qEn: 'Did I stress the bold words?',
            qKo: '강조 단어(Stress words)에 힘을 주었나요?',
          },
          {
            index: 2 as const,
            qEn: 'Did my voice go up and down like the actor?',
            qKo: '배우처럼 감정과 억양이 자연스럽게 오르내렸나요?',
          },
        ].map((item) => {
          const currentRating = progress?.selfCheck?.[item.index];
          return (
            <div
              key={item.index}
              className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <p className="text-xs font-bold text-slate-800">{item.qEn}</p>
                <p className="text-[11px] text-slate-500">{item.qKo}</p>
              </div>

              {/* Emoji Buttons: 😀 / 🙂 / 😐 */}
              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                {(['😀', '🙂', '😐'] as const).map((emoji) => {
                  const isSelected = currentRating === emoji;
                  return (
                    <button
                      key={emoji}
                      onClick={() => handleSelfCheck(item.index, emoji)}
                      className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-[#FFD93D] scale-110 shadow-sm border border-yellow-400'
                          : 'bg-white hover:bg-slate-100 border border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 9. Word Check (optional Web Speech API) */}
      {isSpeechRecognitionSupported && (
        <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Speech className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Word Check / 단어 발음 확인
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Web Speech API</span>
          </div>

          <p className="text-xs text-slate-600">
            마이크 버튼을 누르고 문장을 영어로 말하면 인식된 단어를 확인해 드립니다.
          </p>

          <button
            onClick={isCheckingWords ? stopWordCheck : startWordCheck}
            className={`w-full min-h-[48px] rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
              isCheckingWords
                ? 'bg-purple-600 text-white border-purple-600 animate-pulse'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>
              {isCheckingWords
                ? 'Listening... Speak in English (듣는 중)'
                : 'Check My Words / 발음 단어 확인'}
            </span>
          </button>

          {speechComparison && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
              <div className="flex flex-wrap gap-1.5 text-sm">
                {speechComparison.wordMatches.map((m, idx) => {
                  return (
                    <span
                      key={idx}
                      className={
                        m.isMatched
                          ? 'text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200'
                          : 'text-slate-400 underline decoration-slate-400 px-1 py-0.5'
                      }
                    >
                      {m.word}
                    </span>
                  );
                })}
              </div>

              <p className="text-xs font-semibold text-purple-800">
                You said {speechComparison.matchedCount} of {speechComparison.totalWords} words! Great effort! 👏
              </p>
            </div>
          )}
        </div>
      )}

      {/* 10. Navigation Buttons: Previous & Next / Finish */}
      <div className="w-full pt-2 pb-5 flex items-center gap-2.5">
        <button
          onClick={onPrev}
          disabled={sentenceIndex === 0}
          className={`flex-1 min-h-[52px] rounded-2xl font-bold text-sm flex flex-col items-center justify-center py-2 px-3 transition-all border ${
            sentenceIndex === 0
              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-xs active:scale-[0.98] cursor-pointer'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <ChevronLeft className="w-4 h-4 text-blue-600" />
            <span className="font-extrabold">◀ Previous</span>
          </div>
          <span className="text-[11px] font-normal text-slate-500">이전 문장</span>
        </button>

        {isLastSentence ? (
          <button
            onClick={onFinishCourse}
            className="flex-1 min-h-[52px] bg-[#FFD93D] hover:bg-yellow-400 active:scale-[0.98] text-slate-900 font-bold text-sm rounded-2xl shadow-md transition-all flex flex-col items-center justify-center py-2 px-3 border border-yellow-400/80 cursor-pointer"
          >
            <div className="flex items-center gap-1.5 font-extrabold">
              <span>Finish & Review</span>
              <Sparkles className="w-4 h-4 text-amber-700" />
            </div>
            <span className="text-[11px] font-normal text-slate-800">학습 완료하기</span>
          </button>
        ) : (
          <button
            onClick={onNext}
            className="flex-1 min-h-[52px] bg-[#FFD93D] hover:bg-yellow-400 active:scale-[0.98] text-slate-900 font-bold text-sm rounded-2xl shadow-md transition-all flex flex-col items-center justify-center py-2 px-3 border border-yellow-400/80 cursor-pointer"
          >
            <div className="flex items-center gap-1.5 font-extrabold">
              <span>Next ▶</span>
              <ChevronRight className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-normal text-slate-800">다음 문장</span>
          </button>
        )}
      </div>
    </div>
  );
};
