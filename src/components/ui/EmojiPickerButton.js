"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EmojiPicker } from "@/components/ui/EmojiPicker";
import { cn } from "@/lib/utils";

const PICKER_WIDTH = 288; // matches EmojiPicker's own w-72
const PICKER_HEIGHT = 320; // approx rendered height, used only to keep it on-screen
const MARGIN = 8;

/**
 * A trigger button that opens an EmojiPicker popover, used both for
 * composing a message and for adding a reaction to one. Rendered through a
 * portal straight into document.body instead of positioned inside the
 * trigger's own DOM: the chat panels this lives in scroll
 * (overflow-y-auto), which would otherwise clip an absolutely-positioned
 * popover the moment it extended past the visible scrolled area.
 */
export function EmojiPickerButton({ icon, label, onSelect, align = "left", buttonClassName }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const buttonRef = useRef(null);
  const popoverRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    function updatePosition() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;

      let top = rect.top - PICKER_HEIGHT - MARGIN;
      if (top < MARGIN) top = Math.min(rect.bottom + MARGIN, window.innerHeight - PICKER_HEIGHT - MARGIN);

      let left = align === "right" ? rect.right - PICKER_WIDTH : rect.left;
      left = Math.max(MARGIN, Math.min(left, window.innerWidth - PICKER_WIDTH - MARGIN));

      setPosition({ top, left });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    function handleClickOutside(e) {
      if (buttonRef.current?.contains(e.target) || popoverRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, align]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={label}
        aria-expanded={open}
        className={cn(
          "inline-flex items-center justify-center rounded-full text-muted transition-colors hover:bg-hover hover:text-heading",
          buttonClassName
        )}
      >
        {icon}
      </button>
      {open &&
        position &&
        createPortal(
          <div
            ref={popoverRef}
            style={{ position: "fixed", top: position.top, left: position.left }}
            className="z-50 animate-slide-up"
          >
            <EmojiPicker
              onSelect={(emoji) => {
                onSelect(emoji);
                setOpen(false);
              }}
            />
          </div>,
          document.body
        )}
    </>
  );
}
