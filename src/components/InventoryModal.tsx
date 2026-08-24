import { useState } from 'react';
import {
  X,
  Backpack,
  PackageOpen,
  Sparkles,
  Weight,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ArrowDownUp,
  Info,
  ChevronRight,
} from 'lucide-react';
import { InventoryItem, PlayerState } from '../types';
import {
  calculateInventoryWeight,
  calculatePartyCarryWeight,
  calculateEncumbranceState,
  getItemSingleWeight,
  calculateItemTotalWeight,
  getBagDefinition,
  BAG_TYPE_KOREAN,
  BAG_RARITY_KOREAN,
} from '../data/bags';
import { getItemDefinition } from '../data/items/itemDatabase';
import { EQUIPMENT_DATABASE } from '../data/equipment/equipmentDatabase';
import { ItemDetailModal } from './ItemDetailModal';

export type ItemFilterCategory =
  | 'ALL'
  | 'CONSUMABLE'
  | 'MATERIAL'
  | 'EQUIPMENT'
  | 'BAG'
  | 'KEY'
  | 'QUEST'
  | 'TOOL'
  | 'BOOK'
  | 'MISC';

interface FilterOption {
  id: ItemFilterCategory;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'ALL', label: '전체' },
  { id: 'CONSUMABLE', label: '소모품' },
  { id: 'MATERIAL', label: '재료' },
  { id: 'EQUIPMENT', label: '장비' },
  { id: 'BAG', label: '가방' },
  { id: 'KEY', label: '열쇠' },
  { id: 'QUEST', label: '퀘스트' },
  { id: 'TOOL', label: '도구' },
  { id: 'BOOK', label: '책' },
  { id: 'MISC', label: '기타' },
];

/**
 * 아이템의 필터 카테고리를 판별합니다.
 */
function getItemFilterCategory(item: InventoryItem): ItemFilterCategory {
  // 1. 가방 여부 확인
  if (item.bagId || getBagDefinition(item.bagId || item.id || item.name)) {
    return 'BAG';
  }

  // 2. 장비 여부 확인
  if (item.equipmentId || (item.id && EQUIPMENT_DATABASE[item.id]) || (item.equipmentId && EQUIPMENT_DATABASE[item.equipmentId])) {
    return 'EQUIPMENT';
  }

  // 3. 아이템 정의 및 카테고리 확인
  const itemDef = getItemDefinition(item.id || item.name);
  const rawCat = item.category || itemDef?.category;

  if (rawCat === 'CONSUMABLE') return 'CONSUMABLE';
  if (rawCat === 'MATERIAL') return 'MATERIAL';
  if (rawCat === 'EQUIPMENT') return 'EQUIPMENT';
  if (rawCat === 'KEY') return 'KEY';
  if (rawCat === 'QUEST') return 'QUEST';
  if (rawCat === 'TOOL') return 'TOOL';
  if (rawCat === 'BOOK' || rawCat === 'DOCUMENT') return 'BOOK';
  if (rawCat === 'MISC' || rawCat === 'GIFT' || rawCat === 'VALUABLE') return 'MISC';

  // 4. 이름 기반 지능형 폴백
  const name = item.name.toLowerCase();
  if (name.includes('배낭') || name.includes('주머니') || name.includes('가방') || name.includes('전대') || name.includes('자루')) {
    return 'BAG';
  }
  if (name.includes('약') || name.includes('포션') || name.includes('음식') || name.includes('고기') || name.includes('빵') || name.includes('스프') || name.includes('사과') || name.includes('스크롤') || name.includes('환') || name.includes('탕') || name.includes('엘릭서') || name.includes('시약')) {
    return 'CONSUMABLE';
  }
  if (name.includes('주괴') || name.includes('광석') || name.includes('원석') || name.includes('가죽') || name.includes('목재') || name.includes('장작') || name.includes('나뭇가지') || name.includes('깃털') || name.includes('약초') || name.includes('꽃') || name.includes('뼈') || name.includes('결정') || name.includes('실') || name.includes('가루')) {
    return 'MATERIAL';
  }
  if (name.includes('검') || name.includes('도끼') || name.includes('창') || name.includes('방패') || name.includes('갑옷') || name.includes('투구') || name.includes('신발') || name.includes('장화') || name.includes('장갑') || name.includes('망토') || name.includes('반지') || name.includes('목걸이') || name.includes('지팡이') || name.includes('단검') || name.includes('활') || name.includes('완드') || name.includes('흉갑') || name.includes('팔찌') || name.includes('귀걸이')) {
    return 'EQUIPMENT';
  }
  if (name.includes('열쇠') || name.includes('마스터키') || name.includes('열쇠패') || name.includes('인장')) {
    return 'KEY';
  }
  if (name.includes('퀘스트') || name.includes('단서') || name.includes('서약서') || name.includes('밀서') || name.includes('의뢰서') || name.includes('징표') || name.includes('문장')) {
    return 'QUEST';
  }
  if (name.includes('밧줄') || name.includes('삽') || name.includes('횃불') || name.includes('곡괭이') || name.includes('낚싯대') || name.includes('부싯돌') || name.includes('자물쇠따개') || name.includes('돋보기') || name.includes('망원경')) {
    return 'TOOL';
  }
  if (name.includes('책') || name.includes('서적') || name.includes('일지') || name.includes('고서') || name.includes('마도서') || name.includes('비전서') || name.includes('연구서') || name.includes('기록')) {
    return 'BOOK';
  }

  return 'MISC';
}

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerState: PlayerState;
  onUseItem: (itemName: string) => void;
  onEquipBag?: (bagId: string) => void;
  onUnequipBag?: () => void;
  onDiscardItem?: (itemNameOrId: string, quantity: number) => void;
}

export function InventoryModal({
  isOpen,
  onClose,
  playerState,
  onUseItem,
  onEquipBag,
  onUnequipBag,
  onDiscardItem,
}: InventoryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<ItemFilterCategory>('ALL');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  if (!isOpen) return null;

  // 1. 무게 및 과적 상태 산출 (기존 엔진 함수 재사용)
  const currentWeight = calculateInventoryWeight(playerState.inventory, playerState.equippedBagId);
  const maxWeight = calculatePartyCarryWeight(playerState);
  const encumbranceState = calculateEncumbranceState(currentWeight, maxWeight);

  // 현재 장착 가방 정의 조회
  const equippedBagDef = playerState.equippedBagId
    ? getBagDefinition(playerState.equippedBagId)
    : null;

  // 무게 게이지 비율 (최대 100% 시각화)
  const weightPercent = Math.min(100, Math.max(0, Math.round((currentWeight / Math.max(1, maxWeight)) * 100)));

  // 게이지 바 색상 클래스
  let gaugeBarColor = 'bg-emerald-500';
  if (encumbranceState.level === 'ENCUMBERED_1') {
    gaugeBarColor = 'bg-amber-500';
  } else if (encumbranceState.level === 'ENCUMBERED_2') {
    gaugeBarColor = 'bg-orange-500';
  } else if (encumbranceState.level === 'OVERLOADED') {
    gaugeBarColor = 'bg-rose-500 animate-pulse';
  }

  // 필터링된 아이템 목록
  const filteredItems = playerState.inventory.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return getItemFilterCategory(item) === selectedCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800 bg-stone-900/95">
          <div className="flex items-center gap-2">
            <Backpack className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-stone-100">소지품 (가방 및 인벤토리)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-200 active:bg-stone-800 rounded transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-3.5 flex-1">
          {/* 1. 상단 장착 가방 & 무게 및 과적 영역 */}
          <div className="p-3 bg-stone-950/80 border border-stone-800 rounded-xl space-y-2.5">
            {/* 장착 가방 정보 카드 */}
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-stone-800/80">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-stone-100">
                    {equippedBagDef ? equippedBagDef.name : '기본 주머니 (가방 미착용)'}
                  </span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 font-medium">
                    {equippedBagDef
                      ? `${BAG_TYPE_KOREAN[equippedBagDef.bagType]} · ${BAG_RARITY_KOREAN[equippedBagDef.rarity]}`
                      : '기본 주머니 · 일반'}
                  </span>
                </div>
                {equippedBagDef ? (
                  <p className="text-[11px] text-stone-400 mt-1 leading-snug">
                    자체 무게 {equippedBagDef.weight.toFixed(1)}kg · 추가 용량 +{equippedBagDef.bonusCarryWeight.toFixed(1)}kg
                    {equippedBagDef.effectDescription && (
                      <span className="block text-amber-300/90 mt-0.5 font-medium">
                        ✨ {equippedBagDef.effectDescription}
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    기본 운반 한도만 적용됩니다. 가방을 장착하여 용량을 늘리세요.
                  </p>
                )}
              </div>

              {equippedBagDef && onUnequipBag && (
                <button
                  id="unequip-bag-btn"
                  onClick={onUnequipBag}
                  className="min-h-[28px] px-2.5 py-1 text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 rounded-md transition-colors cursor-pointer shrink-0"
                >
                  해제
                </button>
              )}
            </div>

            {/* 무게 게이지 및 과적 상태 바 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-stone-300">
                  <Weight className="w-3.5 h-3.5 text-amber-400/90" />
                  <span className="font-medium">소지 무게</span>
                  <span className="font-bold text-stone-100 font-mono">
                    {currentWeight.toFixed(1)} / {maxWeight.toFixed(1)} kg
                  </span>
                </div>

                {/* 과적 상태 뱃지 */}
                <div className={`px-2 py-0.5 text-[11px] font-bold rounded-full border ${encumbranceState.badgeClass}`}>
                  {encumbranceState.label}
                </div>
              </div>

              {/* 진행도 게이지 바 */}
              <div className="w-full bg-stone-800/80 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${gaugeBarColor}`}
                  style={{ width: `${weightPercent}%` }}
                />
              </div>

              {/* 과적 패널티 설명 (정상이 아닐 경우) */}
              {encumbranceState.level !== 'NORMAL' && (
                <div className="p-2 rounded bg-stone-900/90 border border-stone-800 text-[11px] text-stone-300 space-y-1">
                  <div className="flex items-start gap-1.5 text-amber-300 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{encumbranceState.description}</span>
                  </div>
                  <div className="flex gap-2 text-[10px] text-stone-400 pl-5">
                    {encumbranceState.speedPenaltyPercent > 0 && (
                      <span>속도 -{encumbranceState.speedPenaltyPercent}%</span>
                    )}
                    {encumbranceState.evasionPenaltyPercent > 0 && (
                      <span>회피 -{encumbranceState.evasionPenaltyPercent}%</span>
                    )}
                    {encumbranceState.escapePenaltyPercent > 0 && (
                      <span>도주 -{encumbranceState.escapePenaltyPercent}%</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 보유 소지금 (루피) */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-800/70 text-xs">
              <span className="text-stone-400">보유 소지금</span>
              <span className="font-bold text-amber-400 font-mono">
                💰 {playerState.rupees.toLocaleString()} 루피
              </span>
            </div>
          </div>

          {/* 2. 카테고리 필터 탭 바 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {FILTER_OPTIONS.map((opt) => {
              const isActive = selectedCategory === opt.id;
              // 해당 카테고리 아이템 개수
              const count =
                opt.id === 'ALL'
                  ? playerState.inventory.length
                  : playerState.inventory.filter((i) => getItemFilterCategory(i) === opt.id).length;

              return (
                <button
                  key={opt.id}
                  id={`filter-${opt.id.toLowerCase()}`}
                  onClick={() => setSelectedCategory(opt.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-xs'
                      : 'bg-stone-950/60 text-stone-400 border border-stone-800 hover:text-stone-200 hover:bg-stone-800/60'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className={`text-[10px] ${isActive ? 'text-amber-400 font-bold' : 'text-stone-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 3. 아이템 목록 */}
          {filteredItems.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-stone-400 space-y-2 border border-dashed border-stone-800 rounded-xl">
              <PackageOpen className="w-8 h-8 opacity-40" />
              <p className="text-xs">
                {selectedCategory === 'ALL'
                  ? '소지품이 비어 있습니다.'
                  : `해당 분류(${FILTER_OPTIONS.find((o) => o.id === selectedCategory)?.label})의 아이템이 없습니다.`}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item, index) => {
                const singleWeight = getItemSingleWeight(item);
                const totalWeight = calculateItemTotalWeight(item);
                const bagDef = item.bagId
                  ? getBagDefinition(item.bagId)
                  : getBagDefinition(item.id || item.name);
                const isBag = !!bagDef;

                const itemDef = item.id ? getItemDefinition(item.id) : getItemDefinition(item.name);
                const isQuestOrKey =
                  itemDef?.category === 'QUEST' ||
                  itemDef?.category === 'KEY' ||
                  item.name.includes('열쇠') ||
                  item.name.includes('인장') ||
                  item.name.includes('비전서') ||
                  item.name.includes('퀘스트') ||
                  item.name.includes('징표') ||
                  item.name.includes('문장');
                const isConsumable =
                  !isBag &&
                  (itemDef?.usable ||
                    item.category === 'CONSUMABLE' ||
                    item.name.includes('약') ||
                    item.name.includes('포션') ||
                    item.name.includes('음식') ||
                    item.name.includes('스크롤'));

                return (
                  <div
                    key={`${item.name}-${index}`}
                    id={`inventory-item-row-${index}`}
                    onClick={() => setSelectedItem(item)}
                    className="p-2.5 bg-stone-950/60 border border-stone-800/90 rounded-lg hover:border-amber-500/60 hover:bg-stone-900/70 transition-all flex items-center justify-between gap-2.5 cursor-pointer group select-none"
                  >
                    {/* Item Information */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-stone-200 group-hover:text-amber-300 transition-colors truncate">
                          {item.name}
                        </span>
                        <span className="text-xs font-bold text-amber-400 font-mono">×{item.quantity}</span>

                        {isBag && bagDef && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60 font-medium">
                            {BAG_TYPE_KOREAN[bagDef.bagType]} · {BAG_RARITY_KOREAN[bagDef.rarity]}
                          </span>
                        )}
                        {isQuestOrKey && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 font-medium">
                            중요 물품
                          </span>
                        )}
                      </div>

                      {/* Weight Line */}
                      <div className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-2">
                        <span>
                          개당 {singleWeight.toFixed(1)}kg · 총 {totalWeight.toFixed(1)}kg
                        </span>
                        {isBag && bagDef && (
                          <span className="text-amber-400/90 font-medium">
                            (용량 +{bagDef.bonusCarryWeight.toFixed(1)}kg)
                          </span>
                        )}
                      </div>

                      {/* Description / Bag special effect */}
                      {isBag && bagDef?.effectDescription ? (
                        <p className="text-[11px] text-amber-300/90 mt-0.5 line-clamp-1">
                          ✨ {bagDef.effectDescription}
                        </p>
                      ) : item.description ? (
                        <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">{item.description}</p>
                      ) : null}
                    </div>

                    {/* Detail hint icon */}
                    <div className="shrink-0 flex items-center pl-1 text-stone-600 group-hover:text-amber-400 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tips / Notes */}
          <div className="p-2.5 bg-stone-950/40 border border-stone-800/60 rounded-lg text-[11px] text-stone-400 flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>
              가방을 장착하거나 동료를 파티에 영입하면 총 운반 한도가 늘어납니다. 과적 시 전투 및 이동에 불이익이 발생합니다.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-800 bg-stone-900/95">
          <button
            onClick={onClose}
            className="w-full py-2 bg-stone-800 hover:bg-stone-700 active:bg-stone-600 text-stone-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>

      {/* 아이템 상세 모달 (ItemDetailModal - z-[60]) */}
      <ItemDetailModal
        item={selectedItem}
        playerState={playerState}
        onClose={() => setSelectedItem(null)}
        onUseItem={(name) => {
          onUseItem(name);
          setSelectedItem(null);
        }}
        onEquipBag={(bagId) => {
          if (onEquipBag) {
            onEquipBag(bagId);
            setSelectedItem(null);
          }
        }}
        onUnequipBag={() => {
          if (onUnequipBag) {
            onUnequipBag();
            setSelectedItem(null);
          }
        }}
        onDiscardItem={(itemNameOrId, qty) => {
          if (onDiscardItem) {
            onDiscardItem(itemNameOrId, qty);
            setSelectedItem(null);
          }
        }}
      />
    </div>
  );
}

