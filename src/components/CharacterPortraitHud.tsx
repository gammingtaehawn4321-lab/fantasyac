import { Shield, Sparkles, Heart, Zap, Brain, MessageSquareQuote } from 'lucide-react';
import { PlayerState } from '../types';
import { getRaceDefinition } from '../data/raceData';

interface CharacterPortraitHudProps {
  playerState: PlayerState;
  isLoading?: boolean;
  onClick: () => void;
}

export function CharacterPortraitHud({
  playerState,
  isLoading,
  onClick,
}: CharacterPortraitHudProps) {
  const raceDef = getRaceDefinition(playerState.race || 'HUMAN', playerState.beastkinType);
  const profile = playerState.profile;
  const inGameName = profile?.inGameName || playerState.characterName || '모험가';
  const portraitUrl = profile?.portraitUrl;

  const hpPercent = Math.min(100, Math.max(0, (playerState.hp / playerState.maxHp) * 100));
  const mpPercent = Math.min(100, Math.max(0, (playerState.mana / playerState.maxMana) * 100));
  const sanityPercent = Math.min(100, Math.max(0, (playerState.sanity / playerState.maxSanity) * 100));

  // Determine fallback background/gradient based on race
  const getRaceAvatarBg = () => {
    if (playerState.race === 'ELF') return 'from-emerald-950 to-teal-900 text-emerald-300';
    if (playerState.race === 'BEASTKIN') return 'from-amber-950 to-stone-900 text-amber-300';
    return 'from-stone-900 to-stone-800 text-amber-200';
  };

  return (
    <div
      onClick={onClick}
      id="character-portrait-hud"
      role="button"
      tabIndex={0}
      title="캐릭터 상세 상태창 열기"
      className="group relative flex items-center gap-2.5 p-1.5 pr-3 bg-stone-900/90 hover:bg-stone-850 active:bg-stone-800 border border-stone-750/90 hover:border-amber-500/50 rounded-xl shadow-lg cursor-pointer transition-all duration-200 select-none backdrop-blur-xs"
    >
      {/* Portrait Box (64px - 72px) */}
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-amber-500/30 bg-stone-950 shrink-0 shadow-inner flex items-center justify-center group-hover:border-amber-400/70 transition">
        {portraitUrl ? (
          <img
            src={portraitUrl}
            alt={inGameName}
            className="w-full h-full object-cover object-top transition duration-300 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-b ${getRaceAvatarBg()} flex flex-col items-center justify-center p-1 text-center`}
          >
            <span className="text-xl sm:text-2xl drop-shadow-sm">{raceDef.iconSymbol}</span>
            <span className="text-[9px] font-bold tracking-tighter opacity-80 leading-none mt-0.5">
              {raceDef.subName || raceDef.name}
            </span>
          </div>
        )}

        {/* Level Badge Overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-stone-950/85 backdrop-blur-xs text-[9px] font-mono font-bold text-amber-300 text-center py-0.5 border-t border-stone-800/80">
          Lv.{playerState.level}
        </div>

        {/* Loading Ring / Pulse */}
        {isLoading && (
          <div className="absolute inset-0 border-2 border-amber-400 border-t-transparent rounded-lg animate-spin" />
        )}
      </div>

      {/* Info Column */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Name & Race Tag */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs sm:text-sm font-bold text-stone-100 truncate group-hover:text-amber-300 transition">
            {inGameName}
          </span>
          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium shrink-0">
            {raceDef.subName || raceDef.name}
          </span>
        </div>

        {/* HP Bar */}
        <div className="space-y-0.5">
          <div className="flex justify-between items-center text-[9px] leading-tight">
            <span className="font-bold text-rose-400 flex items-center gap-0.5">
              <Heart className="w-2.5 h-2.5 fill-rose-500/30 shrink-0" />
              <span>HP</span>
            </span>
            <span className="font-mono text-stone-400 text-[9px]">
              {playerState.hp}/{playerState.maxHp}
            </span>
          </div>
          <div className="w-24 sm:w-28 h-1 bg-stone-950 rounded-full overflow-hidden border border-stone-800/80">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                playerState.hp <= playerState.maxHp * 0.25 ? 'bg-red-500 animate-pulse' : 'bg-rose-500'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* MP Bar */}
        <div className="space-y-0.5">
          <div className="flex justify-between items-center text-[9px] leading-tight">
            <span className="font-bold text-sky-400 flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5 fill-sky-500/30 shrink-0" />
              <span>MP</span>
            </span>
            <span className="font-mono text-stone-400 text-[9px]">
              {playerState.mana}/{playerState.maxMana}
            </span>
          </div>
          <div className="w-24 sm:w-28 h-1 bg-stone-950 rounded-full overflow-hidden border border-stone-800/80">
            <div
              className="h-full bg-sky-500 transition-all duration-300 rounded-full"
              style={{ width: `${mpPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
