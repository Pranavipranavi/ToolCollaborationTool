import { Droppable, Draggable } from "react-beautiful-dnd";
import EmptyState from "../ui/EmptyState";
import TaskCard from "./TaskCard";

export default function KanbanColumn({ column, members, onOpenTask }) {
  return (
    <section className="flex min-h-[32rem] w-[19rem] shrink-0 flex-col rounded-lg border border-slate-200 bg-slate-100/70 p-3 dark:border-slate-800 dark:bg-slate-900/70">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">{column.title}</h2>
        <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">{column.tasks.length}</span>
      </div>
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-1 flex-col gap-3 rounded-lg transition ${snapshot.isDraggingOver ? "bg-blue-50/80 dark:bg-blue-950/30" : ""}`}
          >
            {column.tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(dragProvided) => (
                  <TaskCard
                    ref={dragProvided.innerRef}
                    draggableProps={dragProvided.draggableProps}
                    dragHandleProps={dragProvided.dragHandleProps}
                    task={task}
                    members={members}
                    onOpen={onOpenTask}
                  />
                )}
              </Draggable>
            ))}
            {column.tasks.length === 0 && <EmptyState title="No tasks" body="Drop work here when it reaches this stage." />}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </section>
  );
}
