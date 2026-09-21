export function AssignmentCard({ children }) {
  return <div className="mb-3.5 rounded-[10px] border border-line p-4">{children}</div>;
}

export function AssignmentMeta({ assignment }) {
  return (
    <>
      <h3 className="mb-0.5 text-lg">{assignment.title}</h3>
      <div className="mb-2 text-sm text-muted">{assignment.due_date ? `Due ${assignment.due_date}` : "No due date"}</div>
      <div className="mb-3 whitespace-pre-wrap">{assignment.description}</div>
    </>
  );
}
