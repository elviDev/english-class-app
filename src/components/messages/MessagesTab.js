"use client";

import { useState } from "react";
import { StudentList } from "@/components/messages/StudentList";
import { DirectMessageThread } from "@/components/messages/DirectMessageThread";

export function MessagesTab({ me }) {
  const [openStudent, setOpenStudent] = useState(null); // { id, name }

  if (me.role === "student") {
    return <DirectMessageThread me={me} studentId={me.id} label="Message your teacher" />;
  }
  if (openStudent) {
    return (
      <DirectMessageThread
        me={me}
        studentId={openStudent.id}
        label={`Chat with ${openStudent.name}`}
        onBack={() => setOpenStudent(null)}
      />
    );
  }
  return <StudentList onOpen={setOpenStudent} />;
}
