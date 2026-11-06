import React from 'react';
import { MOVIE_SETTINGS } from '../data/defaultData';
import { ShieldCheck, ExternalLink } from 'lucide-react';

export const EducationalNoticeCard: React.FC = () => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  const rangeFormatted = `${formatTime(MOVIE_SETTINGS.start)} – ${formatTime(MOVIE_SETTINGS.end)}`;

  return (
    <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 text-slate-700 shadow-sm">
      <div className="flex items-center gap-2 mb-3 text-slate-900">
        <ShieldCheck className="w-5 h-5 text-[#4267B2]" />
        <h3 className="font-bold text-sm tracking-tight">
          Educational Use & Source / 교육용 고지 및 출처
        </h3>
      </div>

      {/* Notice Text */}
      <div className="space-y-2 text-xs leading-relaxed border-b border-slate-200 pb-3 mb-3 text-slate-600">
        <p className="font-semibold text-slate-800">
          Educational use only / 교육 목적 전용
        </p>
        <p>
          This app was made <strong>only for non-commercial English learning</strong> in the university course <em>AI and English Language Education</em> (ENG3088, Sungkyunkwan University). The film clip is used <strong>only to practice listening and speaking (shadowing)</strong>. It is not sold, shared for profit, downloaded, or edited. All rights to the film belong to its copyright holders.
        </p>
        <p className="text-slate-500">
          이 앱은 성균관대학교 「인공지능과 영어교육」(ENG3088) 수업의 <strong>비영리 영어 학습 목적으로만</strong> 제작되었습니다. 영화 장면은 듣기·말하기(쉐도잉) 연습에만 사용하며, 판매·영리적 배포·다운로드·편집을 하지 않습니다. 영화의 모든 권리는 저작권자에게 있습니다.
        </p>
        <p className="text-slate-500 text-[11px] pt-1">
          Made by: <span className="font-medium text-slate-700">{MOVIE_SETTINGS.madeBy}</span>
        </p>
      </div>

      {/* Source Metadata Table */}
      <div className="text-[12px] space-y-1.5 text-slate-600">
        <div className="flex justify-between py-0.5 border-b border-slate-100">
          <span className="text-slate-400">Movie Title / 영화명</span>
          <span className="font-medium text-slate-800 text-right">
            {MOVIE_SETTINGS.titleEn} ({MOVIE_SETTINGS.titleKo})
          </span>
        </div>
        <div className="flex justify-between py-0.5 border-b border-slate-100">
          <span className="text-slate-400">Release / 개봉</span>
          <span className="text-slate-700">{MOVIE_SETTINGS.releaseYear}</span>
        </div>
        <div className="flex justify-between py-0.5 border-b border-slate-100">
          <span className="text-slate-400">Director / 감독</span>
          <span className="text-slate-700">{MOVIE_SETTINGS.director}</span>
        </div>
        <div className="flex justify-between py-0.5 border-b border-slate-100">
          <span className="text-slate-400">Screenplay / 각본</span>
          <span className="text-slate-700 text-right">{MOVIE_SETTINGS.screenplay}</span>
        </div>
        <div className="flex justify-between py-0.5 border-b border-slate-100">
          <span className="text-slate-400">Production / 제작</span>
          <span className="text-slate-700">{MOVIE_SETTINGS.production}</span>
        </div>
        <div className="flex justify-between py-0.5 border-b border-slate-100">
          <span className="text-slate-400">Distribution / 배급</span>
          <span className="text-slate-700">{MOVIE_SETTINGS.distribution}</span>
        </div>
        <div className="py-1 border-b border-slate-100">
          <span className="text-slate-400 block mb-0.5">Scene / 장면 설명</span>
          <span className="text-slate-700 leading-snug block">{MOVIE_SETTINGS.sceneDescription}</span>
        </div>
        <div className="py-1 border-b border-slate-100">
          <span className="text-slate-400 block mb-0.5">YouTube Clip / 클립명</span>
          <span className="text-slate-700 block font-medium">{MOVIE_SETTINGS.youtubeTitle}</span>
          <span className="text-[11px] text-slate-500">Channel: {MOVIE_SETTINGS.youtubeChannel}</span>
        </div>
        <div className="flex justify-between py-0.5 border-b border-slate-100">
          <span className="text-slate-400">Practice Range / 학습 구간</span>
          <span className="font-semibold text-[#4267B2]">{rangeFormatted} (0s – 58s)</span>
        </div>
        <div className="pt-2 flex justify-end">
          <a
            href={MOVIE_SETTINGS.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#4267B2] hover:text-blue-800 font-semibold underline underline-offset-2"
          >
            <span>Watch Original on YouTube</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
