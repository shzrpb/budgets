"use client";

import { useRef, useState, useTransition } from "react";
import { deleteTransaction, reorderFixedTransactions } from "@/app/actions";
import FixedSheet from "@/components/FixedSheet";
import SwipeActions from "@/components/SwipeActions";
import TransactionIcon from "@/components/TransactionIcon";
import { editDeleteActions } from "@/components/rowActions";
import type { Account, Card, Category, Transaction } from "@/lib/types";

const LONG_PRESS_MS = 300;

function keyOf(transactions: Transaction[]) {
  return transactions.map((t) => t.id).join(",");
}

export default function FixedTransactionList({
  transactions,
  categories,
  accounts,
  cards,
}: {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  cards: Card[];
}) {
  const [order, setOrder] = useState(transactions);
  const [syncedKey, setSyncedKey] = useState(() => keyOf(transactions));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragIndexRef = useRef<number | null>(null);
  const startYRef = useRef(0);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [rowPitch, setRowPitch] = useState(0);

  const currentKey = keyOf(transactions);
  if (currentKey !== syncedKey) {
    setSyncedKey(currentKey);
    setOrder(transactions);
  }

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const accountById = new Map(accounts.map((a) => [a.id, a]));
  const cardById = new Map(cards.map((c) => [c.id, c]));
  const editing = order.find((t) => t.id === editingId);

  function clearLongPress() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  /** Row pitch (height + gap) — assumes uniform row height, measured once per drag. */
  function measureRowPitch(): number {
    const rows = rowRefs.current;
    const first = rows[0]?.getBoundingClientRect();
    const second = rows[1]?.getBoundingClientRect();
    if (first && second) return second.top - first.top;
    return (first?.height ?? 72) + 8;
  }

  function handleHandlePointerDown(e: React.PointerEvent, index: number, id: string) {
    startYRef.current = e.clientY;
    const target = e.currentTarget as HTMLElement;
    longPressTimerRef.current = setTimeout(() => {
      dragIndexRef.current = index;
      setRowPitch(measureRowPitch());
      setDraggingId(id);
      setDragOffset(0);
      setHoverIndex(index);
      target.setPointerCapture(e.pointerId);
    }, LONG_PRESS_MS);
  }

  function handleHandlePointerMove(e: React.PointerEvent) {
    if (dragIndexRef.current === null) {
      if (Math.abs(e.clientY - startYRef.current) > 10) clearLongPress();
      return;
    }
    const dragIndex = dragIndexRef.current;
    const pitch = rowPitch || 72;
    const dy = e.clientY - startYRef.current;
    // Bound the drag to the list itself — it can only move as far as there
    // are rows above or below it, never past the edges of the container.
    const maxUp = dragIndex * pitch;
    const maxDown = (order.length - 1 - dragIndex) * pitch;
    const clampedDy = Math.min(maxDown, Math.max(-maxUp, dy));
    setDragOffset(clampedDy);
    const hover = Math.min(
      order.length - 1,
      Math.max(0, dragIndex + Math.round(clampedDy / pitch)),
    );
    setHoverIndex(hover);
  }

  function handleHandlePointerUp() {
    clearLongPress();
    if (dragIndexRef.current !== null) {
      const dragIndex = dragIndexRef.current;
      const targetIndex = hoverIndex ?? dragIndex;
      dragIndexRef.current = null;
      setDraggingId(null);
      setDragOffset(0);
      setHoverIndex(null);
      if (targetIndex !== dragIndex) {
        const next = [...order];
        const [moved] = next.splice(dragIndex, 1);
        next.splice(targetIndex, 0, moved);
        setOrder(next);
        startTransition(() => reorderFixedTransactions(next.map((t) => t.id)));
      }
    }
  }

  // Index of the row being dragged, derived from state (not the ref, which
  // is only for synchronous access inside event handlers) so this stays
  // valid to read during render.
  const draggingIndex = draggingId ? order.findIndex((t) => t.id === draggingId) : -1;

  return (
    <>
      <div className="flex flex-col gap-2">
        {order.map((t, index) => {
          const isDragging = draggingId === t.id;
          // Rows between the dragged item's original slot and its current
          // hover slot shift by one row pitch to open up a gap for it —
          // the underlying order only actually changes on drop.
          let shift = 0;
          if (!isDragging && draggingIndex !== -1 && hoverIndex !== null) {
            if (draggingIndex < hoverIndex && index > draggingIndex && index <= hoverIndex) shift = -1;
            else if (draggingIndex > hoverIndex && index >= hoverIndex && index < draggingIndex) shift = 1;
          }
          return (
          <div
            key={t.id}
            ref={(el) => {
              rowRefs.current[index] = el;
            }}
            className="relative"
            style={{
              transform: isDragging
                ? `translateY(${dragOffset}px)`
                : shift
                  ? `translateY(${shift * rowPitch}px)`
                  : undefined,
              zIndex: isDragging ? 10 : undefined,
              transition: isDragging ? "none" : "transform 150ms ease-out",
            }}
          >
            <SwipeActions
              actions={editDeleteActions({
                onEdit: () => setEditingId(t.id),
                onDelete: () => startTransition(() => deleteTransaction(t.id)),
              })}
            >
              <FixedRow
                transaction={t}
                category={t.category_id ? categoryById.get(t.category_id) : undefined}
                account={t.account_id ? accountById.get(t.account_id) : undefined}
                card={t.card_id ? cardById.get(t.card_id) : undefined}
                onHandlePointerDown={(e) => handleHandlePointerDown(e, index, t.id)}
                onHandlePointerMove={handleHandlePointerMove}
                onHandlePointerUp={handleHandlePointerUp}
              />
            </SwipeActions>
          </div>
          );
        })}
      </div>

      {editing && (
        <FixedSheet
          transaction={editing}
          categories={categories}
          accounts={accounts}
          cards={cards}
          onClose={() => setEditingId(null)}
        />
      )}
    </>
  );
}

export function FixedRow({
  transaction,
  category,
  account,
  card,
  onHandlePointerDown,
  onHandlePointerMove,
  onHandlePointerUp,
}: {
  transaction: Transaction;
  category?: Category;
  account?: Account;
  card?: Card;
  onHandlePointerDown?: (e: React.PointerEvent) => void;
  onHandlePointerMove?: (e: React.PointerEvent) => void;
  onHandlePointerUp?: (e: React.PointerEvent) => void;
}) {
  const tint = transaction.type === "income" ? "#7fc9b9" : category?.color ?? "#a8a29e";

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${tint}33`, color: tint }}
        >
          <TransactionIcon name={category?.name} isIncome={transaction.type === "income"} />
        </span>
        <div>
          <p className="text-sm font-medium text-stone-800">
            {transaction.type === "income" ? "Income" : category?.name ?? "Uncategorized"}
            <span className="ml-1.5 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-500">
              {transaction.recurrence}
            </span>
          </p>
          <p className="text-xs text-stone-400">
            {[account?.name, card?.name ?? transaction.payment_method].filter(Boolean).join(" · ") ||
              (transaction.note ?? undefined)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <p
          className={`text-sm font-semibold ${
            transaction.type === "income" ? "text-emerald-600" : "text-stone-900"
          }`}
        >
          {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString()}
        </p>
        {onHandlePointerDown && (
          <span
            role="button"
            aria-label="Drag to reorder"
            onPointerDown={(e) => {
              e.stopPropagation();
              onHandlePointerDown(e);
            }}
            onPointerMove={onHandlePointerMove}
            onPointerUp={onHandlePointerUp}
            onClick={(e) => e.stopPropagation()}
            className="flex h-8 w-6 shrink-0 cursor-grab touch-none items-center justify-center text-stone-300 active:cursor-grabbing"
            style={{ touchAction: "none" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="9" cy="6" r="1.5" />
              <circle cx="15" cy="6" r="1.5" />
              <circle cx="9" cy="12" r="1.5" />
              <circle cx="15" cy="12" r="1.5" />
              <circle cx="9" cy="18" r="1.5" />
              <circle cx="15" cy="18" r="1.5" />
            </svg>
          </span>
        )}
      </div>
    </div>
  );
}
