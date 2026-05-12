import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/buttons/Button";
import { AiChatPanel } from "@/components/chat/AiChatPanel";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { ColumnModal } from "@/components/modals/ColumnModal";
import { CreateTaskModal } from "@/components/modals/CreateTaskModal";
import {
  resolveColumnIdForOver,
  useDragDropHandlers,
} from "@/hooks/useDragDrop";
import { useTasks } from "@/hooks/useTasks";
import { useAuthStore } from "@/store/authStore";
import { useBoardsStore } from "@/store/boardsStore";
import { useUiStore } from "@/store/uiStore";
import type { Column, Task } from "@/types/task";

type ColumnModalState =
  | { open: false }
  | {
      open: true;
      mode: "create" | "edit";
      columnId?: string;
      initialTitle?: string;
      initialColor?: string;
    };

export function KanbanBoard() {
  const locale = useUiStore((s) => s.locale);
  const user = useAuthStore((s) => s.user);
  const activeBoardId = useBoardsStore((s) => s.activeBoardId);
  const boards = useBoardsStore((s) => s.boards);
  const remoteBoardId = useMemo(
    () => (user && activeBoardId ? activeBoardId : null),
    [user, activeBoardId],
  );

  const activeBoardOwnerId = useMemo(
    () =>
      remoteBoardId ?
        boards.find((b) => b.id === remoteBoardId)?.user_id ?? null
      : null,
    [boards, remoteBoardId],
  );

  const { hydrated, columns, hydrate, hydrateError, setColumns } = useTasks();
  const [columnModal, setColumnModal] = useState<ColumnModalState>({
    open: false,
  });
  const [taskModal, setTaskModal] = useState<
    | { kind: "closed" }
    | { kind: "create"; columnId: string }
    | { kind: "edit"; columnId: string; task: Task }
  >({ kind: "closed" });
  const [activeDragTask, setActiveDragTask] = useState<Task | null>(null);
  const [overTargetId, setOverTargetId] = useState<string | null>(null);
  const {
    onDragStart: commitDragStart,
    onDragCancel: commitDragCancel,
    onDragEnd: commitDragEnd,
  } = useDragDropHandlers(columns, setColumns, {
    onActiveTaskChange: setActiveDragTask,
  });

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setOverTargetId(null);
    commitDragStart(event);
  }, [commitDragStart]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverTargetId(
      event.over?.id != null ? String(event.over.id) : null,
    );
  }, []);

  const handleDragCancel = useCallback(() => {
    setOverTargetId(null);
    commitDragCancel();
  }, [commitDragCancel]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setOverTargetId(null);
      commitDragEnd(event);
    },
    [commitDragEnd],
  );

  const highlightColumnId = useMemo(
    () => resolveColumnIdForOver(columns, overTargetId),
    [columns, overTargetId],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    void hydrate(remoteBoardId);
  }, [hydrate, remoteBoardId]);

  const openEditTask = useCallback((columnId: string, task: Task) => {
    setTaskModal({ kind: "edit", columnId, task });
  }, []);

  if (!hydrated) {
    return (
      <p
        className="text-sm text-fg-subtle dark:text-slate-400"
        role="status"
      >
        Загрузка доски…
      </p>
    );
  }

  const loadErrorLabel =
    locale === "ru"
      ? `Не удалось загрузить доску: ${hydrateError}`
      : `Could not load board: ${hydrateError}`;

  function openCreateColumn() {
    setColumnModal({ open: true, mode: "create" });
  }

  function openEditColumn(col: Column) {
    setColumnModal({
      open: true,
      mode: "edit",
      columnId: col.id,
      initialTitle: col.title,
      initialColor: col.color,
    });
  }

  function closeColumnModal() {
    setColumnModal({ open: false });
  }

  function openCreateTask(col: Column) {
    setTaskModal({ kind: "create", columnId: col.id });
  }

  function closeTaskModal() {
    setTaskModal({ kind: "closed" });
  }

  const addColumnLabel =
    locale === "ru" ? "Добавить колонку" : "Add column";

  return (
    <Fragment>
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-3">
        {hydrateError ? (
          <p
            className="alert-error"
            role="alert"
          >
            {loadErrorLabel}
          </p>
        ) : null}
        <div className="flex justify-end md:justify-start">
          <Button
            type="button"
            variant="outline"
            className="text-sm"
            onClick={openCreateColumn}
            disabled={Boolean(hydrateError)}
          >
            {addColumnLabel}
          </Button>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          {!hydrateError &&
            columns.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                isDropTargetColumn={highlightColumnId === col.id}
                onEditColumn={openEditColumn}
                onCreateTask={openCreateTask}
                onEditTask={openEditTask}
              />
            ))}
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDragTask ?
          <TaskDragOverlayPreview task={activeDragTask} />
        : null}
      </DragOverlay>

      <ColumnModal
        open={columnModal.open}
        onClose={closeColumnModal}
        mode={columnModal.open ? columnModal.mode : "create"}
        columnId={columnModal.open ? columnModal.columnId : undefined}
        initialTitle={columnModal.open ? columnModal.initialTitle : undefined}
        initialColor={columnModal.open ? columnModal.initialColor : undefined}
      />

      <CreateTaskModal
        open={taskModal.kind !== "closed"}
        onClose={closeTaskModal}
        mode={taskModal.kind === "edit" ? "edit" : "create"}
        columnId={
          taskModal.kind === "closed" ? null : taskModal.columnId
        }
        taskId={taskModal.kind === "edit" ? taskModal.task.id : null}
        initialTitle={
          taskModal.kind === "edit" ? taskModal.task.title : undefined
        }
        initialDescription={
          taskModal.kind === "edit" ? taskModal.task.description : undefined
        }
        initialColor={
          taskModal.kind === "edit" ? taskModal.task.color : undefined
        }
        initialAssignee={
          taskModal.kind === "edit"
            ? taskModal.task.assignee ?? null
            : undefined
        }
        participantBoardId={remoteBoardId}
        boardOwnerUserId={activeBoardOwnerId}
      />
    </DndContext>
    <AiChatPanel />
    </Fragment>
  );
}

function TaskDragOverlayPreview({ task }: { task: Task }) {
  const accent = task.color;
  const accentChrome =
    accent != null && accent !== ""
      ? {
          borderLeftWidth: 4,
          borderLeftColor: accent,
          boxShadow: `inset 0 0 0 9999px color-mix(in srgb, ${accent} 10%, transparent)`,
        }
      : {};

  return (
    <div
      style={{ ...accentChrome }}
      className={[
        "pointer-events-none w-[260px] max-w-[min(260px,calc(100vw-2rem))] cursor-grabbing rounded-xl border p-3 surface-drag-preview",
      ].join(" ")}
    >
      <p className="text-sm font-medium text-fg dark:text-slate-100">
        {task.title}
      </p>
      {task.assignee ?
        <div className="mt-2">
          <span className="badge-muted">
            {task.assignee.label}
          </span>
        </div>
      : null}
    </div>
  );
}
