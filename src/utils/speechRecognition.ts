import { useState, useCallback, useEffect, useRef } from 'react';

export interface WordMatch {
  word: string;
  isMatched: boolean;
  cleanText: string;
}

export function cleanToken(token: string): string {
  return token.toLowerCase().replace(/[^a-z0-9']/g, '').trim();
}

export function compareSentenceWords(originalText: string, spokenText: string) {
  const originalWords = originalText.trim().split(/\s+/);
  const spokenTokens = spokenText
    .trim()
    .split(/\s+/)
    .map(cleanToken)
    .filter(Boolean);

  const matchedSet = new Set<number>();
  let spokenIndex = 0;

  // Ordered and fuzzy matching
  const wordMatches: WordMatch[] = originalWords.map((word, origIndex) => {
    const cleanOrig = cleanToken(word);
    if (!cleanOrig) {
      return { word, isMatched: true, cleanText: cleanOrig };
    }

    // Check if current spoken word matches
    let matched = false;
    for (let i = spokenIndex; i < spokenTokens.length; i++) {
      if (spokenTokens[i] === cleanOrig || cleanOrig.startsWith(spokenTokens[i]) || spokenTokens[i].startsWith(cleanOrig)) {
        matched = true;
        spokenIndex = i + 1;
        break;
      }
    }

    // Secondary check if it was spoken anywhere
    if (!matched && spokenTokens.includes(cleanOrig)) {
      matched = true;
    }

    if (matched) {
      matchedSet.add(origIndex);
    }

    return {
      word,
      isMatched: matched,
      cleanText: cleanOrig,
    };
  });

  const totalWords = wordMatches.filter((w) => w.cleanText.length > 0).length;
  const matchedCount = wordMatches.filter((w) => w.cleanText.length > 0 && w.isMatched).length;

  return {
    wordMatches,
    matchedCount,
    totalWords,
  };
}

export function useSpeechRecognition(targetText: string) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [comparison, setComparison] = useState<{
    wordMatches: WordMatch[];
    matchedCount: number;
    totalWords: number;
  } | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
    }
  }, []);

  const resetSpeechCheck = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        console.warn(e);
      }
    }
    setIsListening(false);
    setTranscript('');
    setComparison(null);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    resetSpeechCheck();

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        setTranscript(spoken);
        const result = compareSentenceWords(targetText, spoken);
        setComparison(result);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition start failed:', err);
      setIsListening(false);
    }
  }, [targetText, resetSpeechCheck]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn(err);
      }
    }
    setIsListening(false);
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    comparison,
    startListening,
    stopListening,
    resetSpeechCheck,
  };
}
