import React, { useMemo, useState } from 'react';
import {
  X,
  Boxes,
  Droplets,
  CircleDot,
  Bug,
  FlaskConical,
  Baby,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PlayerState, BodyCompartmentId, BodyLoadStage, BodyPayloadKind } from '../types';
import {
  BODY_COMPARTMENT_CAPACITY,
  BODY_STATUS_VISUALS,
  BLADDER_STATUS_VISUAL,
} from '../data/bodySystemConfig';
import { getBodyLoadStage } from '../gameEngine';

interface InternalStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerState: PlayerState;
}

const COMPARTMENTS: BodyCompartmentId[] = [
  'COMPARTMENT_1',
  'COMPARTMENT_2',
  'COMPARTMENT_3',
];

const STAGE_LABELS: Record<BodyLoadStage, string> = {
  EMPTY: '없음',
  TRACE: '미량',
  LOW: '적음',
  MEDIUM: '보통',
  HIGH: '많음',
  SATURATED: '포화',
};

const PAYLOAD_LABELS: Record<BodyPayloadKind, string> = {
  STANDARD_FLUID: '일반 내용물',
  INSECTOID_SECRETION: '곤충형 분비물',
  URINE: '외부 소변',
  EGG: '알',
  PARASITE: '기생체',
  OTHER: '기타',
};

const PAYLOAD_ICONS: Partial<Record<BodyPayloadKind, React.ComponentType<{ className?: string }>>> = {
  STANDARD_FLUID: Droplets,
  INSECTOID_SECRETION: FlaskConical,
  URINE: Droplets,
  EGG: CircleDot,
  PARASITE: Bug,
};

const pregnancyLabel = (stage?: string) => {
  switch (stage) {
    case 'EARLY': return '초기';
    case 'MID': return '중기';
    case 'LATE': return '후기';
    case 'READY': return '완료 단계';
    default: return '미확인';
  }
};

const parasiteModeLabel = (mode?: string) => mode === 'INSERTED' ? '기생 삽입형' : '내부 기생형';
const parasiteStageLabel = (stage?: string) => {
  switch (stage) {
    case 'DORMANT': return '휴면';
    case 'DEVELOPING': return '성장 중';
    case 'MATURE': return '성숙';
    case 'RESOLVING': return '변화 중';
    default: return '미확인';
  }
};

export function InternalStatusModal({ isOpen, onClose, playerState }: InternalStatusModalProps) {
  const [showEmpty, setShowEmpty] = useState(false);

  const compartmentData = useMemo(() => {
    return COMPARTMENTS.map((compartmentId) => {
      const entries = (playerState.bodyPayloads ?? []).filter((entry) => entry.compartmentId === compartmentId);
      const total = entries.reduce((sum, entry) => sum + Math.max(0, Number(entry.amount) || 0), 0);
      const capacity = BODY_COMPARTMENT_CAPACITY[compartmentId];
      const stage = getBodyLoadStage(total, compartmentId);
      const ratio = Math.min(100, Math.max(0, Math.round((total / Math.max(1, capacity)) * 100)));
      return { compartmentId, entries, total, capacity, stage, ratio };
    });
  }, [playerState.bodyPayloads]);

  if (!isOpen) return null;

  const pregnancy = playerState.pregnancy;
  const parasites = playerState.parasiteStates ?? [];
  const bladder = playerState.bladderStatus;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-5xl max-h-[92dvh] overflow-hidden rounded-2xl border border-stone-800 bg-stone-950 shadow-2xl flex flex-col">
        <header className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-stone-800 bg-stone-950/95">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-center justify-center">
              <Boxes className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-100">내부 상태</h2>
              <p className="text-[10px] sm:text-[11px] text-stone-500">현재 구획별 부하와 지속 상태를 요약합니다.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800" aria-label="닫기">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 custom-scrollbar">
          {(pregnancy?.active || parasites.length > 0) && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pregnancy?.active && (
                <div className="rounded-xl bg-stone-900/55 border border-stone-800 p-3.5 space-y-2.5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-stone-200">
                    <Baby className="w-4 h-4 text-amber-300" /> 임신 상태
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-lg bg-stone-950/70 p-2 border border-stone-800/70">
                      <span className="block text-stone-500 text-[10px]">단계</span>
                      <span className="text-stone-200 font-medium">{pregnancyLabel(pregnancy.stage)}</span>
                    </div>
                    <div className="rounded-lg bg-stone-950/70 p-2 border border-stone-800/70">
                      <span className="block text-stone-500 text-[10px]">진행률</span>
                      <span className="text-stone-200 font-mono font-semibold">
                        {Math.min(100, Math.round((pregnancy.elapsedMinutes / Math.max(1, pregnancy.gestationMinutes)) * 100))}%
                      </span>
                    </div>
                  </div>
                  {pregnancy.childSpeciesId && (
                    <div className="text-[11px] text-stone-400">예상 종족 <span className="text-amber-300 font-medium">{pregnancy.childSpeciesId}</span></div>
                  )}
                </div>
              )}

              {parasites.length > 0 && (
                <div className="rounded-xl bg-stone-900/55 border border-stone-800 p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-stone-200">
                    <Bug className="w-4 h-4 text-rose-300" /> 기생 상태
                    <span className="ml-auto text-[10px] text-stone-500 font-mono">{parasites.length}건</span>
                  </div>
                  <div className="space-y-1.5">
                    {parasites.slice(0, 6).map((parasite) => (
                      <div key={parasite.id} className="flex items-center justify-between gap-2 rounded-lg bg-stone-950/70 border border-stone-800/70 px-2.5 py-2 text-[10px]">
                        <div className="min-w-0">
                          <div className="text-stone-300 font-medium truncate">{parasiteModeLabel(parasite.mode)} · {parasite.speciesId}</div>
                          <div className="text-stone-500">{parasiteStageLabel(parasite.stage)} · 수량 {parasite.count}</div>
                        </div>
                        <span className="text-stone-500 shrink-0">{parasite.compartmentId ? BODY_STATUS_VISUALS[parasite.compartmentId]?.label || '미지정 부위' : '내부'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          <section>
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <h3 className="text-xs font-semibold text-stone-200">구획별 상태</h3>
                <p className="text-[10px] text-stone-500 mt-0.5">이미지는 나중에 설정 파일에서 연결할 수 있습니다.</p>
              </div>
              <button
                onClick={() => setShowEmpty((v) => !v)}
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-900"
              >
                {showEmpty ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {showEmpty ? '0값 숨기기' : '0값 표시'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {compartmentData.map(({ compartmentId, entries, total, capacity, stage, ratio }) => {
                const visual = BODY_STATUS_VISUALS[compartmentId];
                const visibleEntries = showEmpty
                  ? (Object.keys(PAYLOAD_LABELS) as BodyPayloadKind[]).map((kind) => ({
                      kind,
                      amount: entries.filter((entry) => entry.payloadKind === kind).reduce((sum, entry) => sum + entry.amount, 0),
                    }))
                  : (Object.keys(PAYLOAD_LABELS) as BodyPayloadKind[])
                      .map((kind) => ({
                        kind,
                        amount: entries.filter((entry) => entry.payloadKind === kind).reduce((sum, entry) => sum + entry.amount, 0),
                      }))
                      .filter((entry) => entry.amount > 0);

                return (
                  <article key={compartmentId} className="overflow-hidden rounded-xl border border-stone-800 bg-stone-900/55 shadow-sm">
                    <div className="aspect-[4/3] bg-stone-950 border-b border-stone-800 flex items-center justify-center overflow-hidden">
                      {visual.imageSrc ? (
                        <img src={visual.imageSrc} alt={visual.imageAlt || visual.label || '상태 이미지'} className="w-full h-full object-contain object-center p-2" />
                      ) : (
                        <div className="text-center px-4">
                          <Boxes className="w-7 h-7 mx-auto text-stone-800 mb-2" />
                          <span className="text-[10px] text-stone-700">상태 이미지 영역</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-semibold text-stone-200">{visual.label || '미지정 부위'}</div>
                          <div className="text-[10px] text-stone-500 mt-0.5">{STAGE_LABELS[stage]}</div>
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono">{Math.round(total)} / {capacity}</span>
                      </div>

                      <div className="h-1.5 rounded-full bg-stone-950 border border-stone-800 overflow-hidden">
                        <div className="h-full bg-amber-500/80 transition-all duration-300" style={{ width: `${ratio}%` }} />
                      </div>

                      <div className="space-y-1 min-h-[22px]">
                        {visibleEntries.length === 0 ? (
                          <div className="text-[10px] text-stone-600">현재 표시할 내용 없음</div>
                        ) : visibleEntries.map(({ kind, amount }) => {
                          const Icon = PAYLOAD_ICONS[kind] || CircleDot;
                          return (
                            <div key={kind} className="flex items-center justify-between gap-2 text-[10px] text-stone-400">
                              <span className="flex items-center gap-1.5 min-w-0"><Icon className="w-3 h-3 text-stone-500" />{PAYLOAD_LABELS[kind]}</span>
                              <span className="font-mono text-stone-300">{Math.round(amount)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-stone-800 bg-stone-900/55 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
              <div className="min-h-[120px] md:min-h-[150px] bg-stone-950 border-b md:border-b-0 md:border-r border-stone-800 flex items-center justify-center overflow-hidden">
                {BLADDER_STATUS_VISUAL.imageSrc ? (
                  <img src={BLADDER_STATUS_VISUAL.imageSrc} alt={BLADDER_STATUS_VISUAL.imageAlt || BLADDER_STATUS_VISUAL.label} className="w-full h-full object-contain object-center p-2" />
                ) : (
                  <div className="text-center"><Droplets className="w-7 h-7 mx-auto text-stone-800 mb-2" /><span className="text-[10px] text-stone-700">방광 상태 이미지 영역</span></div>
                )}
              </div>
              <div className="p-3.5 flex flex-col justify-center gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-semibold text-stone-200">{BLADDER_STATUS_VISUAL.label || '소변 욕구'}</h3>
                    <p className="text-[10px] text-stone-500 mt-0.5">외부 URINE payload와 별도로 관리됩니다.</p>
                  </div>
                  <span className="font-mono text-sm font-semibold text-amber-300">{Math.round(bladder?.urge ?? 0)}%</span>
                </div>
                <div className="h-2 bg-stone-950 rounded-full border border-stone-800 overflow-hidden">
                  <div className="h-full bg-amber-500/80 transition-all duration-300" style={{ width: `${Math.min(100, Math.max(0, bladder?.urge ?? 0))}%` }} />
                </div>
                <div className="text-[10px] text-stone-400 flex justify-between">
                  <span>현재량</span>
                  <span className="font-mono">{Math.round(bladder?.amount ?? 0)} / {Math.round(bladder?.capacity ?? 100)}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
