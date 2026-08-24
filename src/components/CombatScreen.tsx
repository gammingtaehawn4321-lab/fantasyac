import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Swords,
  Shield,
  Heart,
  Zap,
  Flame,
  Droplets,
  AlertTriangle,
  Wind,
  Footprints,
  Sparkles,
  Send,
  Skull,
  Trophy,
  Activity,
  Maximize2,
} from 'lucide-react';
import { BattleState, BattleActor, BattleLogEntry, StatusEffect } from '../combat/combatTypes';
import { PlayerState } from '../types';
import { processPlayerTurn, attemptEscape } from '../combat/battleEngine';
import { getSkillDefinition } from '../data/skills';
import { getCombatClass } from '../data/classes';

interface CombatScreenProps {
  playerState: PlayerState;
  battleState: BattleState;
  onUpdateBattle: (nextBattle: BattleState) => void;
  onBattleEnd: (outcome: 'VICTORY' | 'DEFEAT' | 'ESCAPED', rewards?: { exp: number; rupees: number; items?: any[] }) => void;
}

export const CombatScreen: React.FC<CombatScreenProps> = ({
  playerState,
  battleState,
  onUpdateBattle,
  onBattleEnd,
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string>(
    battleState.enemies.find((e) => e.hp > 0)?.id || ''
  );
  const [freeActionInput, setFreeActionInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFreeActionModal, setShowFreeActionModal] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [battleState.battleLog]);

  // Keep target valid if enemy dies
  useEffect(() => {
    const currentTarget = battleState.enemies.find((e) => e.id === selectedTargetId && e.hp > 0);
    if (!currentTarget) {
      const firstAlive = battleState.enemies.find((e) => e.hp > 0);
      if (firstAlive) {
        setSelectedTargetId(firstAlive.id);
      }
    }
  }, [battleState.enemies, selectedTargetId]);

  const playerActor = battleState.player;
  const currentTarget = battleState.enemies.find((e) => e.id === selectedTargetId) || battleState.enemies[0];
  const classDef = getCombatClass(playerState.combatClass);

  const handleExecuteSkill = async (skillId: string) => {
    if (isProcessing || battleState.phase !== 'PLAYER_TURN') return;

    const skillDef = getSkillDefinition(skillId);
    if (skillDef && skillDef.mpCost && playerActor.mp < skillDef.mpCost) {
      alert('마나가 부족합니다!');
      return;
    }

    setIsProcessing(true);

    try {
      const result = processPlayerTurn(battleState, skillId, selectedTargetId, playerState);
      onUpdateBattle(result.battleState);

      if (result.isBattleEnded && result.outcome) {
        setTimeout(() => {
          onBattleEnd(result.outcome!, result.rewards);
        }, 1200);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFreeActionSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!freeActionInput.trim() || isProcessing) return;

    setIsProcessing(true);
    setShowFreeActionModal(false);

    try {
      // Call server to analyze free-form intent
      const res = await fetch('/api/battle/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: freeActionInput.trim(),
          playerActor,
          enemies: battleState.enemies,
          battlefield: battleState.battlefield,
          speechStyle: playerState.profile?.speechStyle,
        }),
      });

      const data = await res.json();
      const suggestedSkill = data.suggestedSkillOrEffect || 'basic_attack';

      // Insert the descriptive narrative from GM first
      const narrativeEntry: BattleLogEntry = {
        id: `free_${Date.now()}`,
        turn: battleState.turn,
        actorName: playerActor.name,
        isPlayer: true,
        text: data.actionNarrative || `${playerActor.name}(이)가 기지를 발휘하여 행동을 개시했다.`,
        speechText: data.speechLine,
        badge: { text: '자유 행동', type: 'info' },
        timestamp: Date.now(),
      };

      const intermediateState: BattleState = {
        ...battleState,
        battleLog: [...battleState.battleLog, narrativeEntry],
      };

      if (data.actionType === 'ESCAPE') {
        const escapeRes = attemptEscape(intermediateState, playerState);
        onUpdateBattle(escapeRes.battleState);
        if (escapeRes.isBattleEnded && escapeRes.outcome) {
          setTimeout(() => onBattleEnd(escapeRes.outcome!), 1000);
        }
      } else {
        const result = processPlayerTurn(intermediateState, suggestedSkill, selectedTargetId, playerState);
        onUpdateBattle(result.battleState);
        if (result.isBattleEnded && result.outcome) {
          setTimeout(() => onBattleEnd(result.outcome!, result.rewards), 1200);
        }
      }

      setFreeActionInput('');
    } catch (err) {
      console.error('Free-form battle action failed:', err);
      // Fallback to basic attack
      const result = processPlayerTurn(battleState, 'basic_attack', selectedTargetId, playerState);
      onUpdateBattle(result.battleState);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEscape = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    const result = attemptEscape(battleState, playerState);
    onUpdateBattle(result.battleState);

    if (result.isBattleEnded && result.outcome) {
      setTimeout(() => onBattleEnd(result.outcome!), 1200);
    }
    setIsProcessing(false);
  };

  const renderStatusBadges = (effects: StatusEffect[]) => {
    if (!effects || effects.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {effects.map((eff) => {
          let bg = 'bg-slate-700 text-slate-200';
          if (eff.type === 'BLEED') bg = 'bg-rose-900/80 text-rose-200 border-rose-700';
          if (eff.type === 'POISON') bg = 'bg-emerald-900/80 text-emerald-200 border-emerald-700';
          if (eff.type === 'STUN') bg = 'bg-amber-900/80 text-amber-200 border-amber-700';
          if (eff.type === 'SHIELD' || eff.type === 'DEFEND') bg = 'bg-blue-900/80 text-blue-200 border-blue-700';

          return (
            <span
              key={eff.id}
              className={`text-[10px] px-1.5 py-0.5 rounded border ${bg} flex items-center gap-1 font-medium`}
              title={`${eff.name} (${eff.duration}턴 지속)`}
            >
              {eff.type === 'BLEED' && <Droplets className="w-2.5 h-2.5" />}
              {eff.type === 'POISON' && <Flame className="w-2.5 h-2.5" />}
              {eff.type === 'STUN' && <AlertTriangle className="w-2.5 h-2.5" />}
              {eff.type === 'SHIELD' && <Shield className="w-2.5 h-2.5" />}
              {eff.name} <span className="opacity-75">{eff.duration}T</span>
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-stone-950 text-stone-100 select-none overflow-hidden">
      {/* 1. 상단 전장 정보 바 */}
      <header className="flex items-center justify-between px-4 py-2 bg-stone-900/90 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800 text-xs font-bold tracking-wider flex items-center gap-1">
            <Swords className="w-3.5 h-3.5 text-red-400" />
            {battleState.turn}턴
          </span>
          <div className="text-xs text-stone-400 flex items-center gap-1">
            <span className="text-stone-300 font-semibold">{battleState.battlefield.name}</span>
            <span className="hidden sm:inline text-stone-500">| {battleState.battlefield.description}</span>
          </div>
        </div>

        {battleState.canEscape && (
          <button
            onClick={handleEscape}
            disabled={isProcessing || battleState.phase !== 'PLAYER_TURN'}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition disabled:opacity-50"
          >
            <Footprints className="w-3.5 h-3.5 text-stone-400" />
            <span>도주 시도</span>
          </button>
        )}
      </header>

      {/* 2. 대치 아레나 (VS 대형 뷰어) */}
      <div className="p-3 sm:p-4 bg-gradient-to-b from-stone-900 to-stone-950 border-b border-stone-800/80">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-5xl mx-auto">
          {/* 플레이어 카드 */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-900/80 border border-stone-800 shadow-md">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-stone-800 border border-stone-700 flex-shrink-0 flex items-center justify-center relative">
              {playerActor.portraitUrl ? (
                <img
                  src={playerActor.portraitUrl}
                  alt={playerActor.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-stone-500 text-2xl font-serif">
                  {playerActor.name.charAt(0)}
                </div>
              )}
              {playerActor.statusEffects.some((s) => s.type === 'DEFEND') && (
                <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-blue-400 drop-shadow" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-stone-100 text-sm sm:text-base truncate">
                    {playerActor.name}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60 font-mono">
                    Lv.{playerActor.level}
                  </span>
                </div>
                <span className="text-[11px] text-stone-400">
                  {classDef?.name || '무직'}
                </span>
              </div>

              {/* HP 바 */}
              <div className="mt-1.5">
                <div className="flex justify-between text-[11px] font-mono text-stone-400 mb-0.5">
                  <span className="flex items-center gap-1 text-rose-400">
                    <Heart className="w-3 h-3 fill-rose-500/20" /> HP
                  </span>
                  <span>
                    {playerActor.hp} / {playerActor.maxHp}
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-rose-600 to-red-500"
                    initial={false}
                    animate={{ width: `${Math.max(0, Math.min(100, (playerActor.hp / playerActor.maxHp) * 100))}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* MP 바 */}
              <div className="mt-1">
                <div className="flex justify-between text-[11px] font-mono text-stone-400 mb-0.5">
                  <span className="flex items-center gap-1 text-sky-400">
                    <Zap className="w-3 h-3 fill-sky-500/20" /> MP
                  </span>
                  <span>
                    {playerActor.mp} / {playerActor.maxMp}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-600 to-sky-400"
                    initial={false}
                    animate={{ width: `${Math.max(0, Math.min(100, (playerActor.mp / playerActor.maxMp) * 100))}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* 상태이상 목록 */}
              {renderStatusBadges(playerActor.statusEffects)}
            </div>
          </div>

          {/* 적 목록 / 타겟팅 카드 */}
          <div className="flex flex-col gap-2">
            {battleState.enemies.map((enemy) => {
              const isSelected = enemy.id === selectedTargetId;
              const isDead = enemy.hp <= 0;

              return (
                <div
                  key={enemy.id}
                  onClick={() => !isDead && setSelectedTargetId(enemy.id)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition cursor-pointer relative ${
                    isDead
                      ? 'opacity-40 bg-stone-950/60 border-stone-900'
                      : isSelected
                      ? 'bg-red-950/40 border-red-700 shadow-md ring-1 ring-red-500/40'
                      : 'bg-stone-900/60 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center flex-shrink-0 text-xl font-bold text-red-400">
                    {enemy.name.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-200 text-xs sm:text-sm truncate">
                          {enemy.name}
                        </span>
                        <span className="text-[10px] px-1 rounded bg-stone-800 text-stone-400 font-mono">
                          Lv.{enemy.level}
                        </span>
                      </div>
                      {isSelected && !isDead && (
                        <span className="text-[10px] text-red-400 font-bold tracking-tight">
                          공격 대상
                        </span>
                      )}
                      {isDead && (
                        <span className="text-[10px] text-stone-500 font-bold">
                          쓰러짐
                        </span>
                      )}
                    </div>

                    <div className="mt-1">
                      <div className="flex justify-between text-[10px] font-mono text-stone-400 mb-0.5">
                        <span>HP</span>
                        <span>
                          {enemy.hp} / {enemy.maxHp}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-red-600"
                          initial={false}
                          animate={{ width: `${Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100))}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>

                    {renderStatusBadges(enemy.statusEffects)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. 소설형 실시간 전투 로그 스트림 */}
      <div
        ref={logContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-2.5 bg-stone-950 font-serif leading-relaxed text-sm text-stone-300"
      >
        {battleState.battleLog.map((log) => {
          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-lg border text-xs sm:text-sm ${
                log.isPlayer
                  ? 'bg-stone-900/70 border-stone-800 text-stone-200'
                  : 'bg-red-950/20 border-red-950 text-stone-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-sans font-bold text-xs text-stone-400">
                  {log.actorName}
                </span>
                {log.badge && (
                  <span
                    className={`text-[10px] font-sans px-1.5 py-0.5 rounded font-medium ${
                      log.badge.type === 'crit'
                        ? 'bg-amber-900/80 text-amber-200 border border-amber-700'
                        : log.badge.type === 'damage'
                        ? 'bg-rose-900/80 text-rose-200 border border-rose-800'
                        : log.badge.type === 'heal'
                        ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-700'
                        : log.badge.type === 'buff'
                        ? 'bg-blue-900/80 text-blue-200 border border-blue-700'
                        : 'bg-stone-800 text-stone-300'
                    }`}
                  >
                    {log.badge.text}
                  </span>
                )}
              </div>

              <p className="text-stone-300 leading-normal">{log.text}</p>

              {log.speechText && (
                <div className="mt-1.5 pl-2.5 border-l-2 border-amber-600/70 text-amber-200/90 italic font-sans text-xs">
                  "{log.speechText}"
                </div>
              )}
            </motion.div>
          );
        })}

        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-stone-500 font-sans py-2 animate-pulse">
            <Activity className="w-4 h-4 text-amber-500 animate-spin" />
            <span>전황을 전개하고 있습니다...</span>
          </div>
        )}
      </div>

      {/* 4. 하단 액션 커맨드 바 */}
      <footer className="p-3 bg-stone-900 border-t border-stone-800">
        <div className="max-w-5xl mx-auto flex flex-col gap-2">
          {/* 스킬 버튼 그리드 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {playerActor.skills.map((skillId) => {
              const skillDef = getSkillDefinition(skillId);
              if (!skillDef) return null;
              const hasEnoughMp = playerActor.mp >= (skillDef.mpCost || 0);

              return (
                <button
                  key={skillId}
                  onClick={() => handleExecuteSkill(skillId)}
                  disabled={isProcessing || battleState.phase !== 'PLAYER_TURN' || !hasEnoughMp}
                  className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition ${
                    hasEnoughMp
                      ? 'bg-stone-800 hover:bg-stone-700/80 border-stone-700 text-stone-100 active:scale-[0.98]'
                      : 'bg-stone-900/60 border-stone-800/80 text-stone-500 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs sm:text-sm flex items-center gap-1">
                      {skillId === 'basic_attack' && <Swords className="w-3.5 h-3.5 text-red-400" />}
                      {skillId === 'defend_stance' && <Shield className="w-3.5 h-3.5 text-blue-400" />}
                      {skillId === 'first_aid' && <Heart className="w-3.5 h-3.5 text-green-400" />}
                      {skillDef.name}
                    </span>
                    {skillDef.mpCost && skillDef.mpCost > 0 ? (
                      <span className="text-[10px] text-sky-400 font-mono">
                        {skillDef.mpCost} MP
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">
                    {skillDef.description}
                  </span>
                </button>
              );
            })}

            {/* 자유 행동 입력 버튼 */}
            <button
              onClick={() => setShowFreeActionModal(true)}
              disabled={isProcessing || battleState.phase !== 'PLAYER_TURN'}
              className="flex flex-col items-start p-2.5 rounded-lg border border-amber-800/60 bg-amber-950/40 hover:bg-amber-900/40 text-amber-200 transition"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-xs sm:text-sm flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  자유 행동
                </span>
                <span className="text-[10px] text-amber-400 font-mono">AI 판정</span>
              </div>
              <span className="text-[10px] text-amber-300/70 mt-0.5 line-clamp-1">
                환경을 활용한 기습 및 특수 행동 직접 입력
              </span>
            </button>
          </div>
        </div>
      </footer>

      {/* 자유 행동 입력 모달 */}
      <AnimatePresence>
        {showFreeActionModal && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-stone-900 border border-stone-700 rounded-xl p-4 text-stone-200 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-3 border-b border-stone-800 pb-2">
                <h3 className="font-bold text-base flex items-center gap-1.5 text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  자유 전투 행동 입력
                </h3>
                <button
                  onClick={() => setShowFreeActionModal(false)}
                  className="text-stone-400 hover:text-stone-200 text-xs px-2 py-1"
                >
                  닫기
                </button>
              </div>

              <p className="text-xs text-stone-400 mb-3">
                상대방의 눈에 모래 뿌리기, 탁자 뒤로 엄폐하기, 줄을 끊어 장애물 떨어뜨리기 등
                전황을 유리하게 바꿀 창의적인 행동을 입력하세요.
              </p>

              <form onSubmit={handleFreeActionSubmit} className="space-y-3">
                <textarea
                  value={freeActionInput}
                  onChange={(e) => setFreeActionInput(e.target.value)}
                  placeholder="예: 바닥의 흙과 모래를 집어 적의 눈가를 향해 강하게 뿌린다."
                  rows={3}
                  className="w-full p-2.5 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-500"
                  autoFocus
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFreeActionModal(false)}
                    className="px-3 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-xs text-stone-300"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={!freeActionInput.trim() || isProcessing}
                    className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-xs font-bold text-stone-950 disabled:opacity-50 flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    행동 개시
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
