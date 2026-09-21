"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { TabNav } from "@/components/layout/TabNav";
import { ClassChatTab } from "@/components/chat/ClassChatTab";
import { MessagesTab } from "@/components/messages/MessagesTab";
import { AssignmentsTab } from "@/components/assignments/AssignmentsTab";
import { StudyBuddyTab } from "@/components/study-buddy/StudyBuddyTab";

export function AppShell({ me }) {
  const [tab, setTab] = useState("chat");

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar me={me} />
      <TabNav active={tab} onChange={setTab} />
      <main className="mx-auto w-full max-w-[820px] flex-1 p-5">
        {tab === "chat" && <ClassChatTab me={me} />}
        {tab === "messages" && <MessagesTab me={me} />}
        {tab === "assignments" && <AssignmentsTab me={me} />}
        {tab === "study" && <StudyBuddyTab me={me} />}
      </main>
    </div>
  );
}
