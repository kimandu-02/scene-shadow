import React, { useState, useRef } from 'react';
import { Sentence, YTPlayer } from '../types';
import { YouTubePlayer } from '../components/YouTubePlayer';
import { MOVIE_SETTINGS, DEFAULT_SENTENCES } from '../data/defaultData';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Copy,
  Download,
  Upload,
  Check,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface EditScreenProps {
  sentences: Sentence[];
  onSaveSentences: (updated: Sentence[]) => void;
  onBack: () => void;
}

export const EditScreen: React.FC<EditScreenProps> = ({
  sentences,
  onSaveSentences,
  onBack,
}) => {
  const playerRef = useRef<YTPlayer | null>(null);
  const [currentPlayerTime, setCurrentPlayerTime] = useState(0);

  // Segment testing
  const [testSegment, setTestSegment] = useState<{
    start: number;
    end: number;
    loop: boolean;
    key: number;
  } | null>(null);

  // Form states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [speaker, setSpeaker] = useState('');
  const [text, setText] = useState('');
  const [korean, setKorean] = useState('');
  const [stressInput, setStressInput] = useState('');
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(3.0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);

  // Calculate length and word count for gentle warnings
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const duration = Math.max(0, endTime - startTime);
  const hasLongWarning = duration > 4.0 || wordCount > 12;

  // Set start / end to current player time
  const handleSetStartNow = () => {
    let now = currentPlayerTime;
    if (playerRef.current) {
      try {
        now = playerRef.current.getCurrentTime();
      } catch (e) {
        console.warn(e);
      }
    }
    const rounded = Math.round(now * 10) / 10;
    setStartTime(rounded);
    if (rounded >= endTime) {
      setEndTime(Math.min(MOVIE_SETTINGS.end, rounded + 2.0));
    }
  };

  const handleSetEndNow = () => {
    let now = currentPlayerTime;
    if (playerRef.current) {
      try {
        now = playerRef.current.getCurrentTime();
      } catch (e) {
        console.warn(e);
      }
    }
    const rounded = Math.round(now * 10) / 10;
    setEndTime(rounded);
  };

  // Test play current segment
  const handleTestSegment = () => {
    const maxAllowedEnd = MOVIE_SETTINGS.end + 2;
    if (startTime < MOVIE_SETTINGS.start || endTime > maxAllowedEnd) {
      setValidationError(`Times must be between ${MOVIE_SETTINGS.start}s and ${maxAllowedEnd}s.`);
      return;
    }
    if (endTime <= startTime) {
      setValidationError('End time must be greater than start time.');
      return;
    }
    setValidationError(null);
    setTestSegment({
      start: startTime,
      end: endTime,
      loop: false,
      key: Date.now(),
    });
  };

  // Save / Add sentence
  const handleSaveSentence = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!speaker.trim()) {
      setValidationError('Please enter a speaker name. (화자 이름을 입력하세요.)');
      return;
    }
    if (!text.trim()) {
      setValidationError('Please enter the English sentence. (영어 문장을 입력하세요.)');
      return;
    }
    const maxAllowedEnd = MOVIE_SETTINGS.end + 2;
    if (startTime < MOVIE_SETTINGS.start || endTime > maxAllowedEnd) {
      setValidationError(
        `Start and end must be within the clip range [${MOVIE_SETTINGS.start}s – ${maxAllowedEnd}s].`
      );
      return;
    }
    if (endTime <= startTime) {
      setValidationError('End time must be strictly greater than start time.');
      return;
    }

    const stressList = stressInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingId !== null) {
      // Edit existing
      const updated = sentences.map((s) =>
        s.id === editingId
          ? {
              ...s,
              speaker: speaker.trim(),
              text: text.trim(),
              korean: korean.trim(),
              stress: stressList,
              start: startTime,
              end: endTime,
            }
          : s
      );
      onSaveSentences(updated);
      setEditingId(null);
    } else {
      // Create new
      const newId = Date.now();
      const newSentence: Sentence = {
        id: newId,
        speaker: speaker.trim(),
        text: text.trim(),
        korean: korean.trim(),
        stress: stressList,
        start: startTime,
        end: endTime,
      };
      onSaveSentences([...sentences, newSentence]);
    }

    // Reset fields
    setSpeaker('');
    setText('');
    setKorean('');
    setStressInput('');
    setStartTime(endTime);
    setEndTime(Math.min(MOVIE_SETTINGS.end, endTime + 2.5));
  };

  const handleEditItem = (s: Sentence) => {
    setEditingId(s.id);
    setSpeaker(s.speaker);
    setText(s.text);
    setKorean(s.korean);
    setStressInput(s.stress.join(', '));
    setStartTime(s.start);
    setEndTime(s.end);
    setValidationError(null);
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const handleDeleteItem = (id: number) => {
    if (window.confirm('Delete this practice sentence? (이 문장을 삭제하시겠습니까?)')) {
      const updated = sentences.filter((s) => s.id !== id);
      onSaveSentences(updated);
      if (editingId === id) {
        setEditingId(null);
      }
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sentences.length) return;
    const reordered = [...sentences];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;
    onSaveSentences(reordered);
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(sentences, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        alert('Invalid JSON array format.');
        return;
      }
      onSaveSentences(parsed);
      setImportModalOpen(false);
      setImportJsonText('');
      alert(`Successfully imported ${parsed.length} sentences!`);
    } catch {
      alert('Could not parse JSON. Please check formatting.');
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Restore initial Despicable Me 4 sentences? (초기 8개 문장으로 되돌릴까요?)')) {
      onSaveSentences(DEFAULT_SENTENCES);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 py-2">
      {/* Top Header */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold py-1.5 px-2.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to App / 돌아가기</span>
        </button>

        <span className="text-xs font-bold text-slate-800">
          Sentence Editor / 문장 편집기
        </span>
      </div>

      {/* Video Player */}
      <YouTubePlayer
        onPlayerReady={(p) => (playerRef.current = p)}
        onTimeUpdate={(t) => setCurrentPlayerTime(t)}
        segmentPlaying={testSegment}
      />

      {/* Import / Export & Reset actions */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all"
          >
            {copiedToast ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedToast ? 'Copied JSON!' : 'Export JSON'}</span>
          </button>

          <button
            onClick={() => setImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Import JSON</span>
          </button>
        </div>

        <button
          onClick={handleResetDefaults}
          className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 underline"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Add / Edit Form */}
      <form
        onSubmit={handleSaveSentence}
        className="w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 text-slate-800"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-bold text-sm text-slate-900">
            {editingId !== null ? '✏️ Edit Sentence / 문장 수정' : '➕ Add Sentence / 새 문장 추가'}
          </h3>
          {editingId !== null && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setSpeaker('');
                setText('');
                setKorean('');
                setStressInput('');
              }}
              className="text-xs text-rose-600 hover:underline"
            >
              Cancel Edit (취소)
            </button>
          )}
        </div>

        {validationError && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Speaker & Time Controls */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Speaker / 화자
            </label>
            <input
              type="text"
              placeholder="e.g. Gru, Lucy, Silas"
              value={speaker}
              onChange={(e) => setSpeaker(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={handleTestSegment}
              className="min-h-[38px] px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#4267B2] font-bold text-xs rounded-xl border border-blue-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Test Segment (구간 테스트)</span>
            </button>
          </div>
        </div>

        {/* Timing inputs with Set Now buttons */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Start Time (s)</label>
              <button
                type="button"
                onClick={handleSetStartNow}
                className="text-[10px] text-blue-700 bg-blue-100/80 px-1.5 py-0.5 rounded font-bold hover:bg-blue-200"
              >
                Set = now ({currentPlayerTime.toFixed(1)}s)
              </button>
            </div>
            <input
              type="number"
              step="0.1"
              min={MOVIE_SETTINGS.start}
              max={MOVIE_SETTINGS.end}
              value={startTime}
              onChange={(e) => setStartTime(parseFloat(e.target.value) || 0)}
              className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">End Time (s)</label>
              <button
                type="button"
                onClick={handleSetEndNow}
                className="text-[10px] text-blue-700 bg-blue-100/80 px-1.5 py-0.5 rounded font-bold hover:bg-blue-200"
              >
                Set = now ({currentPlayerTime.toFixed(1)}s)
              </button>
            </div>
            <input
              type="number"
              step="0.1"
              min={MOVIE_SETTINGS.start}
              max={MOVIE_SETTINGS.end}
              value={endTime}
              onChange={(e) => setEndTime(parseFloat(e.target.value) || 0)}
              className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
            />
          </div>
        </div>

        {/* Gentle warning if longer than 4s or 12 words */}
        {hasLongWarning && (
          <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-xs text-amber-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Gentle Tip (권장 안내):</p>
              <p className="text-[11px] text-amber-800">
                This sentence is {duration.toFixed(1)}s long ({wordCount} words). Sentences under 4 seconds or 12 words are easiest and most effective to shadow!
              </p>
            </div>
          </div>
        )}

        {/* English Text */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            English Sentence / 영어 대사
          </label>
          <input
            type="text"
            placeholder="e.g. All right, now down to business."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Korean Meaning */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Korean Meaning / 한국어 의미
          </label>
          <input
            type="text"
            placeholder="e.g. 좋아요, 이제 본론으로 들어가죠."
            value={korean}
            onChange={(e) => setKorean(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Stress Words */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Stress Words (comma-separated) / 강조할 단어
          </label>
          <input
            type="text"
            placeholder="e.g. really, necessary"
            value={stressInput}
            onChange={(e) => setStressInput(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            쉼표(,)로 구분하여 입력하면 학습 화면에서 굵은 글씨로 강조됩니다.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full min-h-[48px] bg-[#FFD93D] hover:bg-yellow-400 active:scale-[0.99] text-slate-900 font-extrabold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-yellow-400"
        >
          {editingId !== null ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{editingId !== null ? 'Save Changes / 수정 완료' : 'Add to List / 목록에 추가'}</span>
        </button>
      </form>

      {/* Current Sentences Table/Cards */}
      <div className="w-full space-y-2">
        <h3 className="font-bold text-sm text-slate-800 px-1">
          Current Sentences ({sentences.length}) / 등록된 문장 목록
        </h3>

        {sentences.map((s, index) => (
          <div
            key={s.id}
            className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                  #{index + 1}
                </span>
                <span className="text-xs font-bold text-[#4267B2]">{s.speaker}</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {s.start.toFixed(1)}s – {s.end.toFixed(1)}s
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === sentences.length - 1}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleEditItem(s)}
                  className="p-1 rounded text-blue-600 hover:bg-blue-50"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteItem(s.id)}
                  className="p-1 rounded text-rose-500 hover:bg-rose-50"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-sm font-semibold text-slate-900">{s.text}</p>
            <p className="text-xs text-slate-500">{s.korean}</p>
            {s.stress.length > 0 && (
              <p className="text-[11px] text-amber-700">
                Stress: {s.stress.join(', ')}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-slate-900">
              Import Sentences JSON / 문장 JSON 가져오기
            </h3>
            <p className="text-xs text-slate-600">
              Paste a valid JSON array of sentences below.
            </p>
            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='[ { "id": 1, "speaker": "Gru", "text": "...", "korean": "...", "stress": [], "start": 0, "end": 2 } ]'
              className="w-full text-xs font-mono p-3 border border-slate-300 rounded-xl outline-none focus:border-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportJson}
                className="px-4 py-1.5 bg-[#4267B2] text-white font-bold text-xs rounded-lg hover:bg-blue-700"
              >
                Confirm Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
