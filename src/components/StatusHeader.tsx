import type { ReactNode } from 'react';
import { RotateCcw, Heart, Zap, Brain, Home, Clock } from 'lucide-react';
import { PlayerState } from '../types';
import { getRequiredExp, formatGameTime } from '../gameEngine';
import { CharacterPortraitHud } from './CharacterPortraitHud';

interface StatusHeaderProps {
  playerState: PlayerState;
  isLoading: boolean;
  onReset: () => void;
  onOpenStatus: () => void;
  onGoToTitle?: () => void;
}

function Gauge({
  label,
  valueText,
  percent,
  barClass,
}: {
  label: ReactNode;
  valueText: string;
  percent: number;
  barClass: string;
}) {
  return (
    <div className="min-w-0 space-y-1">
      <div className="flex items-center justify-between gap-1 text-[10px] leading-none">
        <span className="font-bold text-stone-300 truncate">{label}</span>
        <span className="font-mono text-stone-400 whitespace-nowrap">{valueText}</span>
      </div>
      <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barClass}`}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  );
}

export function StatusHeader({
  playerState,
  isLoading,
  onReset,
  onOpenStatus,
  onGoToTitle,
}: StatusHeaderProps) {
  const nextExp = getRequiredExp(playerState.level);
  const desire = playerState.adultStatus?.desire;

  return (
    <header className="sticky top-0 flex-none shrink-0 w-full bg-stone-900/98 backdrop-blur border-b border-stone-800 px-3 py-2 z-40 select-none shadow-lg">
      <div className="w-full max-w-3xl mx-auto space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CharacterPortraitHud
              playerState={playerState}
              isLoading={isLoading}
              onClick={onOpenStatus}
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div
              id="header-game-time-badge"
              className="min-h-[32px] flex items-center gap-1.5 px-2 sm:px-2.5 py-1 bg-stone-950/80 border border-stone-800 rounded-lg text-amber-300 font-mono text-[11px] font-semibold select-none"
              title="현재 게임 시간"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{formatGameTime(playerState)}</span>
            </div>

            {onGoToTitle && (
              <button
                id="header-title-screen-btn"
                onClick={onGoToTitle}
                disabled={isLoading}
                className="min-h-[32px] flex items-center justify-center gap-1 text-[11px] font-medium text-stone-400 hover:text-stone-100 bg-stone-900 hover:bg-stone-800 border border-stone-800 px-2 py-1 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
                title="메인 화면으로 이동"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">메인</span>
              </button>
            )}

            <button
              id="reset-game-button"
              onClick={onReset}
              disabled={isLoading}
              className="min-h-[32px] shrink-0 flex items-center justify-center gap-1 text-[11px] font-medium text-stone-300 hover:text-stone-100 bg-stone-800 border border-stone-700 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
              title="새 게임 / 캐릭터 재생성"
            >
              <RotateCcw className="w-3 h-3" />
              <span>새로 시작</span>
            </button>
          </div>
        </div>

        {/* 메인 상태창: HP / MP / 정신력 / 경험치 / 성욕 */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-x-2 gap-y-2 bg-stone-950/80 border border-stone-800 rounded-xl px-3 py-2">
          <Gauge
            label={<span className="flex items-center gap-1 text-rose-400"><Heart className="w-3 h-3" />HP</span>}
            valueText={`${playerState.hp}/${playerState.maxHp}`}
            percent={(playerState.hp / Math.max(1, playerState.maxHp)) * 100}
            barClass="bg-rose-500"
          />
          <Gauge
            label={<span className="flex items-center gap-1 text-sky-400"><Zap className="w-3 h-3" />MP</span>}
            valueText={`${playerState.mana}/${playerState.maxMana}`}
            percent={(playerState.mana / Math.max(1, playerState.maxMana)) * 100}
            barClass="bg-sky-500"
          />
          <Gauge
            label={<span className="flex items-center gap-1 text-purple-400"><Brain className="w-3 h-3" />정신력</span>}
            valueText={`${playerState.sanity}/${playerState.maxSanity}`}
            percent={(playerState.sanity / Math.max(1, playerState.maxSanity)) * 100}
            barClass="bg-purple-500"
          />
          <Gauge
            label={<span className="text-amber-400">EXP</span>}
            valueText={`${playerState.experience}/${nextExp}`}
            percent={(playerState.experience / Math.max(1, nextExp)) * 100}
            barClass="bg-amber-400"
          />
          <Gauge
            label={<span className="text-pink-400">성욕</span>}
            valueText={typeof desire === 'number' ? `${desire}/100` : '—'}
            percent={typeof desire === 'number' ? desire : 0}
            barClass="bg-pink-500"
          />
        </div>
      </div>
    </header>
  );
}
