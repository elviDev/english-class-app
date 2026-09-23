/**
 * Central registry of React Query cache keys, so every hook that reads or
 * invalidates a given resource agrees on its shape.
 */
export const queryKeys = {
  profile: (userId) => ["profile", userId],
  students: () => ["students"],
  groupMessages: () => ["group-messages"],
  groupReactions: () => ["group-reactions"],
  directMessages: (studentId) => ["direct-messages", studentId],
  directReactions: () => ["direct-reactions"],
  assignments: () => ["assignments"],
  submission: (assignmentId, studentId) => ["submission", assignmentId, studentId],
  submissions: (assignmentId) => ["submissions", assignmentId],
  studyLogs: () => ["study-logs"],
};
