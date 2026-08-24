import { useState } from 'react';
import {
  Race,
  BeastkinType,
  BuildType,
  PlayerStats,
  PlayerState,
  CharacterProfile,
  BeastFeatures,
  SpeechStyleData,
} from '../types';
import {
  RACE_DEFINITIONS,
  BEASTKIN_SUB_TYPES,
  PASSIVE_DEFINITIONS,
  getRaceDefinition,
} from '../data/raceData';
import { SPEECH_STYLE_PRESETS, SpeechStylePreset } from '../data/speechPresets';
import {
  INITIAL_PLAYER_STATS,
  calculateEffectiveStats,
  calculateMaxHp,
  calculateMaxSanity,
  calculateMaxMana,
  createNewPlayerState,
} from '../gameEngine';
import {
  Shield,
  Sparkles,
  User,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Plus,
  Minus,
  Dumbbell,
  Heart,
  Wind,
  Brain,
  Zap,
  Clover,
  MessageSquare,
  Sparkle,
  Image as ImageIcon,
  Quote,
} from 'lucide-react';

interface CharacterCreationModalProps {
  isOpen: boolean;
  onComplete: (newState: PlayerState) => void;
  onCancel?: () => void;
  isInitialGame?: boolean;
}

type WizardStep = 1 | 2 | 3 | 4 | 5;

const STEPS = [
  { step: 1, title: '기본 정보', desc: '이름, 성별, 나이, 말투' },
  { step: 2, title: '종족 선택', desc: '인간, 엘프, 수인 세부' },
  { step: 3, title: '외형 설정', desc: '체격, 머리/눈 색, 특징' },
  { step: 4, title: '스탯 분배', desc: '초기 5P 보너스 분배' },
  { step: 5, title: '최종 확인', desc: '프로필 확인 및 모험 시작' },
];

const STAT_CONFIGS: Array<{
  key: keyof PlayerStats;
  label: string;
  desc: string;
  icon: any;
  color: string;
}> = [
  { key: 'strength', label: '근력', desc: '물리 공격력 및 강한 타격력', icon: Dumbbell, color: 'text-orange-400' },
  { key: 'vitality', label: '체력', desc: '최대 체력(HP) +10', icon: Heart, color: 'text-rose-400' },
  { key: 'agility', label: '민첩', desc: '행동 속도, 회피 및 기습', icon: Wind, color: 'text-emerald-400' },
  { key: 'intelligence', label: '지능', desc: '최대 마나(MP) +5 및 마법 위력', icon: Zap, color: 'text-sky-400' },
  { key: 'spirit', label: '정신', desc: '최대 정신력(Sanity) +10', icon: Brain, color: 'text-purple-400' },
  { key: 'luck', label: '행운', desc: '치명타 및 돌발 행운 이벤트', icon: Clover, color: 'text-amber-400' },
];

export function CharacterCreationModal({
  isOpen,
  onComplete,
  onCancel,
  isInitialGame = false,
}: CharacterCreationModalProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);

  // Step 1: Basic Info & Speech Style
  const [inGameName, setInGameName] = useState('모험가');
  const [genderMode, setGenderMode] = useState<'남성' | '여성' | '기타' | '직접입력'>('남성');
  const [customGender, setCustomGender] = useState('');
  const [physicalAge, setPhysicalAge] = useState<number>(18);
  const [nameError, setNameError] = useState('');

  // Speech style state
  const [selectedSpeechPresetId, setSelectedSpeechPresetId] = useState<string>('calm');
  const [customSpeechDesc, setCustomSpeechDesc] = useState('');
  const [customTone, setCustomTone] = useState('');
  const [customPoliteness, setCustomPoliteness] = useState('');
  const [customQuirk, setCustomQuirk] = useState('');
  const [customExample, setCustomExample] = useState('');
  const [isCustomSpeechMode, setIsCustomSpeechMode] = useState(false);

  // Portrait URL (optional preset/custom)
  const [portraitUrl, setPortraitUrl] = useState<string>('');

  // Step 2: Race
  const [selectedRace, setSelectedRace] = useState<Race>('HUMAN');
  const [selectedBeastkin, setSelectedBeastkin] = useState<BeastkinType>('CAT');

  // Step 3: Appearance
  const [height, setHeight] = useState<number>(170);
  const [build, setBuild] = useState<BuildType>('AVERAGE');
  const [hairColor, setHairColor] = useState('검은색');
  const [hairStyle, setHairStyle] = useState('짧은 단발');
  const [eyeColor, setEyeColor] = useState('갈색');
  const [skinDescription, setSkinDescription] = useState('건강한 살결');
  const [features, setFeatures] = useState('');
  const [appearance, setAppearance] = useState('');

  // Beastkin specific appearance
  const [earDescription, setEarDescription] = useState('쫑긋 솟은 귀');
  const [earColor, setEarColor] = useState('');
  const [tailDescription, setTailDescription] = useState('유연하게 흔들리는 꼬리');
  const [tailColor, setTailColor] = useState('');
  const [furDescription, setFurDescription] = useState('부드러운 털');
  const [hasWings, setHasWings] = useState(true);
  const [wingDescription, setWingDescription] = useState('등 뒤에 펼쳐진 날개');
  const [wingColor, setWingColor] = useState('흑갈색');

  // Step 4: Stat Allocations (5 bonus points)
  const [bonusAllocations, setBonusAllocations] = useState<PlayerStats>({
    strength: 0,
    vitality: 0,
    agility: 0,
    intelligence: 0,
    spirit: 0,
    luck: 0,
  });

  if (!isOpen) return null;

  const currentDef = getRaceDefinition(selectedRace, selectedBeastkin);
  const effectiveGender = genderMode === '직접입력' ? customGender.trim() || '미상' : genderMode;

  const allocatedCount = (Object.values(bonusAllocations) as number[]).reduce(
    (acc: number, v: number) => acc + v,
    0
  );
  const remainingPoints = Math.max(0, 5 - allocatedCount);

  const baseStats: PlayerStats = {
    strength: INITIAL_PLAYER_STATS.strength + bonusAllocations.strength,
    vitality: INITIAL_PLAYER_STATS.vitality + bonusAllocations.vitality,
    agility: INITIAL_PLAYER_STATS.agility + bonusAllocations.agility,
    intelligence: INITIAL_PLAYER_STATS.intelligence + bonusAllocations.intelligence,
    spirit: INITIAL_PLAYER_STATS.spirit + bonusAllocations.spirit,
    luck: INITIAL_PLAYER_STATS.luck + bonusAllocations.luck,
  };

  const effectiveStats = calculateEffectiveStats(baseStats, selectedRace, selectedBeastkin);
  const maxHp = calculateMaxHp(effectiveStats.vitality);
  const maxSanity = calculateMaxSanity(effectiveStats.spirit);
  const maxMana = calculateMaxMana(effectiveStats.intelligence);

  const currentPreset = SPEECH_STYLE_PRESETS.find((p) => p.id === selectedSpeechPresetId) || SPEECH_STYLE_PRESETS[0];

  const getEffectiveSpeechStyle = (): SpeechStyleData => {
    if (isCustomSpeechMode && customSpeechDesc.trim()) {
      return {
        presetId: 'custom',
        description: customSpeechDesc.trim(),
        tone: customTone.trim() || '자연스러움',
        politeness: customPoliteness.trim() || '상황에 따름',
        quirks: customQuirk.trim() ? [customQuirk.trim()] : [],
        exampleLines: customExample.trim() ? [customExample.trim()] : [],
      };
    }
    return {
      presetId: currentPreset.id,
      description: currentPreset.description,
      tone: currentPreset.tone,
      politeness: currentPreset.politeness,
      quirks: currentPreset.quirks,
      exampleLines: currentPreset.exampleLines,
    };
  };

  const handleAddStat = (key: keyof PlayerStats) => {
    if (remainingPoints <= 0) return;
    setBonusAllocations((prev) => ({ ...prev, [key]: prev[key] + 1 }));
  };

  const handleMinusStat = (key: keyof PlayerStats) => {
    if (bonusAllocations[key] <= 0) return;
    setBonusAllocations((prev) => ({ ...prev, [key]: prev[key] - 1 }));
  };

  const handleResetPoints = () => {
    setBonusAllocations({
      strength: 0,
      vitality: 0,
      agility: 0,
      intelligence: 0,
      spirit: 0,
      luck: 0,
    });
  };

  const validateStep1 = () => {
    if (!inGameName.trim()) {
      setNameError('인게임 이름을 입력해 주세요.');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
    }
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as WizardStep);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
    }
  };

  const handleFinish = () => {
    if (!inGameName.trim()) {
      setCurrentStep(1);
      setNameError('인게임 이름을 입력해 주세요.');
      return;
    }

    const beastFeatures: BeastFeatures | undefined =
      selectedRace === 'BEASTKIN'
        ? selectedBeastkin === 'BIRD'
          ? {
              hasWings,
              wingDescription: hasWings ? wingDescription : undefined,
              wingColor: hasWings ? wingColor : undefined,
              furDescription,
            }
          : {
              earDescription,
              earColor: earColor || undefined,
              tailDescription,
              tailColor: tailColor || undefined,
              furDescription,
            }
        : undefined;

    const speechStyle = getEffectiveSpeechStyle();

    const profile: CharacterProfile = {
      inGameName: inGameName.trim(),
      name: inGameName.trim(),
      gender: effectiveGender,
      physicalAge: Math.max(13, physicalAge || 18),
      race: selectedRace,
      beastkinType: selectedRace === 'BEASTKIN' ? selectedBeastkin : undefined,
      height: Math.max(50, height || 170),
      build,
      hairColor: hairColor.trim() || '검은색',
      hairStyle: hairStyle.trim() || '단정한 머리',
      eyeColor: eyeColor.trim() || '갈색',
      skinDescription: skinDescription.trim(),
      features: features.trim(),
      appearance: appearance.trim(),
      speechStyle,
      portraitUrl: portraitUrl.trim() || undefined,
      beastFeatures,
    };

    const newState = createNewPlayerState(profile, baseStats, remainingPoints, true);
    onComplete(newState);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header & Step Indicator */}
        <div className="flex-none px-4 pt-3.5 pb-2.5 bg-stone-950/80 border-b border-stone-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-stone-100 tracking-tight">
                판타지악 캐릭터 생성
              </h2>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {currentStep} / 5 단계
            </span>
          </div>

          {/* Stepper Dots / Bars */}
          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {STEPS.map((s) => {
              const isCurrent = s.step === currentStep;
              const isPassed = s.step < currentStep;
              return (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => {
                    if (s.step < currentStep || validateStep1()) {
                      setCurrentStep(s.step as WizardStep);
                    }
                  }}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                      : isPassed
                      ? 'bg-amber-600/70'
                      : 'bg-stone-800'
                  }`}
                  title={`${s.step}단계: ${s.title}`}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-400 mt-1.5">
            <span className="font-semibold text-stone-200">
              {STEPS[currentStep - 1].title}
            </span>
            <span className="text-stone-500 text-[10px]">
              {STEPS[currentStep - 1].desc}
            </span>
          </div>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs custom-scrollbar">
          {/* STEP 1: 기본 정보 & 말투 설정 */}
          {currentStep === 1 && (
            <div className="space-y-4">
              {/* 인게임 이름 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-200">
                  인게임 이름 <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={inGameName}
                    onChange={(e) => {
                      setInGameName(e.target.value);
                      if (e.target.value.trim()) setNameError('');
                    }}
                    placeholder="인게임에서 불릴 이름을 입력하세요 (예: 레이, 카일)"
                    maxLength={20}
                    className={`w-full bg-stone-950 border ${
                      nameError ? 'border-rose-500 focus:border-rose-400' : 'border-stone-800 focus:border-amber-500'
                    } rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-600 focus:outline-none transition`}
                  />
                  <span className="absolute right-3 top-2.5 text-[11px] text-stone-500 font-mono">
                    {inGameName.length}/20
                  </span>
                </div>
                {nameError && (
                  <p className="text-[11px] text-rose-400 font-medium">{nameError}</p>
                )}
                <p className="text-[11px] text-stone-400">
                  실제 플레이 중 NPC와 GM이 캐릭터를 공식 지칭할 때 사용하는 고유 이름입니다. (빈 이름 불가)
                </p>
              </div>

              {/* 성별 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-200">성별</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['남성', '여성', '기타', '직접입력'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGenderMode(g)}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold border transition cursor-pointer text-center ${
                        genderMode === g
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-xs'
                          : 'bg-stone-950/70 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>

                {genderMode === '직접입력' && (
                  <input
                    type="text"
                    value={customGender}
                    onChange={(e) => setCustomGender(e.target.value)}
                    placeholder="성별 또는 정체성을 직접 입력하세요 (예: 무성, 초월체 등)"
                    maxLength={15}
                    className="w-full mt-2 bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none transition"
                  />
                )}
              </div>

              {/* 신체적 나이 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-200">신체적 나이 (외형 연령)</label>
                  <span className="font-mono text-sm font-bold text-amber-400">
                    {physicalAge}세
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={13}
                    max={100}
                    value={physicalAge}
                    onChange={(e) => setPhysicalAge(parseInt(e.target.value, 10))}
                    className="flex-1 accent-amber-500 cursor-pointer h-2 bg-stone-950 rounded-lg"
                  />
                  <input
                    type="number"
                    min={13}
                    max={999}
                    value={physicalAge}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setPhysicalAge(isNaN(val) ? 13 : Math.max(13, val));
                    }}
                    className="w-16 bg-stone-950 border border-stone-800 rounded-lg px-2 py-1 text-center font-mono text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  💡 외형상 신체 연령(최소 13세)입니다. NPC의 첫인상, 대사, 체격에 반영됩니다.
                </p>
              </div>

              {/* 주인공 말투 및 화법 설정 */}
              <div className="p-3.5 bg-stone-950 border border-stone-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-bold text-xs text-stone-200">주인공 말투 / 화법 설정</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCustomSpeechMode(!isCustomSpeechMode)}
                    className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                  >
                    {isCustomSpeechMode ? '프리셋 목록 보기' : '직접 입력하기'}
                  </button>
                </div>

                {!isCustomSpeechMode ? (
                  /* Presets grid */
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                      {SPEECH_STYLE_PRESETS.map((p) => {
                        const isSelected = selectedSpeechPresetId === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setSelectedSpeechPresetId(p.id)}
                            className={`p-2 rounded-lg border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                              isSelected
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                            }`}
                          >
                            <span className="text-xs">{p.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Active preset details */}
                    <div className="p-2.5 bg-stone-900/80 border border-stone-800 rounded-lg space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between text-stone-400">
                        <span className="font-bold text-amber-300">
                          {currentPreset.name} 말투 ({currentPreset.politeness})
                        </span>
                        <span className="text-[10px] text-stone-500">{currentPreset.tone}</span>
                      </div>
                      <p className="text-stone-300 leading-relaxed">{currentPreset.description}</p>
                      <div className="space-y-0.5 pt-1 border-t border-stone-800/80">
                        <span className="text-[10px] text-stone-500 font-medium">대표 예시 대사:</span>
                        {currentPreset.exampleLines.map((line, idx) => (
                          <div key={idx} className="flex items-center gap-1 text-[11px] text-amber-200/90 font-serif italic">
                            <Quote className="w-2.5 h-2.5 text-amber-400 shrink-0 inline" />
                            <span>"{line}"</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Custom speech inputs */
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-stone-400 block mb-0.5">화법 설명</label>
                      <input
                        type="text"
                        value={customSpeechDesc}
                        onChange={(e) => setCustomSpeechDesc(e.target.value)}
                        placeholder="예: 귀족적이고 격식 있으나 은근히 장난기가 섞인 어조"
                        className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 placeholder-stone-600 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-stone-400 block mb-0.5">톤 및 어조</label>
                        <input
                          type="text"
                          value={customTone}
                          onChange={(e) => setCustomTone(e.target.value)}
                          placeholder="예: 차분함, 냉소적, 활발함"
                          className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 placeholder-stone-600 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-stone-400 block mb-0.5">경어/반말</label>
                        <input
                          type="text"
                          value={customPoliteness}
                          onChange={(e) => setCustomPoliteness(e.target.value)}
                          placeholder="예: 반말 위주, 정중한 존댓말"
                          className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 placeholder-stone-600 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-400 block mb-0.5">말버릇 또는 대표 대사</label>
                      <input
                        type="text"
                        value={customExample}
                        onChange={(e) => setCustomExample(e.target.value)}
                        placeholder="예: '흠, 그건 좀 곤란하겠는데?'"
                        className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 placeholder-stone-600 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
                <p className="text-[10px] text-stone-500">
                  💡 플레이어가 대사를 직접 입력하면 그 대사가 항상 최우선으로 적용되며, AI GM이 주인공의 반응을 서술할 때 이 말투를 반영합니다.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: 종족 선택 */}
          {currentStep === 2 && (
            <div className="space-y-3.5">
              {/* Race Primary Selection */}
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { race: 'HUMAN' as Race, label: '인간', icon: '👤' },
                    { race: 'ELF' as Race, label: '엘프', icon: '🌿' },
                    { race: 'BEASTKIN' as Race, label: '수인', icon: '🐾' },
                  ] as const
                ).map((r) => {
                  const isSelected = selectedRace === r.race;
                  return (
                    <button
                      key={r.race}
                      type="button"
                      onClick={() => setSelectedRace(r.race)}
                      className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-amber-300 ring-1 ring-amber-500/40'
                          : 'bg-stone-950/70 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                      }`}
                    >
                      <span className="text-2xl">{r.icon}</span>
                      <span className="font-bold text-xs">{r.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Beastkin Sub-race Selector (if BEASTKIN) */}
              {selectedRace === 'BEASTKIN' && (
                <div className="p-3 bg-stone-950/90 border border-stone-800 rounded-xl space-y-2 animate-in fade-in duration-150">
                  <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                    <span>🐾</span> 수인 세부 종류 선택
                  </span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {BEASTKIN_SUB_TYPES.map((b) => {
                      const isSubSelected = selectedBeastkin === b.type;
                      return (
                        <button
                          key={b.type}
                          type="button"
                          onClick={() => setSelectedBeastkin(b.type)}
                          className={`p-2 rounded-lg border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                            isSubSelected
                              ? 'bg-amber-500/25 border-amber-500 text-amber-300 font-bold'
                              : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          <span className="text-base">{b.icon}</span>
                          <span className="text-[10px]">{b.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Race Description Card */}
              <div className="p-3.5 bg-stone-950 border border-stone-800 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between border-b border-stone-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{currentDef.iconSymbol}</span>
                    <div>
                      <span className="font-bold text-sm text-stone-100">
                        {currentDef.subName || currentDef.name}
                      </span>
                      <span className="text-[10px] text-amber-400/90 ml-2 font-mono">
                        [{currentDef.id}]
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-stone-300 leading-relaxed text-[11px]">
                  {currentDef.description}
                </p>

                {/* Tendency / Keywords */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-stone-500 font-medium">주요 성향:</span>
                  {currentDef.reactionTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 text-amber-300/90 font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Stat Modifiers */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold text-stone-400 block">종족 스탯 보정치:</span>
                  <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
                    {Object.entries(currentDef.statModifiers).map(([k, val]) => {
                      const num = val as number;
                      const label = STAT_CONFIGS.find((s) => s.key === k)?.label || k;
                      return (
                        <div
                          key={k}
                          className="flex items-center justify-between px-2 py-1 rounded bg-stone-900/90 border border-stone-800/80"
                        >
                          <span className="text-stone-400">{label}</span>
                          <span
                            className={
                              num > 0
                                ? 'text-emerald-400 font-bold'
                                : num < 0
                                ? 'text-rose-400 font-bold'
                                : 'text-stone-500'
                            }
                          >
                            {num > 0 ? `+${num}` : num}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Passives */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold text-stone-400 block">고유 종족 패시브:</span>
                  <div className="space-y-1">
                    {currentDef.passiveIds.map((pId) => {
                      const p = PASSIVE_DEFINITIONS[pId];
                      return (
                        <div
                          key={pId}
                          className="p-1.5 rounded bg-stone-900 border border-stone-800 text-[10px]"
                        >
                          <span className="font-bold text-amber-300">{p ? p.name : pId}: </span>
                          <span className="text-stone-400">{p ? p.effect : ''}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: 외형 설정 & 삽화 URL */}
          {currentStep === 3 && (
            <div className="space-y-3.5">
              {/* 키 & 체격 */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-200 block">키 (cm)</label>
                  <div className="flex items-center gap-1 bg-stone-950 border border-stone-800 rounded-xl px-3 py-2">
                    <input
                      type="number"
                      min={60}
                      max={250}
                      value={height}
                      onChange={(e) => setHeight(parseInt(e.target.value, 10) || 170)}
                      className="w-full bg-transparent text-sm font-mono text-stone-100 focus:outline-none"
                    />
                    <span className="text-xs text-stone-500 font-mono shrink-0">cm</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-200 block">체격</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(
                      [
                        { id: 'SMALL' as BuildType, label: '소형' },
                        { id: 'AVERAGE' as BuildType, label: '보통' },
                        { id: 'LARGE' as BuildType, label: '대형' },
                      ] as const
                    ).map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBuild(b.id)}
                        className={`py-2 rounded-xl text-[11px] font-semibold border transition cursor-pointer ${
                          build === b.id
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 머리색 & 머리 형태 */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-200 block">머리색</label>
                  <input
                    type="text"
                    value={hairColor}
                    onChange={(e) => setHairColor(e.target.value)}
                    placeholder="예: 검은색, 은발, 금발"
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {['검은색', '은발', '금발', '갈색', '적발'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setHairColor(c)}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-400 hover:text-amber-300"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-200 block">머리 형태</label>
                  <input
                    type="text"
                    value={hairStyle}
                    onChange={(e) => setHairStyle(e.target.value)}
                    placeholder="예: 짧은 단발, 긴 생머리"
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {['짧은 단발', '긴 생머리', '곱슬머리', '포니테일'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setHairStyle(s)}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-400 hover:text-amber-300"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 눈 색 & 피부 특징 */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-200 block">눈 색</label>
                  <input
                    type="text"
                    value={eyeColor}
                    onChange={(e) => setEyeColor(e.target.value)}
                    placeholder="예: 갈색, 푸른색, 붉은색"
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {['갈색', '검은색', '푸른색', '붉은색', '호박색'].map((eColor) => (
                      <button
                        key={eColor}
                        type="button"
                        onClick={() => setEyeColor(eColor)}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-400 hover:text-amber-300"
                      >
                        {eColor}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-200 block">피부 특징</label>
                  <input
                    type="text"
                    value={skinDescription}
                    onChange={(e) => setSkinDescription(e.target.value)}
                    placeholder="예: 건강한 살결, 창백함, 구릿빛"
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {['건강한 살결', '창백한 편', '구릿빛 피부', '백옥같은 피부'].map((sk) => (
                      <button
                        key={sk}
                        type="button"
                        onClick={() => setSkinDescription(sk)}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-400 hover:text-amber-300"
                      >
                        {sk}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 고유 특징 */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-200 block">고유 특징 (흉터, 점, 인상 등)</label>
                <input
                  type="text"
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder="예: 왼쪽 눈 아래 작은 흉터, 날카롭고 호기심 어린 눈매"
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none"
                />
              </div>

              {/* 수인 전용 외형 옵션 */}
              {selectedRace === 'BEASTKIN' && (
                <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2.5">
                  <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                    <span>🐾</span> [{currentDef.subName}] 수인 고유 외형 정보
                  </span>

                  {selectedBeastkin === 'BIRD' ? (
                    /* Bird Beastkin */
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-stone-300">날개 유무</label>
                        <button
                          type="button"
                          onClick={() => setHasWings(!hasWings)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            hasWings
                              ? 'bg-amber-500 text-stone-950'
                              : 'bg-stone-800 text-stone-400'
                          }`}
                        >
                          {hasWings ? '날개 보유' : '날개 없음'}
                        </button>
                      </div>

                      {hasWings && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-stone-400 block mb-0.5">날개 색</label>
                            <input
                              type="text"
                              value={wingColor}
                              onChange={(e) => setWingColor(e.target.value)}
                              placeholder="예: 흑갈색, 은빛, 칠흑"
                              className="w-full bg-stone-950 border border-stone-800 rounded-lg px-2 py-1.5 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-stone-400 block mb-0.5">날개 형태</label>
                            <input
                              type="text"
                              value={wingDescription}
                              onChange={(e) => setWingDescription(e.target.value)}
                              placeholder="예: 거대한 맹금류 날개"
                              className="w-full bg-stone-950 border border-stone-800 rounded-lg px-2 py-1.5 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="text-[10px] text-stone-400 block mb-0.5">깃털 특징</label>
                        <input
                          type="text"
                          value={furDescription}
                          onChange={(e) => setFurDescription(e.target.value)}
                          placeholder="예: 뺨과 팔에 돋아난 부드러운 깃털"
                          className="w-full bg-stone-950 border border-stone-800 rounded-lg px-2 py-1.5 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    /* Fox, Cat, Dog, Wolf */
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-stone-400 block mb-0.5">귀 형태</label>
                          <input
                            type="text"
                            value={earDescription}
                            onChange={(e) => setEarDescription(e.target.value)}
                            placeholder="예: 쫑긋한 삼각 귀, 축 늘어진 귀"
                            className="w-full bg-stone-950 border border-stone-800 rounded-lg px-2 py-1.5 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-stone-400 block mb-0.5">귀 색</label>
                          <input
                            type="text"
                            value={earColor}
                            onChange={(e) => setEarColor(e.target.value)}
                            placeholder="예: 검은색, 붉은 갈색, 흰색"
                            className="w-full bg-stone-950 border border-stone-800 rounded-lg px-2 py-1.5 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-stone-400 block mb-0.5">꼬리 형태</label>
                          <input
                            type="text"
                            value={tailDescription}
                            onChange={(e) => setTailDescription(e.target.value)}
                            placeholder="예: 풍성하고 긴 꼬리, 짧은 꼬리"
                            className="w-full bg-stone-950 border border-stone-800 rounded-lg px-2 py-1.5 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-stone-400 block mb-0.5">꼬리 색</label>
                          <input
                            type="text"
                            value={tailColor}
                            onChange={(e) => setTailColor(e.target.value)}
                            placeholder="예: 꼬리 끝만 흰색, 칠흑색"
                            className="w-full bg-stone-950 border border-stone-800 rounded-lg px-2 py-1.5 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-stone-400 block mb-0.5">털 특징</label>
                        <input
                          type="text"
                          value={furDescription}
                          onChange={(e) => setFurDescription(e.target.value)}
                          placeholder="예: 윤기 흐르는 부드러운 털, 억센 야생 털"
                          className="w-full bg-stone-950 border border-stone-800 rounded-lg px-2 py-1.5 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 캐릭터 삽화 이미지 URL (선택) */}
              <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  <label className="text-xs font-bold text-stone-200">캐릭터 삽화 이미지 URL (선택)</label>
                </div>
                <input
                  type="url"
                  value={portraitUrl}
                  onChange={(e) => setPortraitUrl(e.target.value)}
                  placeholder="https://example.com/character_portrait.png (비워둘 시 종족 엠블럼 표시)"
                  className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none"
                />
                <p className="text-[10px] text-stone-500">
                  💡 게임 화면 좌측 상단 및 상태창에 실시간으로 표시될 주인공의 삽화 이미지 링크입니다.
                </p>
              </div>

              {/* 추가 외형 자유 설명 */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-200 block">추가 외형 자유 설명</label>
                <textarea
                  value={appearance}
                  onChange={(e) => setAppearance(e.target.value)}
                  placeholder="캐릭터의 복장, 분위기, 눈빛 등 추가적으로 묘사하고 싶은 외형을 자유롭게 적어주세요."
                  rows={3}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl p-3 text-xs text-stone-100 placeholder-stone-600 focus:outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4: 스탯 분배 */}
          {currentStep === 4 && (
            <div className="space-y-3.5">
              {/* Points Banner */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-950 border border-stone-800">
                <div>
                  <span className="text-xs font-bold text-stone-200 block">초기 보너스 포인트</span>
                  <span className="text-[10px] text-stone-400">
                    선택 종족: {currentDef.subName || currentDef.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500 text-stone-950 shadow-xs">
                    남은 {remainingPoints} P
                  </span>
                  {allocatedCount > 0 && (
                    <button
                      type="button"
                      onClick={handleResetPoints}
                      className="p-1 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-md transition cursor-pointer"
                      title="포인트 초기화"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Stat Allocation List */}
              <div className="space-y-2">
                {STAT_CONFIGS.map((stat) => {
                  const Icon = stat.icon;
                  const bonus = bonusAllocations[stat.key];
                  const base = INITIAL_PLAYER_STATS[stat.key] + bonus;
                  const raceMod = currentDef.statModifiers[stat.key] || 0;
                  const effective = effectiveStats[stat.key];

                  return (
                    <div
                      key={stat.key}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950/80 border border-stone-800"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-stone-900 border border-stone-800">
                          <Icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-stone-200">{stat.label}</span>
                            {raceMod !== 0 && (
                              <span
                                className={`text-[10px] font-mono ${
                                  raceMod > 0 ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                ({raceMod > 0 ? `+${raceMod}` : raceMod} 종족)
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-stone-500">{stat.desc}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right mr-1">
                          <div className="font-mono text-sm font-bold text-stone-100">
                            {effective}
                          </div>
                          <div className="text-[9px] text-stone-500 font-mono">
                            기본 {base}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMinusStat(stat.key)}
                            disabled={bonus <= 0}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-4 text-center font-mono text-xs text-amber-400 font-bold">
                            +{bonus}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddStat(stat.key)}
                            disabled={remainingPoints <= 0}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Computed Resources Preview */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 text-center">
                <div>
                  <span className="text-[10px] text-rose-400 font-medium block">최대 체력</span>
                  <span className="font-mono text-sm font-bold text-stone-100">{maxHp} HP</span>
                </div>
                <div>
                  <span className="text-[10px] text-purple-400 font-medium block">최대 정신력</span>
                  <span className="font-mono text-sm font-bold text-stone-100">{maxSanity} SAN</span>
                </div>
                <div>
                  <span className="text-[10px] text-sky-400 font-medium block">최대 마나</span>
                  <span className="font-mono text-sm font-bold text-stone-100">{maxMana} MP</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: 최종 확인 */}
          {currentStep === 5 && (
            <div className="space-y-3">
              <div className="p-3.5 bg-stone-950 border border-amber-500/40 rounded-xl space-y-3 shadow-lg">
                {/* Header summary */}
                <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    {portraitUrl ? (
                      <img
                        src={portraitUrl}
                        alt={inGameName}
                        className="w-12 h-12 rounded-lg object-cover border border-amber-500/50"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-3xl">{currentDef.iconSymbol}</span>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-bold text-stone-100">{inGameName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30">
                          {currentDef.subName || currentDef.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        성별: {effectiveGender} · 신체적 나이: {physicalAge}세 · 키: {height}cm ({build === 'SMALL' ? '소형' : build === 'LARGE' ? '대형' : '보통'})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Speech Style Summary */}
                <div className="p-2.5 bg-stone-900/70 rounded-lg border border-stone-800/80 space-y-1">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-300">
                    <MessageSquare className="w-3 h-3" />
                    <span>주인공 화법 및 말투: {getEffectiveSpeechStyle().tone || '자연스러움'} ({getEffectiveSpeechStyle().politeness || '상황에 따름'})</span>
                  </div>
                  <p className="text-[11px] text-stone-300">
                    {getEffectiveSpeechStyle().description}
                  </p>
                  {getEffectiveSpeechStyle().exampleLines && getEffectiveSpeechStyle().exampleLines!.length > 0 && (
                    <div className="text-[10px] text-amber-200/90 font-serif italic pt-0.5">
                      예시: "{getEffectiveSpeechStyle().exampleLines![0]}"
                    </div>
                  )}
                </div>

                {/* Appearance details list */}
                <div className="space-y-1.5 text-[11px] text-stone-300 bg-stone-900/60 p-2.5 rounded-lg border border-stone-800/80">
                  <div className="font-bold text-amber-400/90 text-[10px] mb-1">외형 세부 정보</div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-stone-400">
                    <div>
                      <span className="text-stone-500">머리: </span>
                      <span className="text-stone-200">{hairColor} / {hairStyle}</span>
                    </div>
                    <div>
                      <span className="text-stone-500">눈동자: </span>
                      <span className="text-stone-200">{eyeColor}</span>
                    </div>
                    <div>
                      <span className="text-stone-500">피부: </span>
                      <span className="text-stone-200">{skinDescription || '보통'}</span>
                    </div>
                    <div>
                      <span className="text-stone-500">특징: </span>
                      <span className="text-stone-200">{features || '없음'}</span>
                    </div>
                  </div>

                  {selectedRace === 'BEASTKIN' && (
                    <div className="pt-1.5 border-t border-stone-800 mt-1.5 space-y-0.5">
                      <span className="text-[10px] text-amber-300 font-bold block">수인 고유 외형:</span>
                      {selectedBeastkin === 'BIRD' ? (
                        <p className="text-[10px] text-stone-400">
                          날개 {hasWings ? `보유 (${wingColor}, ${wingDescription})` : '없음'} · 깃털: {furDescription || '없음'}
                        </p>
                      ) : (
                        <p className="text-[10px] text-stone-400">
                          귀: {earColor} {earDescription} · 꼬리: {tailColor} {tailDescription} · 털: {furDescription}
                        </p>
                      )}
                    </div>
                  )}

                  {appearance && (
                    <div className="pt-1.5 border-t border-stone-800 mt-1.5">
                      <span className="text-[10px] text-stone-500 block">추가 묘사:</span>
                      <p className="text-[11px] text-stone-300 italic">{appearance}</p>
                    </div>
                  )}
                </div>

                {/* Final Stats Grid */}
                <div className="space-y-1.5">
                  <div className="font-bold text-amber-400/90 text-[10px]">최종 능력치</div>
                  <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
                    <div className="p-1.5 bg-stone-900 rounded border border-stone-800">
                      <span className="text-[10px] text-stone-500 block">근력</span>
                      <span className="text-xs font-bold text-stone-200">{effectiveStats.strength}</span>
                    </div>
                    <div className="p-1.5 bg-stone-900 rounded border border-stone-800">
                      <span className="text-[10px] text-stone-500 block">체력</span>
                      <span className="text-xs font-bold text-stone-200">{effectiveStats.vitality}</span>
                    </div>
                    <div className="p-1.5 bg-stone-900 rounded border border-stone-800">
                      <span className="text-[10px] text-stone-500 block">민첩</span>
                      <span className="text-xs font-bold text-stone-200">{effectiveStats.agility}</span>
                    </div>
                    <div className="p-1.5 bg-stone-900 rounded border border-stone-800">
                      <span className="text-[10px] text-stone-500 block">지능</span>
                      <span className="text-xs font-bold text-stone-200">{effectiveStats.intelligence}</span>
                    </div>
                    <div className="p-1.5 bg-stone-900 rounded border border-stone-800">
                      <span className="text-[10px] text-stone-500 block">정신</span>
                      <span className="text-xs font-bold text-stone-200">{effectiveStats.spirit}</span>
                    </div>
                    <div className="p-1.5 bg-stone-900 rounded border border-stone-800">
                      <span className="text-[10px] text-stone-500 block">행운</span>
                      <span className="text-xs font-bold text-stone-200">{effectiveStats.luck}</span>
                    </div>
                  </div>
                </div>

                {/* Passives list */}
                <div className="space-y-1">
                  <div className="font-bold text-amber-400/90 text-[10px]">보유 종족 패시브</div>
                  <div className="space-y-1">
                    {currentDef.passiveIds.map((pId) => {
                      const p = PASSIVE_DEFINITIONS[pId];
                      return (
                        <div
                          key={pId}
                          className="flex items-center justify-between px-2 py-1 rounded bg-stone-900 border border-stone-800 text-[10px]"
                        >
                          <span className="font-bold text-amber-300">{p ? p.name : pId}</span>
                          <span className="text-stone-400">{p ? p.effect : ''}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Navigation */}
        <div className="flex-none p-3 border-t border-stone-800 bg-stone-950/90 flex gap-2">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 active:bg-stone-900 text-stone-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>이전 단계</span>
            </button>
          ) : (
            onCancel &&
            !isInitialGame && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 active:bg-stone-900 text-stone-400 font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                닫기
              </button>
            )
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition cursor-pointer shadow-md"
            >
              <span>다음 단계</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:from-amber-600 active:to-amber-500 text-stone-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>캐릭터 생성 완료 (모험 시작)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
