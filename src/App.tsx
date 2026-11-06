/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ScreenType, Sentence, SentenceProgress } from './types';
import {
  loadStoredSentences,
  saveStoredSentences,
  loadStoredProgress,
  saveStoredProgress,
  resetStoredData,
} from './utils/storage';
import { StartScreen } from './screens/StartScreen';
import { SentenceListScreen } from './screens/SentenceListScreen';
import { PracticeScreen } from './screens/PracticeScreen';
import { EditScreen } from './screens/EditScreen';
import { FinishScreen } from './screens/FinishScreen';
import { MOVIE_SETTINGS } from './data/defaultData';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('start');
  const [sentences, setSentences] = useState<Sentence[]>(loadStoredSentences);
  const [progress, setProgress] = useState<Record<number, SentenceProgress>>(loadStoredProgress);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number>(0);

  // Sync state to localStorage on changes
  useEffect(() => {
    saveStoredSentences(sentences);
  }, [sentences]);

  useEffect(() => {
    saveStoredProgress(progress);
  }, [progress]);

  // Handlers for switching screens
  const handleStartPractice = () => {
    setActiveSentenceIndex(0);
    setCurrentScreen('practice');
  };

  const handleSelectSentence = (index: number) => {
    setActiveSentenceIndex(index);
    setCurrentScreen('practice');
  };

  const handleUpdateProgress = (updated: SentenceProgress) => {
    setProgress((prev) => ({
      ...prev,
      [updated.id]: updated,
    }));
  };

  const handlePrevSentence = () => {
    if (activeSentenceIndex > 0) {
      setActiveSentenceIndex((prev) => prev - 1);
    }
  };

  const handleNextSentence = () => {
    if (activeSentenceIndex < sentences.length - 1) {
      setActiveSentenceIndex((prev) => prev + 1);
    } else {
      setCurrentScreen('finish');
    }
  };

  const handleSaveSentences = (updatedList: Sentence[]) => {
    setSentences(updatedList);
  };

  const handleResetProgress = () => {
    if (window.confirm('Reset all practice progress? (모든 연습 기록을 초기화할까요?)')) {
      const { progress: initialProg } = resetStoredData();
      setProgress(initialProg);
    }
  };

  const currentSentence = sentences[activeSentenceIndex] || sentences[0];

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center selection:bg-[#FFD93D] selection:text-slate-900">
      {/* Mobile-first portrait container (max 480px centered) */}
      <main className="w-full max-w-[480px] min-h-screen bg-white shadow-xl flex flex-col justify-between p-3 sm:p-4">
        {/* Screen Routing */}
        <div className="w-full flex-1">
          {currentScreen === 'start' && (
            <StartScreen
              onStart={() => setCurrentScreen('list')}
              onEdit={() => setCurrentScreen('edit')}
              totalSentences={sentences.length}
            />
          )}

          {currentScreen === 'list' && (
            <SentenceListScreen
              sentences={sentences}
              progress={progress}
              onSelectSentence={handleSelectSentence}
              onBack={() => setCurrentScreen('start')}
              onEdit={() => setCurrentScreen('edit')}
              onResetProgress={handleResetProgress}
            />
          )}

          {currentScreen === 'practice' && currentSentence && (
            <PracticeScreen
              sentence={currentSentence}
              sentenceIndex={activeSentenceIndex}
              totalSentences={sentences.length}
              progress={
                progress[currentSentence.id] || {
                  id: currentSentence.id,
                  plays: 0,
                  recordings: 0,
                  selfCheck: [null, null, null],
                  status: 'new',
                }
              }
              onUpdateProgress={handleUpdateProgress}
              onPrev={handlePrevSentence}
              onNext={handleNextSentence}
              onBackToList={() => setCurrentScreen('list')}
              onFinishCourse={() => setCurrentScreen('finish')}
            />
          )}

          {currentScreen === 'edit' && (
            <EditScreen
              sentences={sentences}
              onSaveSentences={handleSaveSentences}
              onBack={() => setCurrentScreen('list')}
            />
          )}

          {currentScreen === 'finish' && (
            <FinishScreen
              sentences={sentences}
              progress={progress}
              onPracticeSentence={(index) => {
                setActiveSentenceIndex(index);
                setCurrentScreen('practice');
              }}
              onRestartAll={() => {
                setActiveSentenceIndex(0);
                setCurrentScreen('practice');
              }}
              onGoToList={() => setCurrentScreen('list')}
            />
          )}
        </div>
      </main>
    </div>
  );
}
