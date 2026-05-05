import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useEffect } from "react";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { useDragDropHandlers } from "@/hooks/useDragDrop";
import { useTasks } from "@/hooks/useTasks";

export function KanbanBoard() {
  const { hydrated, columns, hydrate, setColumns } = useTasks();
  const { onDragEnd } = useDragDropHandlers(columns, setColumns);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return (
      <p
        className="text-sm text-slate-500 dark:text-slate-400"
        role="status"
      >
        Загрузка доски…
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={onDragEnd}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        {columns.map((col) => (
          <KanbanColumn key={col.id} column={col} />
        ))}
      </div>
    </DndContext>
  );
}
