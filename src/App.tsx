import { useState, useEffect } from 'react';
import { GameMessage, PlayerState, PlayerStats } from './types';
import { extractCleanStory, normalizeNarrativeText } from './utils/narrativeSanitizer';
import {
  INITIAL_PLAYER_STATE,
  applyStateChanges,
  applyStoryLogProgress,
  DEFAULT_ACTION_TIME_MINUTES,
  allocateStatPoint,
  sanitizePlayerState,
  saveGameData,
  loadGameData,
  createNewPlayerState,
  shouldStartBattle,
  equipItemToSlot,
  unequipItemFromSlot,
  equipBagToPlayer,
  unequipBagFromPlayer,
  craftRecipe,
  setupCamp,
  upgradeCampFacility,
  performCampSleep,
  readBookInCamp,
  transferItemToCampStorage,
  transferItemFromCampStorage,
  setCompanionTactic,
  toggleCompanionActiveParty,
  useInventoryItem,
  discardInventoryItem,
  attemptUnlockLock,
  interactWithCharacter,
  enterLocation,
  acceptQuest,
  declineQuest,
} from './gameEngine';
import { dispatchGameEvent } from './gameEvents';
import { getRaceDefinition } from './data/raceData';
import { StatusHeader } from './components/StatusHeader';
import { StoryLog } from './components/StoryLog';
import { ActionInput } from './components/ActionInput';
import { CharacterFloatingMenu } from './components/CharacterFloatingMenu';
import { InternalStatusModal } from './components/InternalStatusModal';
import { StatsModal } from './components/StatsModal';
import { InventoryModal } from './components/InventoryModal';
import { StatusModal } from './components/StatusModal';
import { TalentTreeModal } from './components/TalentTreeModal';
import { ClassModal } from './components/ClassModal';
import { CombatScreen } from './components/CombatScreen';
import { CharacterCreationModal } from './components/CharacterCreationModal';
import { NewGameModal } from './components/NewGameModal';
import { GameOverModal } from './components/GameOverModal';
import { MainTitleScreen } from './components/MainTitleScreen';
import { EquipmentTab } from './components/EquipmentTab';
import { ProfessionsTab } from './components/ProfessionsTab';
import { CampTab } from './components/CampTab';
import { CompanionsTab } from './components/CompanionsTab';
import { QuestModal } from './components/QuestModal';
import { BattleState } from './combat/combatTypes';
import { initBattleState } from './combat/battleEngine';
import { createEnemyActor } from './combat/enemyFactory';
import { X, Shield } from 'lucide-react';
import { EquipmentSlot } from './data/equipment';
import { CampFacilityType } from './data/camp/campTypes';
import { CompanionTactic } from './types';

function generatePrologueMessage(state: PlayerState): GameMessage {
  const raceDef = getRaceDefinition(state.race || 'HUMAN', state.beastkinType);
  const charName = state.characterName || '모험가';
  const raceTitle = raceDef.subName || raceDef.name;
  const p = state.profile;
  const genderStr = p?.gender ? ` (${p.gender})` : '';

  let prologueText = '';

  if (state.race === 'ELF') {
    prologueText = `고대의 마력이 은은하게 일렁이는 신비로운 숲속, 나뭇잎 사이로 속삭이는 바람 소리와 함께 당신은 눈을 뜹니다.

당신은 [${raceTitle}] ${charName}${genderStr}.
${p?.hairColor ? `${p.hairColor} ${p.hairStyle}` : '단정한 머리칼'} 사이로 숲의 미풍이 스쳐 지나가며, 맑은 ${p?.eyeColor || '신비로운'} 눈동자에 은은한 햇살이 내려앉습니다. 손에는 낡은 가죽 주머니와 숲의 흙먼지가 묻어 있으며, 깊은 숲의 영험한 마력 감각이 온몸에 전해집니다.

당신은 지금 무엇을 하시겠습니까?`;
  } else if (state.race === 'BEASTKIN') {
    const beastDetail =
      state.beastkinType === 'BIRD'
        ? p?.beastFeatures?.hasWings
          ? `${p.beastFeatures.wingColor || ''} 날개와 깃털`
          : '예리한 눈빛'
        : `${p?.beastFeatures?.earColor || ''} ${p?.beastFeatures?.earDescription || '귀'}와 꼬리`;

    prologueText = `거친 바람과 야생의 흙냄새가 코끝을 스치는 숲의 가장자리, 곤히 잠들었던 감각이 번쩍 깨어납니다.

당신은 [${raceTitle}] ${charName}${genderStr}.
${beastDetail}을 지닌 긍지 높은 수인 모험가로서 판타지악 대륙에 첫 발을 내디뎠습니다. ${p?.features ? `(${p.features}) ` : ''}손에는 낡은 가죽 주머니와 모험의 흔적이 남아 있습니다.

당신은 지금 무엇을 하시겠습니까?`;
  } else {
    prologueText = `눈을 뜨자, 낯선 숲의 입구였습니다.

당신은 [${raceTitle}] ${charName}${genderStr}.
${p?.hairColor ? `${p.hairColor} ${p.hairStyle}` : '단정한 모습'}과 ${p?.build === 'SMALL' ? '날렵하고 작은' : p?.build === 'LARGE' ? '건장한' : '균형 잡힌'} 체격을 갖추고, 무한한 가능성과 호기심을 품은 채 판타지악 대륙에 첫 발을 내디뎠습니다.

당신은 지금 무엇을 하시겠습니까?`;
  }

  return {
    id: `msg-start-${Date.now()}`,
    role: 'gm',
    content: prologueText,
    timestamp: Date.now(),
  };
}

export default function App() {
  // Screen state: 'title' | 'game'
  const [currentScreen, setCurrentScreen] = useState<'title' | 'game'>('title');

  // Load saved state or default
  const [playerState, setPlayerState] = useState<PlayerState>(() => {
    const saved = loadGameData();
    return saved?.playerState || INITIAL_PLAYER_STATE;
  });

  const [messages, setMessages] = useState<GameMessage[]>(() => {
    const saved = loadGameData();
    if (saved?.messages && saved.messages.length > 0) {
      return saved.messages;
    }
    return [generatePrologueMessage(INITIAL_PLAYER_STATE)];
  });

  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [isCharacterCreationOpen, setIsCharacterCreationOpen] = useState(false);
  const [isNewGameOpen, setIsNewGameOpen] = useState(false);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isInternalStatusOpen, setIsInternalStatusOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isTalentsOpen, setIsTalentsOpen] = useState(false);
  const [isClassOpen, setIsClassOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  // 신규 4대 시스템 모달
  const [isEquipmentOpen, setIsEquipmentOpen] = useState(false);
  const [isProfessionsOpen, setIsProfessionsOpen] = useState(false);
  const [isCampOpen, setIsCampOpen] = useState(false);
  const [isCompanionsOpen, setIsCompanionsOpen] = useState(false);
  const [isQuestOpen, setIsQuestOpen] = useState(false);

  const hasSavedGame = Boolean(
    playerState.isCharacterCreated && messages && messages.length > 0
  );

  // Auto-save whenever playerState or messages change
  useEffect(() => {
    if (playerState.isCharacterCreated) {
      saveGameData(playerState, messages, []);
    }
  }, [playerState, messages]);

  const isGameOver = playerState.hp <= 0 || playerState.sanity <= 0;
  const gameOverReason: 'hp' | 'sanity' = playerState.hp <= 0 ? 'hp' : 'sanity';

  // Automatically trigger game over modal on demise
  useEffect(() => {
    if (isGameOver) {
      setIsGameOverModalOpen(true);
    }
  }, [isGameOver]);

  const handleSendAction = async (actionText: string) => {
    if (!actionText.trim() || isLoading || isGameOver) return;

    let updatedMessages = [...messages];
    const lastMsg = updatedMessages[updatedMessages.length - 1];

    if (lastMsg && lastMsg.status === 'error' && lastMsg.actionText === actionText.trim()) {
      updatedMessages = updatedMessages.filter((m) => m.id !== lastMsg.id);
    } else {
      const userMessage: GameMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: actionText.trim(),
        timestamp: Date.now(),
      };
      updatedMessages.push(userMessage);
    }

    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const historyPayload = updatedMessages
        .slice(0, -1)
        .filter((m) => m.status !== 'error')
        .map((m) => ({
          role: (m.role === 'user' ? 'user' : 'model') as 'user' | 'model',
          content: m.content,
        }));

      const res = await fetch('/api/rpg/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionText.trim(),
          history: historyPayload,
          playerState,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '게임 마스터와 연결하지 못했습니다.');
      }

      // Handle world action (TALK_CHARACTER, MEET_CHARACTER, ENTER_LOCATION)
      // 서버가 방금 기존 adultNarrativeQueue를 Gemini 참고자료로 소비했으므로
      // 응답 성공 시에만 기존 큐를 비웁니다. 이후 이번 행동에서 새로 생긴 큐는 유지됩니다.
      let currentStateForChanges: PlayerState = {
        ...playerState,
        adultNarrativeQueue: [],
      };
      let worldActionResultSummary: string[] = [];

      if (data.worldAction && data.worldAction.type) {
        if (data.worldAction.type === 'TALK_CHARACTER') {
          const charId = data.worldAction.characterId || data.worldAction.characterName || 'npc';
          const charName = data.worldAction.characterName;
          const talkRes = interactWithCharacter(currentStateForChanges, charId, 'TALKED', charName);
          currentStateForChanges = talkRes.nextState;
          if (talkRes.message) {
            worldActionResultSummary.push(talkRes.message);
          }
        } else if (data.worldAction.type === 'MEET_CHARACTER') {
          const charId = data.worldAction.characterId || data.worldAction.characterName || 'npc';
          const charName = data.worldAction.characterName;
          const meetRes = interactWithCharacter(currentStateForChanges, charId, 'MET', charName);
          currentStateForChanges = meetRes.nextState;
          if (meetRes.message) {
            worldActionResultSummary.push(meetRes.message);
          }
        } else if (data.worldAction.type === 'ENTER_LOCATION' && data.worldAction.location) {
          const locRes = enterLocation(currentStateForChanges, data.worldAction.location);
          currentStateForChanges = locRes.nextState;
          if (locRes.message) {
            worldActionResultSummary.push(locRes.message);
          }
        }
      }

      // Handle lock action if provided by GM
      let lockResultSummary: string[] = [];

      if (data.lockAction && data.lockAction.lockId && data.lockAction.method) {
        const lockRes = attemptUnlockLock(
          currentStateForChanges,
          data.lockAction.lockId,
          data.lockAction.method
        );
        currentStateForChanges = lockRes.nextState;
        if (lockRes.message) {
          lockResultSummary.push(lockRes.message);
        }

        // Prevent double item removal if GM returned the key item in removeItems
        if (data.changes?.removeItems && Array.isArray(data.changes.removeItems)) {
          const usedKeyId = data.lockAction.keyItemId;
          if (usedKeyId) {
            data.changes.removeItems = data.changes.removeItems.filter((item: any) => {
              const name = typeof item === 'string' ? item : item?.name || item?.id;
              return name !== usedKeyId;
            });
          }
        }
      }

      // Safe state calculation and validation with actual item verification
      // 정상 GM 스토리 로그 확정 시 기본 15분 또는 GM 제안 시간 진행 적용
      const timeDeltaMinutes =
        typeof data.changes?.timeDeltaMinutes === 'number'
          ? Math.min(1440, Math.max(1, Math.floor(data.changes.timeDeltaMinutes)))
          : DEFAULT_ACTION_TIME_MINUTES;

      const safeChangesWithTime = {
        ...(data.changes || {}),
        timeDeltaMinutes,
      };

      const { nextState, levelUpMessage, changeSummary } = applyStateChanges(
        currentStateForChanges,
        safeChangesWithTime
      );

      const finalState = applyStoryLogProgress(nextState);

      const allChangeLogs = [...worldActionResultSummary, ...lockResultSummary, ...(changeSummary || [])];

      // Check if GM triggered combat with strict safety validation
      const willStartBattle = shouldStartBattle(data.actionResult, data.changes?.battleTrigger);
      const pendingBattleForMessage = (willStartBattle && data.changes?.battleTrigger)
        ? data.changes.battleTrigger
        : undefined;

      // Update player state with stats/items first
      setPlayerState(finalState);

      const cleanStory = extractCleanStory(data.story);

      const gmMessage: GameMessage = {
        id: `gm-${Date.now()}`,
        role: 'gm',
        content: cleanStory,
        timestamp: Date.now(),
        appliedChanges: data.changes,
        systemChangeLogs: allChangeLogs.length > 0 ? allChangeLogs : undefined,
        pendingBattle: pendingBattleForMessage,
        statCheckResult: data.statCheck,
      };

      const newMsgList = [...updatedMessages, gmMessage];

      if (levelUpMessage) {
        newMsgList.push({
          id: `lvl-${Date.now()}`,
          role: 'system',
          content: levelUpMessage,
          timestamp: Date.now() + 1,
        });
      }

      setMessages(newMsgList);
    } catch (error: any) {
      console.error('Failed to take action:', error);
      const errorMessage: GameMessage = {
        id: `err-${Date.now()}`,
        role: 'gm',
        status: 'error',
        content: error.message || '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
        timestamp: Date.now(),
        actionText: actionText.trim(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartPendingBattle = (bt: any) => {
    const enemyList = (bt.enemies && bt.enemies.length > 0)
      ? bt.enemies.map((e: any) => createEnemyActor({
          name: e.name || bt.enemyName || '몬스터',
          level: e.level || bt.enemyLevel || playerState.level,
          tier: e.tier || bt.enemyTier || 'NORMAL',
          hp: e.hp,
          mp: e.mp,
        }))
      : [
          createEnemyActor({
            templateId: bt.enemyTemplate || 'wild_wolf',
            name: bt.enemyName || '숲의 약탈자',
            level: bt.enemyLevel || playerState.level,
            tier: bt.enemyTier || 'NORMAL',
          }),
        ];

    const initialBattle = initBattleState(
      playerState,
      enemyList,
      bt.battlefield ? { name: bt.battlefield.name, description: bt.battlefield.description } : undefined,
      bt.canEscape !== false
    );

    setPlayerState((prev) => ({
      ...prev,
      activeBattle: initialBattle,
    }));
  };

  const handleUpdateBattle = (nextBattle: BattleState) => {
    setPlayerState((prev) => ({
      ...prev,
      hp: nextBattle.player.hp,
      mana: nextBattle.player.mp,
      activeBattle: nextBattle,
    }));
  };

  const handleBattleEnd = (
    outcome: 'VICTORY' | 'DEFEAT' | 'ESCAPED',
    rewards?: { exp: number; rupees: number; items?: any[] }
  ) => {
    if (outcome === 'VICTORY') {
      const expGain = rewards?.exp || 50;
      const rupeeGain = rewards?.rupees || 20;

      const { nextState, levelUpMessage } = applyStateChanges(playerState, {
        expGain,
        rupeeDelta: rupeeGain,
        addItems: rewards?.items,
      });

      let processedState = nextState;

      // 처치한 적들에 대한 ENEMY_DEFEATED 이벤트 발생
      if (playerState.activeBattle?.enemies) {
        for (const enemy of playerState.activeBattle.enemies) {
          const enemyEv = dispatchGameEvent(processedState, 'ENEMY_DEFEATED', {
            enemyId: enemy.id,
            enemyName: enemy.name,
          });
          processedState = enemyEv.nextState;
        }
      }

      // 전투 승리 BATTLE_WON 이벤트 발생
      const wonEv = dispatchGameEvent(processedState, 'BATTLE_WON', {});
      processedState = wonEv.nextState;

      const clearedState: PlayerState = {
        ...processedState,
        activeBattle: null,
      };

      setPlayerState(clearedState);

      const victoryMsg: GameMessage = {
        id: `vic-${Date.now()}`,
        role: 'gm',
        content: `⚔️ [전투 승리]\n치열한 혈투 끝에 모든 적을 쓰러뜨렸습니다!\n• 획득 경험치: +${expGain} EXP\n• 획득 루피: +${rupeeGain} 루피`,
        timestamp: Date.now(),
      };

      const nextMsgs = [...messages, victoryMsg];
      if (levelUpMessage) {
        nextMsgs.push({
          id: `lvl-${Date.now()}`,
          role: 'system',
          content: levelUpMessage,
          timestamp: Date.now() + 1,
        });
      }
      setMessages(nextMsgs);
    } else if (outcome === 'ESCAPED') {
      setPlayerState((prev) => ({
        ...prev,
        activeBattle: null,
      }));

      const escapeMsg: GameMessage = {
        id: `esc-${Date.now()}`,
        role: 'gm',
        content: `💨 [도주 성공]\n적의 공격 범위를 벗어나 안전한 곳으로 후퇴했습니다.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, escapeMsg]);
    } else if (outcome === 'DEFEAT') {
      const lostEv = dispatchGameEvent(playerState, 'BATTLE_LOST', {});
      setPlayerState({
        ...lostEv.nextState,
        hp: 0,
        activeBattle: null,
      });
      setIsGameOverModalOpen(true);
    }
  };

  const handleAllocateStat = (statKey: keyof PlayerStats) => {
    const res = allocateStatPoint(playerState, statKey);
    setPlayerState(res.nextState);
  };

  const handleUseItem = (itemName: string) => {
    const res = useInventoryItem(playerState, itemName);
    setPlayerState(res.nextState);
  };

  const handleDiscardItem = (itemNameOrId: string, quantity: number = 1) => {
    const res = discardInventoryItem(playerState, itemNameOrId, quantity);
    setPlayerState(res.nextState);
    if (res.message) {
      const msg: GameMessage = {
        id: `item-discard-${Date.now()}`,
        role: 'gm',
        content: res.message,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, msg]);
    }
  };

  // 장비 핸들러
  const handleEquipItem = (slot: EquipmentSlot, equipmentId: string) => {
    const res = equipItemToSlot(playerState, slot, equipmentId);
    setPlayerState(res.nextState);
  };

  const handleUnequipItem = (slot: EquipmentSlot) => {
    const res = unequipItemFromSlot(playerState, slot);
    setPlayerState(res.nextState);
  };

  // 가방 장착/해제 핸들러
  const handleEquipBag = (bagId: string) => {
    const res = equipBagToPlayer(playerState, bagId);
    setPlayerState(res.nextState);
    if (res.message) {
      const msg: GameMessage = {
        id: `bag-equip-${Date.now()}`,
        role: 'gm',
        content: res.message,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, msg]);
    }
  };

  const handleUnequipBag = () => {
    const res = unequipBagFromPlayer(playerState);
    setPlayerState(res.nextState);
    if (res.message) {
      const msg: GameMessage = {
        id: `bag-unequip-${Date.now()}`,
        role: 'gm',
        content: res.message,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, msg]);
    }
  };

  // 생활직업 핸들러
  const handleCraftRecipe = (recipeId: string) => {
    const res = craftRecipe(playerState, recipeId);
    setPlayerState(res.nextState);
  };

  // 야영 핸들러
  const handleSetupCamp = () => {
    const res = setupCamp(playerState);
    setPlayerState(res.nextState);
  };

  const handleUpgradeFacility = (facilityId: CampFacilityType) => {
    const res = upgradeCampFacility(playerState, facilityId);
    setPlayerState(res.nextState);
  };

  const handleCampSleep = () => {
    const res = performCampSleep(playerState);
    setPlayerState(res.nextState);
  };

  const handleReadBook = (bookName: string) => {
    const res = readBookInCamp(playerState, bookName);
    setPlayerState(res.nextState);
  };

  const handleTransferToCampStorage = (itemNameOrId: string, quantity: number) => {
    const res = transferItemToCampStorage(playerState, itemNameOrId, quantity);
    if (res.success) {
      setPlayerState(res.nextState);
    }
    return res;
  };

  const handleTransferFromCampStorage = (itemNameOrId: string, quantity: number) => {
    const res = transferItemFromCampStorage(playerState, itemNameOrId, quantity);
    if (res.success) {
      setPlayerState(res.nextState);
    }
    return res;
  };

  // 동료 핸들러
  const handleSetCompanionTactic = (companionId: string, tactic: CompanionTactic) => {
    setPlayerState(setCompanionTactic(playerState, companionId, tactic));
  };

  const handleToggleActiveParty = (companionId: string) => {
    setPlayerState(toggleCompanionActiveParty(playerState, companionId));
  };

  // 퀘스트 수락 및 거절 핸들러
  const handleAcceptQuest = (questId: string) => {
    const res = acceptQuest(playerState, questId);
    if (res.success) {
      setPlayerState(res.nextState);
      if (res.systemMessages && res.systemMessages.length > 0) {
        const sysMsgs: GameMessage[] = res.systemMessages.map((content) => ({
          id: crypto.randomUUID(),
          role: 'system' as const,
          content,
          timestamp: Date.now(),
        }));
        setMessages((prev) => [...prev, ...sysMsgs]);
      }
    }
  };

  const handleDeclineQuest = (questId: string) => {
    const res = declineQuest(playerState, questId);
    if (res.success) {
      setPlayerState(res.nextState);
    }
  };

  const handleStartNewCharacter = () => {
    setIsNewGameOpen(false);
    setIsGameOverModalOpen(false);
    setIsCharacterCreationOpen(true);
  };

  const handleCharacterCreationComplete = (createdState: PlayerState) => {
    setPlayerState(createdState);
    const prologue = generatePrologueMessage(createdState);
    setMessages([prologue]);
    saveGameData(createdState, [prologue], []);
    setIsCharacterCreationOpen(false);
    setCurrentScreen('game');
  };

  const handleRestartWithCurrentCharacter = () => {
    const freshState = createNewPlayerState(
      playerState.profile,
      playerState.baseStats,
      0,
      true
    );
    setPlayerState(freshState);
    const prologue = generatePrologueMessage(freshState);
    setMessages([prologue]);
    saveGameData(freshState, [prologue], []);
    setIsNewGameOpen(false);
    setIsGameOverModalOpen(false);
    setCurrentScreen('game');
  };

  const handleOpenNewGameModal = () => {
    setIsNewGameOpen(true);
  };

  const handleContinueGame = () => {
    if (hasSavedGame) {
      setCurrentScreen('game');
    }
  };

  const handleStartNewGameFromTitle = () => {
    if (hasSavedGame) {
      setIsNewGameOpen(true);
    } else {
      setIsCharacterCreationOpen(true);
    }
  };

  const handleGoToTitle = () => {
    setCurrentScreen('title');
  };

  return (
    <div className="fixed inset-0 flex flex-col w-full h-full bg-stone-950 text-stone-100 overflow-hidden select-text">
      {currentScreen === 'title' ? (
        <MainTitleScreen
          hasSavedGame={hasSavedGame}
          savedPlayerState={hasSavedGame ? playerState : null}
          onContinueGame={handleContinueGame}
          onStartNewGame={handleStartNewGameFromTitle}
        />
      ) : playerState.activeBattle ? (
        /* 전용 턴제 전투 화면 */
        <CombatScreen
          playerState={playerState}
          battleState={playerState.activeBattle}
          onUpdateBattle={handleUpdateBattle}
          onBattleEnd={handleBattleEnd}
        />
      ) : (
        <div className="flex flex-col w-full h-full min-h-0 overflow-hidden">
          {/* Top Status Header with Level, Gauges, Currency - Sticky Fixed */}
          <StatusHeader
            playerState={playerState}
            isLoading={isLoading}
            onReset={handleOpenNewGameModal}
            onOpenStatus={() => setIsStatusOpen(true)}
            onGoToTitle={handleGoToTitle}
          />

          {/* Main Story Log (Drag to scroll, Scrollbar hidden, Smooth auto-scroll) */}
          <StoryLog
            messages={messages}
            isLoading={isLoading}
            isGameOver={isGameOver}
            gameOverReason={gameOverReason}
            onRetry={handleSendAction}
            onStartBattle={handleStartPendingBattle}
            onOpenGameOverModal={() => setIsGameOverModalOpen(true)}
            onStartNewCharacter={handleStartNewCharacter}
            onRestartWithCurrentCharacter={handleRestartWithCurrentCharacter}
          />

          {/* Bottom Free-form Action Input with Character Floating Menu directly above input on the left */}
          <ActionInput
            onSendAction={handleSendAction}
            isLoading={isLoading}
            isGameOver={isGameOver}
            characterMenu={
              <CharacterFloatingMenu
                playerState={playerState}
                onOpenStatus={() => setIsStatusOpen(true)}
                onOpenStats={() => setIsStatsOpen(true)}
                onOpenInternalStatus={() => setIsInternalStatusOpen(true)}
                onOpenTalents={() => setIsTalentsOpen(true)}
                onOpenClass={() => setIsClassOpen(true)}
                onOpenProfessions={() => setIsProfessionsOpen(true)}
                onOpenInventory={() => setIsInventoryOpen(true)}
                onOpenEquipment={() => setIsEquipmentOpen(true)}
                onOpenQuests={() => setIsQuestOpen(true)}
                onOpenCamp={() => setIsCampOpen(true)}
                onOpenCompanions={() => setIsCompanionsOpen(true)}
              />
            }
          />
        </div>
      )}

      {/* New Game Options Modal */}
      <NewGameModal
        isOpen={isNewGameOpen}
        onClose={() => setIsNewGameOpen(false)}
        onStartNewCharacter={handleStartNewCharacter}
        onRestartWithCurrentCharacter={handleRestartWithCurrentCharacter}
        playerState={playerState}
      />

      {/* Game Over Demise Modal */}
      <GameOverModal
        isOpen={isGameOverModalOpen && isGameOver}
        playerState={playerState}
        onStartNewCharacter={handleStartNewCharacter}
        onRestartWithCurrentCharacter={handleRestartWithCurrentCharacter}
      />

      {/* Character Creation Modal */}
      <CharacterCreationModal
        isOpen={isCharacterCreationOpen}
        onComplete={handleCharacterCreationComplete}
        onCancel={() => {
          setIsCharacterCreationOpen(false);
        }}
        isInitialGame={!playerState.isCharacterCreated}
      />

      {/* Status Modal */}
      <StatusModal
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        playerState={playerState}
        onOpenStats={() => {
          setIsStatusOpen(false);
          setIsStatsOpen(true);
        }}
      />

      {/* Internal Status Modal */}
      <InternalStatusModal
        isOpen={isInternalStatusOpen}
        onClose={() => setIsInternalStatusOpen(false)}
        playerState={playerState}
      />

      {/* Stats Modal */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        playerState={playerState}
        onAllocateStat={handleAllocateStat}
      />

      {/* Talent Tree Modal */}
      {isTalentsOpen && (
        <TalentTreeModal
          playerState={playerState}
          onUpdatePlayer={(updated) => setPlayerState(sanitizePlayerState(updated))}
          onClose={() => setIsTalentsOpen(false)}
        />
      )}

      {/* Class & Evolution Modal */}
      {isClassOpen && (
        <ClassModal
          playerState={playerState}
          onUpdatePlayer={(updated) => setPlayerState(updated)}
          onClose={() => setIsClassOpen(false)}
        />
      )}

      {/* Inventory Modal */}
      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        playerState={playerState}
        onUseItem={handleUseItem}
        onEquipBag={handleEquipBag}
        onUnequipBag={handleUnequipBag}
        onDiscardItem={handleDiscardItem}
      />

      {/* 13슬롯 장비 관리 모달 (캐릭터 페이퍼돌) */}
      {isEquipmentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-ui-pop-in">
          <div className="relative w-full max-w-5xl bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden max-h-[92dvh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-stone-800 bg-stone-950/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-stone-100 tracking-wide">
                    캐릭터 장비
                  </h2>
                  <p className="text-[11px] text-stone-400">
                    {playerState.characterName || '모험가'} · 13슬롯 전투 장비 및 가방
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEquipmentOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800/80 active:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                title="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <EquipmentTab
                playerState={playerState}
                onEquipItem={handleEquipItem}
                onUnequipItem={handleUnequipItem}
                onEquipBag={handleEquipBag}
                onUnequipBag={handleUnequipBag}
              />
            </div>
          </div>
        </div>
      )}

      {/* 생활 전문 직업 모달 */}
      {isProfessionsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-ui-pop-in">
          <div className="relative w-full max-w-4xl bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden max-h-[92dvh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800 bg-stone-950/80">
              <h2 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                6대 생활 전문 직업 및 제작
              </h2>
              <button
                onClick={() => setIsProfessionsOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ProfessionsTab
                playerState={playerState}
                onCraftRecipe={handleCraftRecipe}
              />
            </div>
          </div>
        </div>
      )}

      {/* 야영지 모달 */}
      {isCampOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-ui-pop-in">
          <div className="relative w-full max-w-4xl bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden max-h-[92dvh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800 bg-stone-950/80">
              <h2 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                모닥불 야영지 & 시설 증축
              </h2>
              <button
                onClick={() => setIsCampOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CampTab
                playerState={playerState}
                onSetupCamp={handleSetupCamp}
                onUpgradeFacility={handleUpgradeFacility}
                onCampSleep={handleCampSleep}
                onReadBook={handleReadBook}
                onTransferToStorage={handleTransferToCampStorage}
                onTransferFromStorage={handleTransferFromCampStorage}
              />
            </div>
          </div>
        </div>
      )}

      {/* 동료 관리 모달 */}
      {isCompanionsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-ui-pop-in">
          <div className="relative w-full max-w-4xl bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden max-h-[92dvh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800 bg-stone-950/80">
              <h2 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                파티 동행자 관리 & 전투 전술
              </h2>
              <button
                onClick={() => setIsCompanionsOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CompanionsTab
                playerState={playerState}
                onSetCompanionTactic={handleSetCompanionTactic}
                onToggleActiveParty={handleToggleActiveParty}
              />
            </div>
          </div>
        </div>
      )}

      {/* 퀘스트 일지 모달 */}
      {isQuestOpen && (
        <QuestModal
          playerState={playerState}
          onClose={() => setIsQuestOpen(false)}
          onAcceptQuest={handleAcceptQuest}
          onDeclineQuest={handleDeclineQuest}
        />
      )}
    </div>
  );
}
