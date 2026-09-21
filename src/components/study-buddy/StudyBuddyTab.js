"use client";

import { StudyBuddyChat } from "@/components/study-buddy/StudyBuddyChat";
import { TeacherStudyLog } from "@/components/study-buddy/TeacherStudyLog";

export function StudyBuddyTab({ me }) {
  if (me.role === "teacher") return <TeacherStudyLog />;
  return <StudyBuddyChat me={me} />;
}
