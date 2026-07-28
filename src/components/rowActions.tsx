import type { SwipeAction } from "@/components/SwipeActions";
import { PencilIcon, TrashIcon } from "@/components/icons";

/**
 * The one place edit/delete row actions are defined, so every swipeable row in
 * the app reveals the same pencil + bin in the same order with the same colours.
 */
export function editDeleteActions({
  onEdit,
  onDelete,
  editLabel = "Edit",
  deleteLabel = "Delete",
}: {
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: string;
  deleteLabel?: string;
}): SwipeAction[] {
  return [
    {
      label: editLabel,
      className: "bg-stone-100 text-stone-500",
      onClick: onEdit,
      icon: <PencilIcon />,
    },
    {
      label: deleteLabel,
      className: "bg-red-100 text-red-500",
      onClick: onDelete,
      confirmLabel: "Delete?",
      icon: <TrashIcon />,
    },
  ];
}
