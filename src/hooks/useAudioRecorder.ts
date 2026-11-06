import { useState, useRef, useCallback } from 'react';

export interface AudioRecorderState {
  isRecording: boolean;
  audioUrl: string | null;
  isPlayingMyVoice: boolean;
  micPermissionDenied: boolean;
  errorMessage: string | null;
}

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingMyVoice, setIsPlayingMyVoice] = useState(false);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      setErrorMessage(null);
      // Clean up previous recording
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicPermissionDenied(false);

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Stop all audio tracks to release microphone hardware indicator
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      recorder.start();
      setIsRecording(true);
      return true;
    } catch (err: any) {
      console.warn('Microphone permission error or not supported:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicPermissionDenied(true);
        setErrorMessage('Mic is off. You can still listen and shadow out loud. (마이크 권한이 꺼져 있습니다. 소리 내어 쉐도잉을 계속 진행할 수 있습니다.)');
      } else {
        setErrorMessage('Microphone not available on this device. (마이크를 사용할 수 없습니다.)');
      }
      setIsRecording(false);
      return false;
    }
  }, [audioUrl]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.warn('Stop recorder error:', err);
      }
    }
    setIsRecording(false);
  }, []);

  const playMyVoice = useCallback(() => {
    if (!audioUrl) return;

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    const audio = new Audio(audioUrl);
    currentAudioRef.current = audio;
    setIsPlayingMyVoice(true);

    audio.onended = () => {
      setIsPlayingMyVoice(false);
      currentAudioRef.current = null;
    };

    audio.onerror = () => {
      setIsPlayingMyVoice(false);
      currentAudioRef.current = null;
    };

    audio.play().catch((err) => {
      console.warn('Audio playback error:', err);
      setIsPlayingMyVoice(false);
    });
  }, [audioUrl]);

  const stopMyVoice = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setIsPlayingMyVoice(false);
  }, []);

  const clearRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    stopMyVoice();
  }, [audioUrl, stopMyVoice]);

  return {
    isRecording,
    audioUrl,
    isPlayingMyVoice,
    micPermissionDenied,
    errorMessage,
    startRecording,
    stopRecording,
    playMyVoice,
    stopMyVoice,
    clearRecording,
  };
}
