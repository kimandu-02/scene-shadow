import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MOVIE_SETTINGS } from '../data/defaultData';
import { YTPlayer } from '../types';
import { AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

interface YouTubePlayerProps {
  onPlayerReady?: (player: YTPlayer) => void;
  onTimeUpdate?: (time: number) => void;
  segmentPlaying?: { start: number; end: number; loop: boolean; key: number } | null;
  onSegmentEnd?: () => void;
  playbackRate?: number;
  showCredit?: boolean;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  onPlayerReady,
  onTimeUpdate,
  segmentPlaying,
  onSegmentEnd,
  playbackRate = 1.0,
  showCredit = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [embedError, setEmbedError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const loopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSegmentActiveRef = useRef(false);

  // Initialize YouTube API
  useEffect(() => {
    let isMounted = true;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player || !containerRef.current) return;
      if (playerRef.current) return;

      const playerElementId = 'youtube-player-frame';
      let element = document.getElementById(playerElementId);
      if (!element && containerRef.current) {
        element = document.createElement('div');
        element.id = playerElementId;
        containerRef.current.appendChild(element);
      }

      try {
        const player = new window.YT.Player(playerElementId, {
          width: '100%',
          height: '100%',
          videoId: MOVIE_SETTINGS.videoId,
          playerVars: {
            start: MOVIE_SETTINGS.start,
            end: MOVIE_SETTINGS.end + 5,
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
            controls: 1,
            cc_load_policy: 0,
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              if (!isMounted) return;
              playerRef.current = event.target;
              event.target.setPlaybackRate(playbackRate);
              setIsReady(true);
              setEmbedError(false);
              if (onPlayerReady) {
                onPlayerReady(event.target);
              }
            },
            onError: (event) => {
              console.warn('YouTube Player error code:', event.data);
              // Error 101 or 150 = owner does not allow embedding
              if (event.data === 101 || event.data === 150 || event.data === 2) {
                if (isMounted) setEmbedError(true);
              }
            },
            onStateChange: () => {
              // State updates
            },
          },
        });
      } catch (err) {
        console.error('Failed to create YouTube player:', err);
        if (isMounted) setEmbedError(true);
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const existingScript = document.getElementById('youtube-iframe-api');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        if (isMounted) initPlayer();
      };
    }

    return () => {
      isMounted = false;
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
    };
  }, []);

  // Update playback rate when prop changes
  useEffect(() => {
    if (playerRef.current && isReady) {
      try {
        playerRef.current.setPlaybackRate(playbackRate);
      } catch (err) {
        console.warn('Failed to set playback rate:', err);
      }
    }
  }, [playbackRate, isReady]);

  // Segment monitoring logic
  const stopSegment = useCallback(() => {
    isSegmentActiveRef.current = false;
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current);
      loopTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!segmentPlaying) {
      stopSegment();
      return;
    }

    stopSegment();
    const { start, end, loop } = segmentPlaying;
    const effectiveEnd = end <= start ? start + 1.2 : end;
    isSegmentActiveRef.current = true;

    const playSegmentInternal = () => {
      if (!isSegmentActiveRef.current) return;

      if (playerRef.current && isReady && !embedError) {
        try {
          playerRef.current.seekTo(start, true);
          playerRef.current.playVideo();
        } catch (err) {
          console.warn('Play video failed:', err);
        }
      }

      // 100ms polling to check boundary
      let virtualCurrent = start;
      const startTimeStamp = Date.now();

      checkIntervalRef.current = setInterval(() => {
        if (!isSegmentActiveRef.current) {
          if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
          return;
        }

        let time = virtualCurrent;
        if (playerRef.current && isReady && !embedError) {
          try {
            time = playerRef.current.getCurrentTime();
          } catch {
            // fallback to virtual
            const elapsed = ((Date.now() - startTimeStamp) / 1000) * playbackRate;
            time = start + elapsed;
          }
        } else {
          const elapsed = ((Date.now() - startTimeStamp) / 1000) * playbackRate;
          time = start + elapsed;
        }

        setCurrentTime(time);
        if (onTimeUpdate) onTimeUpdate(time);

        if (time >= effectiveEnd) {
          // Reached end of sentence
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
            checkIntervalRef.current = null;
          }

          if (playerRef.current && isReady && !embedError) {
            try {
              playerRef.current.pauseVideo();
            } catch (e) {
              console.warn(e);
            }
          }

          if (onSegmentEnd) {
            onSegmentEnd();
          }

          if (loop && isSegmentActiveRef.current) {
            // Wait 1.5 seconds for learner to shadow / repeat, then replay
            loopTimeoutRef.current = setTimeout(() => {
              if (isSegmentActiveRef.current) {
                playSegmentInternal();
              }
            }, 1500);
          } else {
            isSegmentActiveRef.current = false;
          }
        }
      }, 100);
    };

    playSegmentInternal();

    return () => {
      stopSegment();
    };
  }, [segmentPlaying, isReady, embedError, playbackRate, stopSegment, onTimeUpdate, onSegmentEnd]);

  // Fallback direct link
  const youtubeClipUrl = `${MOVIE_SETTINGS.youtubeUrl}&t=${MOVIE_SETTINGS.start}s`;

  return (
    <div className="w-full bg-slate-900 rounded-2xl overflow-hidden shadow-md flex flex-col">
      {/* 16:9 Video Area */}
      <div className="relative w-full aspect-video bg-black flex items-center justify-center">
        <div ref={containerRef} className="w-full h-full flex items-center justify-center">
          {/* Iframe dynamically attached here */}
        </div>

        {/* Fallback display if YouTube embed fails or is blocked */}
        {embedError && (
          <div className="absolute inset-0 bg-slate-900/95 text-white p-4 flex flex-col items-center justify-center text-center z-20">
            <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
            <p className="text-base font-semibold mb-1">
              This video can't play inside the app.
            </p>
            <p className="text-xs text-slate-300 mb-4">
              Tap below to open the official clip on YouTube in a new tab. All sentence practice, voice recording, and self-checks will still work!
            </p>
            <a
              href={youtubeClipUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#FFD93D] hover:bg-yellow-400 text-slate-900 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm active:scale-95"
            >
              <span>Open on YouTube (YouTube에서 보기)</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Fallback button if player is slow to load or user wants to verify clip */}
        {!embedError && !isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 text-sm gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#FFD93D]" />
            <span>Loading movie clip... (영상 불러오는 중)</span>
          </div>
        )}
      </div>

      {/* Mandatory one-line credit under the video player on every screen with a video */}
      {showCredit && (
        <div className="bg-slate-100 px-3 py-2 border-t border-slate-200">
          <p className="text-[13px] text-slate-600 text-center leading-relaxed">
            Clip: <span className="italic font-medium">{MOVIE_SETTINGS.titleEn}</span> ({MOVIE_SETTINGS.releaseYear}), {MOVIE_SETTINGS.distribution} / {MOVIE_SETTINGS.production} · via YouTube · For educational use only
          </p>
        </div>
      )}
    </div>
  );
};
