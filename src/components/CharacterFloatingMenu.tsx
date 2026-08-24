import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  User,
  Activity,
  Award,
  Briefcase,
  Compass,
  Users,
  BarChart2,
  FileText,
  Sparkles,
  Shield,
  Backpack,
  Sword,
  Scroll,
  Tent,
  ArrowLeft,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { PlayerState, QuestProgress } from '../types';

interface CharacterFloatingMenuProps {
  playerState: PlayerState;
  onOpenStatus: () => void;
  onOpenStats: () => void;
  onOpenTalents: () => void;
  onOpenClass: () => void;
  onOpenProfessions: () => void;
  onOpenInventory: () => void;
  onOpenEquipment: () => void;
  onOpenQuests: () => void;
  onOpenCamp: () => void;
  onOpenCompanions: () => void;
}

type MenuCategory = 'root' | 'status' | 'growth' | 'bag' | 'adventure';

export const CharacterFloatingMenu: React.FC<CharacterFloatingMenuProps> = ({
  playerState,
  onOpenStatus,
  onOpenStats,
  onOpenTalents,
  onOpenClass,
  onOpenProfessions,
  onOpenInventory,
  onOpenEquipment,
  onOpenQuests,
  onOpenCamp,
  onOpenCompanions,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<MenuCategory>('root');
  const menuContainerRef = useRef<HTMLDivElement>(null);

  // 활성화된 퀘스트 수 계산 (PlayerState.quests 기준)
  const quests = playerState.quests || {};
  const questList = Object.values(quests) as QuestProgress[];
  const activeQuestCount = questList.filter(q => q.status === 'ACTIVE').length;
  const offeredQuestCount = questList.filter(q => q.status === 'OFFERED').length;
  const totalQuestAlert = activeQuestCount + offeredQuestCount;

  // 미사용 스탯/재능 포인트 알림
  const hasStatPoints = (playerState.statPoints || 0) > 0;
  const hasTalentPoints = (playerState.talentPoints || 0) > 0;

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setCurrentCategory('root');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    if (isOpen) {
      setIsOpen(false);
      setCurrentCategory('root');
    } else {
      setIsOpen(true);
      setCurrentCategory('root');
    }
  };

  const handleAction = (callback: () => void) => {
    callback();
    setIsOpen(false);
    setCurrentCategory('root');
  };

  // 개별 독립 플로팅 버튼 애니메이션 설정
  const buttonVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.18,
        delay: index * 0.03,
        ease: 'easeOut'
      }
    }),
    exit: {
      opacity: 0,
      y: 8,
      scale: 0.95,
      transition: { duration: 0.12, ease: 'easeIn' }
    }
  };

  return (
    <div id="character-floating-menu-root" ref={menuContainerRef} className="relative inline-block select-none z-30">
      {/* 위쪽으로 펼쳐지는 독립 플로팅 버튼 컬렉션 */}
      <div className="absolute bottom-full left-0 mb-2.5 flex flex-col-reverse gap-1.5 items-start pointer-events-none">
        <AnimatePresence mode="wait">
          {isOpen && currentCategory === 'root' && (
            <div key="category-root" className="flex flex-col-reverse gap-1.5 pointer-events-auto">
              {/* 상태 */}
              <motion.button
                id="floating-menu-btn-status"
                custom={0}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => setCurrentCategory('status')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/95 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 text-xs font-semibold shadow-lg shadow-black/40 backdrop-blur-md transition-colors"
              >
                <Activity className="w-3.5 h-3.5 text-rose-400" />
                <span>상태</span>
                {hasStatPoints && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-0.5" />
                )}
              </motion.button>

              {/* 성장 */}
              <motion.button
                id="floating-menu-btn-growth"
                custom={1}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => setCurrentCategory('growth')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/95 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 text-xs font-semibold shadow-lg shadow-black/40 backdrop-blur-md transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>성장</span>
                {hasTalentPoints && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse ml-0.5" />
                )}
              </motion.button>

              {/* 가방 */}
              <motion.button
                id="floating-menu-btn-bag"
                custom={2}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => setCurrentCategory('bag')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/95 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 text-xs font-semibold shadow-lg shadow-black/40 backdrop-blur-md transition-colors"
              >
                <Backpack className="w-3.5 h-3.5 text-emerald-400" />
                <span>가방</span>
              </motion.button>

              {/* 모험 */}
              <motion.button
                id="floating-menu-btn-adventure"
                custom={3}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => setCurrentCategory('adventure')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/95 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 text-xs font-semibold shadow-lg shadow-black/40 backdrop-blur-md transition-colors"
              >
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                <span>모험</span>
                {totalQuestAlert > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-indigo-500 text-white leading-none">
                    {activeQuestCount > 0 ? activeQuestCount : `+${offeredQuestCount}`}
                  </span>
                )}
              </motion.button>

              {/* 동료 */}
              <motion.button
                id="floating-menu-btn-companions"
                custom={4}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => handleAction(onOpenCompanions)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/95 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 text-xs font-semibold shadow-lg shadow-black/40 backdrop-blur-md transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>동료</span>
              </motion.button>
            </div>
          )}

          {/* 5. 상태 하위 메뉴 */}
          {isOpen && currentCategory === 'status' && (
            <div key="category-status" className="flex flex-col-reverse gap-1.5 pointer-events-auto">
              <motion.button
                id="floating-menu-btn-stats"
                custom={0}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => handleAction(onOpenStats)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/95 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 text-xs font-semibold shadow-lg shadow-black/40 backdrop-blur-md transition-colors"
              >
                <BarChart2 className="w-3.5 h-3.5 text-rose-400" />
                <span>스탯</span>
                {hasStatPoints && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-500 text-white leading-none">
                    +{playerState.statPoints}
                  </span>
                )}
              </motion.button>

              <motion.button
                id="floating-menu-btn-status-view"
                custom={1}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => handleAction(onOpenStatus)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/95 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 text-xs font-semibold shadow-lg shadow-black/40 backdrop-blur-md transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-zinc-300" />
                <span>상태창</span>
              </motion.button>

              <motion.button
                id="floating-menu-btn-back-status"
                custom={2}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => setCurrentCategory('root')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950/85 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200 text-[11px] font-medium shadow backdrop-blur-md transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>뒤로</span>
              </motion.button>
            </div>
          )}

          {/* 6. 성장 하위 메뉴 */}
          {isOpen && currentCategory === 'growth' && (
            <div key="category-growth" className="flex flex-col-reverse gap-1.5 pointer-events-auto">
              <motion.button
                id="floating-menu-btn-talents"
                custom={0}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => handleAction(onOpenTalents)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/95 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 text-xs font-semibold shadow-lg shadow-black/40 backdrop-blur-md transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>재능</span>
                {hasTalentPoints && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-black leading-none">
                    +{playerState.talentPoints}
                  </span>
                )}
              </motion.button>

              <motion.button
                id="floating-menu-btn-classes"
                custom={1}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => handleAction(onOpenClass)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/95 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 text-xs font-semibold shadow-lg shadow-black/40 backdrop-blur-md transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>전직</span>
              </motion.button>

              <motion.button
                id="floating-menu-btn-jobs"
                custom={2}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => handleAction(onOpenProfessions)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/95 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 text-xs font-semibold shadow-lg shadow-black/40 backdrop-blur-md transition-colors"
              >
                <Briefcase className="w-3.5 h-3.5 text-amber-300" />
                <span>생활직업</span>
              </motion.button>

              <motion.button
                id="floating-menu-btn-back-growth"
                custom={3}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => setCurrentCategory('root')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950/85 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200 text-[11px] font-medium shadow backdrop-blur-md transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>뒤로</span>
              </motion.button>
            </div>
          )}

          {/* 7. 가방 하위 메뉴 */}
          {isOpen && currentCategory === 'bag' && (
            <div key="category-bag" className="flex flex-col-reverse gap-1.5 pointer-events-auto">
              <motion.button
                id="floating-menu-btn-inventory-sub"
                custom={0}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => handleAction(onOpenInventory)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/95 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 text-xs font-semibold shadow-lg shadow-black/40 backdrop-blur-md transition-colors"
              >
                <Backpack className="w-3.5 h-3.5 text-emerald-400" />
                <span>가방</span>
              </motion.button>

              <motion.button
                id="floating-menu-btn-equipment"
                custom={1}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => handleAction(onOpenEquipment)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/95 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 text-xs font-semibold shadow-lg shadow-black/40 backdrop-blur-md transition-colors"
              >
                <Sword className="w-3.5 h-3.5 text-orange-400" />
                <span>장비</span>
              </motion.button>

              <motion.button
                id="floating-menu-btn-back-bag"
                custom={2}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => setCurrentCategory('root')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950/85 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200 text-[11px] font-medium shadow backdrop-blur-md transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>뒤로</span>
              </motion.button>
            </div>
          )}

          {/* 8. 모험 하위 메뉴 */}
          {isOpen && currentCategory === 'adventure' && (
            <div key="category-adventure" className="flex flex-col-reverse gap-1.5 pointer-events-auto">
              <motion.button
                id="floating-menu-btn-quests"
                custom={0}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => handleAction(onOpenQuests)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/95 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 text-xs font-semibold shadow-lg shadow-black/40 backdrop-blur-md transition-colors"
              >
                <Scroll className="w-3.5 h-3.5 text-amber-400" />
                <span>퀘스트</span>
                {activeQuestCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-black leading-none">
                    {activeQuestCount}
                  </span>
                )}
                {offeredQuestCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-blue-500 text-white leading-none animate-pulse">
                    +{offeredQuestCount}
                  </span>
                )}
              </motion.button>

              <motion.button
                id="floating-menu-btn-camp"
                custom={1}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => handleAction(onOpenCamp)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/95 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 text-xs font-semibold shadow-lg shadow-black/40 backdrop-blur-md transition-colors"
              >
                <Tent className="w-3.5 h-3.5 text-emerald-400" />
                <span>야영지</span>
              </motion.button>

              <motion.button
                id="floating-menu-btn-back-adventure"
                custom={2}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => setCurrentCategory('root')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950/85 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200 text-[11px] font-medium shadow backdrop-blur-md transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>뒤로</span>
              </motion.button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 기본 [캐릭터] 버튼 */}
      <button
        id="character-floating-trigger-btn"
        onClick={toggleMenu}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
          isOpen
            ? 'bg-amber-600 text-zinc-950 border border-amber-400 shadow-amber-900/30'
            : 'bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white shadow-black/40'
        }`}
      >
        <User className={`w-3.5 h-3.5 ${isOpen ? 'text-zinc-950' : 'text-amber-400'}`} />
        <span>캐릭터</span>
        {isOpen ? (
          <ChevronDown className="w-3 h-3 opacity-80" />
        ) : (
          <ChevronUp className="w-3 h-3 opacity-80" />
        )}
        {(hasStatPoints || hasTalentPoints || totalQuestAlert > 0) && !isOpen && (
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-0.5" />
        )}
      </button>
    </div>
  );
};
