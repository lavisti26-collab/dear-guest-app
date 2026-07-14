import React from 'react';
import type { Sticker } from "@/lib/sticker-library";
import EmojiSticker from "./EmojiSticker";

interface StickerDisplayItemProps {
  sticker: Sticker;
  onClick: (sticker: Sticker) => void;
  selected?: boolean;
}

export default function StickerDisplayItem({
  sticker,
  onClick,
  selected = false,
}: StickerDisplayItemProps) {
  const handleClick = () => {
    onClick(sticker);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        relative flex items-center justify-center p-2 rounded-lg border-2 
        transition-all duration-200 ease-in-out 
        ${selected
          ? "border-primary bg-primary/10 scale-105 shadow-md"
          : "border-transparent hover:border-muted-foreground/30 hover:bg-muted/20"
        }
      `}
      title={sticker.name}
    >
      {sticker.type === "emoji" && (
        <EmojiSticker emoji={sticker.url} size="lg" />
      )}
      {(sticker.type === "png" || sticker.type === "svg" || sticker.type === "animated") && (
        <img
          src={sticker.url}
          alt={sticker.name}
          className="max-w-full max-h-full object-contain"
          style={{
            width: sticker.width ? `${sticker.width}px` : "80px",
            height: sticker.height ? `${sticker.height}px` : "80px",
          }}
        />
      )}
      {selected && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/20 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary-foreground"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}
    </button>
  );
}
