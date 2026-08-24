import { Play, UserPlus, Flame, Shield, Brain, Heart, Zap, Sparkles, BookOpen, Clock, RefreshCw } from 'lucide-react';
import { PlayerState } from '../types';
import { getRaceDefinition } from '../data/raceData';

interface MainTitleScreenProps {
  hasSavedGame: boolean;
  savedPlayerState: PlayerState | null;
  onContinueGame: () => void;
  onStartNewGame: () => void;
}

export function MainTitleScreen({
  hasSavedGame,
  savedPlayerState,
  onContinueGame,
  onStartNewGame,
}: MainTitleScreenProps) {
  const raceDef = savedPlayerState
    ? getRaceDefinition(savedPlayerState.race || 'HUMAN', savedPlayerState.beastkinType)
    : null;

  const charName =
    savedPlayerState?.characterName || savedPlayerState?.profile?.inGameName || '모험가';

  return (
    <div className="relative min-h-screen w-full bg-stone-950 text-stone-100 flex flex-col justify-between overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-200">
      {/* Dark fantasy ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-amber-600/10 via-red-900/5 to-transparent blur-3xl opacity-60" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-red-950/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-900/40 via-stone-950/90 to-stone-950" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 max-w-2xl mx-auto w-full">
        {/* Title & Branding */}
        <div className="text-center space-y-3 mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900/90 border border-stone-800 text-stone-400 text-xs tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Dark Fantasy Text RPG</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-stone-100 via-stone-200 to-stone-400 drop-shadow-lg">
            판타지악
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
            자유로운 선택과 끝없는 서사가 펼쳐지는 인터랙티브 TRPG. 미지의 대륙에서 당신만의 전설을 기록하세요.
          </p>
        </div>

        {/* Saved Game Preview Card if available */}
        {hasSavedGame && savedPlayerState && raceDef && (
          <div className="w-full bg-stone-900/80 border border-stone-800/90 hover:border-amber-500/40 transition-all rounded-2xl p-4 sm:p-5 mb-6 backdrop-blur-sm shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-800 text-xs">
              <span className="flex items-center gap-1.5 font-bold text-amber-400">
                <BookOpen className="w-4 h-4" /> 최근 모험 기록
              </span>
              <span className="text-[11px] text-stone-400 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" /> LOG {savedPlayerState.dialogueCount ?? 0}회 진행됨
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              {/* Portrait or Symbol */}
              {savedPlayerState.profile?.portraitUrl ? (
                <img
                  src={savedPlayerState.profile.portraitUrl}
                  alt={charName}
                  className="w-14 h-14 rounded-xl object-cover border border-amber-500/40 shrink-0 bg-stone-950"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-center text-3xl shrink-0">
                  {raceDef.iconSymbol}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-stone-100 text-base">{charName}</span>
                  <span className="text-xs bg-stone-800 text-stone-300 px-2 py-0.5 rounded border border-stone-700">
                    {raceDef.name}
                  </span>
                  <span className="text-xs font-bold text-amber-400">
                    Lv.{savedPlayerState.level}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2 text-[11px] text-stone-400">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-400" /> {savedPlayerState.hp}/{savedPlayerState.maxHp}
                  </span>
                  <span className="flex items-center gap-1">
                    <Brain className="w-3 h-3 text-purple-400" /> {savedPlayerState.sanity}/{savedPlayerState.maxSanity}
                  </span>
                  <span className="text-amber-400 font-mono">
                    💰 {savedPlayerState.rupees.toLocaleString()} 루피
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Action Buttons */}
        <div className="w-full space-y-3">
          {/* Continue Game Button */}
          <button
            id="main-continue-game-btn"
            onClick={onContinueGame}
            disabled={!hasSavedGame}
            className={`w-full min-h-[52px] flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-bold text-base transition-all shadow-lg cursor-pointer ${
              hasSavedGame
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-amber-500/10 active:scale-[0.99]'
                : 'bg-stone-900 border border-stone-800 text-stone-600 cursor-not-allowed opacity-60'
            }`}
          >
            <Play className="w-5 h-5 fill-current" />
            <span>이어하기</span>
            {!hasSavedGame && <span className="text-xs font-normal text-stone-600">(저장된 기록 없음)</span>}
          </button>

          {/* New Game Button */}
          <button
            id="main-new-game-btn"
            onClick={onStartNewGame}
            className="w-full min-h-[50px] flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-stone-900 hover:bg-stone-800 text-stone-200 hover:text-stone-100 border border-stone-700 hover:border-amber-500/50 transition-all cursor-pointer active:scale-[0.99]"
          >
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>새 게임 시작</span>
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-3 gap-2.5 w-full mt-8 text-center text-xs">
          <div className="p-3 bg-stone-900/50 border border-stone-800/80 rounded-xl space-y-1">
            <div className="font-bold text-stone-300">자유로운 텍스트 행동</div>
            <div className="text-[11px] text-stone-500">모든 명령 직접 입력</div>
          </div>
          <div className="p-3 bg-stone-900/50 border border-stone-800/80 rounded-xl space-y-1">
            <div className="font-bold text-stone-300">캐릭터 말투 & 성격</div>
            <div className="text-[11px] text-stone-500">고유한 어조 서사 반영</div>
          </div>
          <div className="p-3 bg-stone-900/50 border border-stone-800/80 rounded-xl space-y-1">
            <div className="font-bold text-stone-300">다크 판타지 세계관</div>
            <div className="text-[11px] text-stone-500">종족별 고유 상호작용</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 py-4 text-center text-[11px] text-stone-600 border-t border-stone-900">
        『판타지악』 · AI Interactive Dark Fantasy Text RPG
      </div>
    </div>
  );
}
