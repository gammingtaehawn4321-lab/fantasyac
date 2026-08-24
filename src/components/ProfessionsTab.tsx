import React, { useState } from 'react';
import { PlayerState } from '../types';
import { ProfessionType } from '../data/professions/professionTypes';
import { PROFESSIONS_DATABASE, RECIPE_DATABASE } from '../data/professions/professionData';
import { Hammer, Sparkles, CheckCircle2, XCircle } from 'lucide-react';

interface ProfessionsTabProps {
  playerState: PlayerState;
  onCraftRecipe: (recipeId: string) => void;
}

export const ProfessionsTab: React.FC<ProfessionsTabProps> = ({
  playerState,
  onCraftRecipe,
}) => {
  const [selectedProfId, setSelectedProfId] = useState<ProfessionType>('BLACKSMITH');
  const [craftFeedback, setCraftFeedback] = useState<string | null>(null);

  const currentProfDef = PROFESSIONS_DATABASE[selectedProfId];
  const currentProfProgress = playerState.professions.find((p) => p.professionId === selectedProfId) || {
    professionId: selectedProfId,
    level: 1,
    exp: 0,
    learnedRecipes: [],
    learnedPerks: [],
  };

  const neededExp = currentProfProgress.level * 100;
  const expPercent = Math.min(100, Math.round((currentProfProgress.exp / neededExp) * 100));

  const handleCraft = (recipeId: string) => {
    onCraftRecipe(recipeId);
    setCraftFeedback(`제작 시도 완료: ${RECIPE_DATABASE[recipeId]?.name}`);
    setTimeout(() => setCraftFeedback(null), 3000);
  };

  return (
    <div id="professions-tab-root" className="p-4 text-zinc-200 flex flex-col md:flex-row gap-4">
      {/* 1. 좌측: 6대 생활 직업 선택 목록 */}
      <div className="w-full md:w-64 bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 shadow-xl space-y-2">
        <div className="text-xs font-bold text-zinc-400 px-2 py-1 uppercase tracking-wider">
          생활 전문 직업
        </div>
        {(Object.keys(PROFESSIONS_DATABASE) as ProfessionType[]).map((profId) => {
          const profDef = PROFESSIONS_DATABASE[profId];
          const progress = playerState.professions.find((p) => p.professionId === profId) || { level: 1 };
          const isSelected = selectedProfId === profId;

          return (
            <div
              key={profId}
              id={`prof-item-${profId}`}
              onClick={() => setSelectedProfId(profId)}
              className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'border-amber-500 bg-amber-950/40'
                  : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{profDef.iconSymbol}</span>
                <div>
                  <div className="text-sm font-semibold text-zinc-100">{profDef.name}</div>
                  <div className="text-[11px] text-zinc-400">Lv.{progress.level} 숙련도</div>
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-amber-300 font-bold">
                Lv.{progress.level}
              </span>
            </div>
          );
        })}
      </div>

      {/* 2. 우측: 선택된 직업의 상세 정보 및 제작 레시피 목록 */}
      <div className="flex-1 bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 shadow-xl flex flex-col">
        {/* 직업 헤더 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-zinc-800 gap-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentProfDef.iconSymbol}</span>
            <div>
              <h3 className="text-lg font-bold text-zinc-100">{currentProfDef.name}</h3>
              <p className="text-xs text-zinc-400">{currentProfDef.role}</p>
            </div>
          </div>
          <div className="w-full sm:w-56 bg-zinc-950/70 p-2.5 rounded-lg border border-zinc-800 text-xs">
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-amber-400">숙련 레벨 {currentProfProgress.level}</span>
              <span className="text-zinc-400">{currentProfProgress.exp} / {neededExp} EXP</span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full transition-all duration-300"
                style={{ width: `${expPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 제작 피드백 토스트 */}
        {craftFeedback && (
          <div className="mt-3 p-2 bg-emerald-950/50 border border-emerald-700/50 rounded text-xs text-emerald-300 font-medium">
            {craftFeedback}
          </div>
        )}

        {/* 레시피 목록 */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1">
          <div className="text-xs font-bold text-zinc-400 flex items-center gap-1">
            <Hammer className="w-3.5 h-3.5 text-amber-400" /> 습득 가능한 제작 레시피
          </div>

          {currentProfDef.recipes.map((recipe) => {
            const hasLevel = currentProfProgress.level >= recipe.requiredLevel;

            // 각 재료별 충족 여부 검사
            const ingredientCheck = recipe.ingredients.map((ing) => {
              const userItem = playerState.inventory.find(
                (i) => i.name.trim() === ing.itemName.trim()
              );
              const userQty = userItem ? userItem.quantity : 0;
              const isMet = userQty >= ing.quantity;
              return { ...ing, userQty, isMet };
            });

            const canCraftAll = hasLevel && ingredientCheck.every((ing) => ing.isMet);

            return (
              <div
                key={recipe.id}
                id={`recipe-card-${recipe.id}`}
                className={`p-4 rounded-xl border transition-all ${
                  canCraftAll
                    ? 'border-zinc-700 bg-zinc-950/60 hover:border-amber-600/50'
                    : 'border-zinc-800/80 bg-zinc-950/30 opacity-80'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-zinc-100">{recipe.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold">
                        Lv.{recipe.requiredLevel} 이상
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{recipe.description}</p>
                  </div>

                  <button
                    id={`craft-btn-${recipe.id}`}
                    onClick={() => handleCraft(recipe.id)}
                    disabled={!canCraftAll}
                    className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow ${
                      canCraftAll
                        ? 'bg-amber-600 hover:bg-amber-500 text-zinc-950 cursor-pointer'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    제작하기 (EXP +{recipe.expReward})
                  </button>
                </div>

                {/* 필요 재료 리스트 */}
                <div className="mt-3 pt-3 border-t border-zinc-800/60 flex flex-wrap gap-2 text-xs">
                  {ingredientCheck.map((ing) => (
                    <div
                      key={ing.itemName}
                      className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
                        ing.isMet
                          ? 'border-emerald-700/50 bg-emerald-950/30 text-emerald-300'
                          : 'border-rose-800/40 bg-rose-950/20 text-rose-300'
                      }`}
                    >
                      {ing.isMet ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <XCircle className="w-3 h-3 text-rose-400" />
                      )}
                      <span>
                        {ing.itemName}: <strong>{ing.userQty}</strong> / {ing.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
