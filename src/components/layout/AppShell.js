"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { ClaimTeacherBar } from "@/components/auth/ClaimTeacherBar";
import { ClassChatTab } from "@/components/chat/ClassChatTab";
import { MessagesTab } from "@/components/messages/MessagesTab";
import { AssignmentsTab } from "@/components/assignments/AssignmentsTab";
import { StudyBuddyTab } from "@/components/study-buddy/StudyBuddyTab";

export function AppShell({ me }) {
  const [tab, setTab] = useState("chat");
  const [showClaim, setShowClaim] = useState(false);

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar me={me} active={tab} onChange={setTab} onClaimTeacher={() => setShowClaim(true)} />
      <div className="flex min-h-screen flex-1 flex-col">
        <MobileHeader me={me} onClaimTeacher={() => setShowClaim(true)} />
        <main className="mx-auto w-full max-w-[820px] flex-1 p-5 pb-24 md:pb-5">
          {showClaim && <ClaimTeacherBar onClose={() => setShowClaim(false)} />}
          <div key={tab} className="animate-slide-up">
            {tab === "chat" && <ClassChatTab me={me} />}
            {tab === "messages" && <MessagesTab me={me} />}
            {tab === "assignments" && <AssignmentsTab me={me} />}
            {tab === "study" && <StudyBuddyTab me={me} />}
          </div>
        </main>
        <BottomNav active={tab} onChange={setTab} />
      </div>
    </div>
  );
}
