export type TaskAssignee = {
  id: string;
  label: string;
};

export type Task = {
  id: string;
  title: string;
  subtasks: { id: string; title: string }[];
  description?: string;
  /** HEX accent for card chrome */
  color?: string;
  assignee?: TaskAssignee;
};

export type Column = {
  id: string;
  title: string;
  /** HEX `#RRGGBB` from color input */
  color?: string;
  tasks: Task[];
};
