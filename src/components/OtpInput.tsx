"use client";

import { useRef, useState } from "react";

const LENGTH = 6;

export default function OtpInput({
  onComplete,
  disabled,
}: {
  onComplete: (code: string) => void;
  disabled?: boolean;
}) {
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function setDigit(index: number, value: string) {
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handleChange(index: number, raw: string) {
    const clean = raw.replace(/[^0-9]/g, "");
    if (!clean) {
      setDigit(index, "");
      return;
    }
    const value = clean[clean.length - 1];
    setDigit(index, value);

    if (index < LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    } else {
      const code = digits.map((d, i) => (i === index ? value : d)).join("");
      if (code.length === LENGTH) onComplete(code);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) {
        setDigit(index, "");
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        setDigit(index - 1, "");
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, LENGTH);
    if (!pasted) return;

    const next = Array(LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);

    if (pasted.length === LENGTH) {
      onComplete(pasted);
      inputRefs.current[LENGTH - 1]?.focus();
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  }

  return (
    <div className="flex gap-2">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          autoFocus={i === 0}
          className="h-14 min-w-0 flex-1 rounded-2xl border border-stone-200 bg-stone-50 text-center text-2xl font-semibold outline-none focus:border-stone-400 disabled:opacity-50"
        />
      ))}
    </div>
  );
}
