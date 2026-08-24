import React from 'react';
import { motion } from 'motion/react';
import { Shield, Sword, Eye, Crosshair, Wand2, Sparkles, X, Check, ArrowUpRight, Lock } from 'lucide-react';
import { PlayerState } from '../types';
import { getAllCombatClasses, getCombatClass, CombatClassType, canChooseDancer } from '../data/classes';
import { chooseCombatClass, evolveCombatClass } from '../gameEngine';
import { getSkillDefinition } from '../data/skills';

interface ClassModalProps {
  playerState: PlayerState;
  onUpdatePlayer: (updated: PlayerState) => void;
  onClose: () => void;
}

export const ClassModal: React.FC<ClassModalProps> = ({
  playerState,
  onUpdatePlayer,
  onClose,
}) => {
  const currentClassId = playerState.combatClass || 'NONE';
  const currentClassDef = getCombatClass(currentClassId);
  const classesList = getAllCombatClasses();

  const handleSelectClass = (classId: CombatClassType) => {
    const nextState = chooseCombatClass(playerState, classId);
    onUpdatePlayer(nextState);
  };

  const handleEvolveClass = (evolutionId: string) => {
    const nextState = evolveCombatClass(playerState, evolutionId);
    onUpdatePlayer(nextState);
  };

  const getClassIcon = (classId: string) => {
    switch (classId) {
      case 'WARRIOR': return <Sword className="w-5 h-5 text-rose-400" />;
      case 'ARCHER': return <Crosshair className="w-5 h-5 text-emerald-400" />;
      case 'ROGUE': return <Eye className="w-5 h-5 text-purple-400" />;
      case 'CLERIC': return <Shield className="w-5 h-5 text-amber-400" />;
      case 'MAGE': return <Wand2 className="w-5 h-5 text-indigo-400" />;
      case 'DANCER': return <Sparkles className="w-5 h-5 text-pink-400" />;
      default: return <Shield className="w-5 h-5 text-stone-400" />;
    }
  };

  const isDancerEligible = canChooseDancer(playerState.profile?.gender);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-stone-900 border border-stone-700 rounded-2xl flex flex-col max-h-[90vh] shadow-2xl overflow-hidden text-stone-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-950/60">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-100 flex items-center gap-2">
              <Sword className="w-5 h-5 text-amber-400" />
              전직 및 승급
            </h2>
            <p className="text-xs text-stone-400">
              현재 직업: <span className="text-amber-400 font-bold">{playerState.characterClass || currentClassDef?.name || '무직 (기본 모험가)'}</span>
              {playerState.classEvolutionTier && playerState.classEvolutionTier > 1 ? ` (${playerState.classEvolutionTier}차 승급 완료)` : ''}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Class Evolution Banner (if applicable) */}
        {currentClassDef?.evolutions && currentClassDef.evolutions.length > 0 && (playerState.classEvolutionTier || 1) === 1 && (
          <div className="p-3 bg-amber-950/30 border-b border-amber-900/50 space-y-2">
            <div className="text-xs font-bold text-amber-300 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              2차 전직 (승급 경로)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentClassDef.evolutions.map((evo) => {
                const canEvolve = playerState.level >= evo.requiredLevel;
                return (
                  <div
                    key={evo.id}
                    className="p-2.5 rounded-lg bg-stone-900/90 border border-amber-900/40 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-amber-200">{evo.evolutionName}</div>
                      <div className="text-[10px] text-stone-400">
                        {evo.weaponSpecialization} • 필요: Lv.{evo.requiredLevel} (현재 Lv.{playerState.level})
                      </div>
                    </div>
                    <button
                      onClick={() => handleEvolveClass(evo.id)}
                      disabled={!canEvolve}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                        canEvolve
                          ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow'
                          : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                      }`}
                    >
                      승급
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Classes Grid */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-900/90">
          <div className="text-xs text-stone-400 mb-1">
            원하는 직업을 선택하여 고유 전투 스킬과 스탯 성장 보너스를 획득하세요.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {classesList.map((cls) => {
              const isSelected = currentClassId === cls.id;
              const isLevelLocked = playerState.level < cls.unlockLevel;
              const isDancerLocked = cls.id === 'DANCER' && !isDancerEligible;
              const isLocked = isLevelLocked || isDancerLocked;

              return (
                <div
                  key={cls.id}
                  className={`p-3.5 rounded-xl border transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-950/20 border-amber-800/80 shadow-md ring-1 ring-amber-500/40'
                      : isLocked
                      ? 'bg-stone-950/40 border-stone-800/80 opacity-60'
                      : 'bg-stone-800/60 border-stone-700/80 hover:border-stone-600'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-stone-900 border border-stone-800">
                          {getClassIcon(cls.id)}
                        </div>
                        <div>
                          <span className="font-bold text-sm text-stone-100">{cls.name}</span>
                          <span className="text-[10px] text-stone-500 block">{cls.role}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/80 text-amber-200 border border-amber-700 font-bold">
                          선택됨
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-300 leading-relaxed mt-1">
                      {cls.description}
                    </p>

                    {/* Unlockable Skills */}
                    <div className="mt-2.5">
                      <span className="text-[10px] text-stone-400 block mb-1">고유 전투 스킬:</span>
                      <div className="flex flex-wrap gap-1">
                        {cls.initialSkillIds.map((skId) => {
                          const sk = getSkillDefinition(skId);
                          if (!sk) return null;
                          return (
                            <span
                              key={skId}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-stone-900 border border-stone-700 text-stone-300 font-medium"
                              title={sk.description}
                            >
                              ⚔️ {sk.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {isLevelLocked && (
                      <div className="text-[11px] text-rose-400 mt-2">
                        • 요구 조건: Lv.{cls.unlockLevel} 이상 달성
                      </div>
                    )}
                    {isDancerLocked && (
                      <div className="text-[11px] text-pink-400 mt-2 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        • 여성 캐릭터 전용 직업 (현재 성별: {playerState.profile?.gender || '미설정'})
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <div className="mt-3 pt-2 border-t border-stone-800 flex justify-end">
                    {isSelected ? (
                      <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold py-1">
                        <Check className="w-4 h-4" />
                        현재 적용 중
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSelectClass(cls.id)}
                        disabled={isLocked}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          isLocked
                            ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                            : 'bg-stone-700 hover:bg-stone-600 text-stone-100'
                        }`}
                      >
                        전직 선택
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-950 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold"
          >
            닫기
          </button>
        </div>
      </motion.div>
    </div>
  );
};
