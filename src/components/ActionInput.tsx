import { useState, FormEvent, ReactNode } from 'react';

interface ActionInputProps {
  onSendAction: (action: string) => void;
  isLoading: boolean;
  isGameOver?: boolean;
  characterMenu?: ReactNode;
}

export function ActionInput({
  onSendAction,
  isLoading,
  isGameOver = false,
  characterMenu,
}: ActionInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isGameOver) return;
    onSendAction(input.trim());
    setInput('');
  };

  return (
    <footer className="flex-none shrink-0 w-full bg-stone-900 border-t border-stone-800 p-2.5 sm:p-3 z-20">
      <div className="w-full max-w-2xl mx-auto space-y-2">
        {/* 행동 입력창 바로 위쪽, 화면 왼쪽 독립 캐릭터 메뉴 배치 슬롯 */}
        {characterMenu && (
          <div className="flex items-center justify-start">
            {characterMenu}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <input
              id="player-action-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isGameOver
                  ? '게임 오버: 상태가 소진되어 행동할 수 없습니다. 새 게임을 시작해 주세요.'
                  : '행동을 자유롭게 입력하세요...'
              }
              disabled={isLoading || isGameOver}
              className="w-full min-h-[46px] bg-stone-950 border border-stone-700 focus:border-amber-500 rounded-lg px-3.5 py-2 text-sm text-stone-100 placeholder-stone-500 outline-none transition-colors disabled:opacity-50"
              autoFocus={!isGameOver}
              autoComplete="off"
            />
          </div>

          <button
            id="send-action-button"
            type="submit"
            disabled={!input.trim() || isLoading || isGameOver}
            className="min-h-[46px] min-w-[68px] shrink-0 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold px-3.5 py-2 rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            행동
          </button>
        </form>
      </div>
    </footer>
  );
}
