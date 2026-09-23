import { CalendarDays } from "lucide-react";

export function AssignmentCard({ children }) {
  return (
    <div className="mb-3.5 animate-fade-in rounded-2xl border border-line bg-paper p-4 shadow-[0_1px_3px_rgb(0_0_0_/_4%)] transition-shadow hover:shadow-md dark:shadow-[0_1px_3px_rgb(0_0_0_/_20%)]">
      {children}
    </div>
  );
}

export function AssignmentMeta({ assignment }) {
  return (
    <>
      <h3 className="mb-0.5 text-lg">{assignment.title}</h3>
      <div className="mb-2 flex items-center gap-1.5 text-sm text-muted">
        <CalendarDays size={14} strokeWidth={2} />
        {assignment.due_date ? `Due ${assignment.due_date}` : "No due date"}
      </div>
      <div className="mb-3 whitespace-pre-wrap">{assignment.description}</div>
    </>
  );
}
