"use client";
import { useEffect, useRef, useState } from "react";
import { supabase, isConfigured } from "../lib/supabaseClient";

function fmtTime(iso) {
  return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function Page() {
  const [session, setSession] = useState(null);
  const [me, setMe] = useState(null); // { id, name, role }
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (!isConfigured) return;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) { setMe(null); return; }
    setLoadingProfile(true);
    supabase.from("profiles").select("*").eq("id", session.user.id).single().then(({ data, error }) => {
      setLoadingProfile(false);
      if (!error && data) setMe({ id: data.id, name: data.name, role: data.role });
    });
  }, [session]);

  if (!isConfigured) {
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="config-warning" style={{ borderRadius: 8, marginBottom: 16 }}>
            Not connected yet — add your Supabase and Gemini keys to .env.local. See SETUP.md.
          </div>
        </div>
      </div>
    );
  }

  if (!session) return <AuthScreen />;
  if (loadingProfile || !me) return <div className="auth-wrap"><p className="empty-note">Loading your account…</p></div>;

  return <AppShell me={me} />;
}

// ================= AUTH =================
function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [name, setName] = useState(""), [email, setEmail] = useState(""), [password, setPassword] = useState("");
  const [isTeacher, setIsTeacher] = useState(false), [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleLogin(e) {
    e.preventDefault(); setError(""); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setError(error.message);
  }

  async function handleSignup(e) {
    e.preventDefault(); setError("");
    setBusy(true);
    // The profile row is created automatically by a database trigger the
    // instant the account exists (see schema.sql) — this works even
    // before email confirmation, when the browser has no permission yet
    // to write anything as this new user. We just pass the name along so
    // the trigger can use it.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) { setBusy(false); setError(error.message); return; }
    if (!data.user) { setBusy(false); setError("Something went wrong creating your account. Please try again."); return; }

    if (!data.session) {
      // Email confirmation is required before a session exists.
      setBusy(false);
      if (isTeacher) {
        setError("Account created — check your email, click the confirmation link, then log in and use the \"I'm the teacher\" button at the top of the app to finish setup.");
      } else {
        setError("Account created — check your email and click the confirmation link, then log in.");
      }
      return;
    }

    if (isTeacher) {
      const token = data.session.access_token;
      try {
        const res = await fetch("/api/claim-teacher", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ code }),
        });
        const result = await res.json();
        if (!res.ok) { setBusy(false); setError(result.error || "Couldn't verify the teacher code."); return; }
      } catch {
        setBusy(false); setError("Couldn't reach the server to verify the teacher code.");
        return;
      }
      window.location.reload();
      return;
    }
    setBusy(false);
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>English Class</h1>
        <p className="auth-sub">{mode === "login" ? "Sign in to join your class." : "Create your account to join the class."}</p>
        {error && <div className="error-msg">{error}</div>}

        {mode === "login" ? (
          <form onSubmit={handleLogin}>
            <div className="field"><label>Email</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div className="field"><label>Password</label><input type="password" required value={password} onChange={e => setPassword(e.target.value)} /></div>
            <button className="btn-primary" disabled={busy} type="submit">Log in</button>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <div className="field"><label>Your name</label><input type="text" required value={name} onChange={e => setName(e.target.value)} /></div>
            <div className="field"><label>Email</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div className="field"><label>Password (at least 8 characters)</label><input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} /></div>
            <label className="teacher-toggle"><input type="checkbox" checked={isTeacher} onChange={e => setIsTeacher(e.target.checked)} /> I'm the teacher</label>
            {isTeacher && (
              <div className="field"><label>Teacher setup code</label><input type="password" autoComplete="off" value={code} onChange={e => setCode(e.target.value)} /></div>
            )}
            <button className="btn-primary" disabled={busy} type="submit">Create account</button>
          </form>
        )}

        <div className="auth-switch">
          {mode === "login"
            ? <>New here? <button className="link-btn" onClick={() => { setMode("signup"); setError(""); }}>Create an account</button></>
            : <>Already have an account? <button className="link-btn" onClick={() => { setMode("login"); setError(""); }}>Log in</button></>}
        </div>
      </div>
    </div>
  );
}

// ================= APP SHELL =================
function AppShell({ me }) {
  const [tab, setTab] = useState("chat");
  const [showClaim, setShowClaim] = useState(false);
  const tabs = [
    ["chat", "Class chat"],
    ["messages", "Messages"],
    ["assignments", "Assignments"],
    ["study", "Study Buddy"],
  ];
  return (
    <div className="app-shell">
      <header className="topbar">
        <span className="brand">English Class</span>
        <span className="who">
          <span>{me.name}</span>
          <span className="role-badge">{me.role === "teacher" ? "Teacher" : "Student"}</span>
          {me.role === "student" && (
            <button onClick={() => setShowClaim(true)} style={{ borderStyle: "dashed" }}>I'm the teacher</button>
          )}
          <button onClick={() => supabase.auth.signOut()}>Log out</button>
        </span>
      </header>
      {showClaim && <ClaimTeacherBar onClose={() => setShowClaim(false)} />}
      <nav className="tabs">
        {tabs.map(([key, label]) => (
          <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>{label}</button>
        ))}
      </nav>
      <main className="content">
        {tab === "chat" && <ChatTab me={me} />}
        {tab === "messages" && <MessagesTab me={me} />}
        {tab === "assignments" && <AssignmentsTab me={me} />}
        {tab === "study" && <StudyBuddyTab me={me} />}
      </main>
    </div>
  );
}

function ClaimTeacherBar({ onClose }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError("");
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) { setBusy(false); setError("Couldn't verify your session — try logging out and back in."); return; }
    try {
      const res = await fetch("/api/claim-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code }),
      });
      const result = await res.json();
      if (!res.ok) { setBusy(false); setError(result.error || "Couldn't verify that code."); return; }
      window.location.reload();
    } catch {
      setBusy(false); setError("Couldn't reach the server. Check your connection and try again.");
    }
  }

  return (
    <div className="panel" style={{ margin: "0 20px", maxWidth: 780, marginLeft: "auto", marginRight: "auto" }}>
      <form onSubmit={submit} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <strong style={{ color: "var(--navy)" }}>Teacher setup code:</strong>
        <input type="password" autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)} style={{ flex: "1 1 200px", padding: 8, border: "1.5px solid var(--line)", borderRadius: 8 }} autoFocus />
        <button className="btn-primary" style={{ width: "auto", padding: "8px 16px" }} disabled={busy} type="submit">Confirm</button>
        <button type="button" className="link-btn" onClick={onClose}>Cancel</button>
      </form>
      {error && <div className="error-msg" style={{ marginTop: 10 }}>{error}</div>}
    </div>
  );
}

function Bubble({ mine, name, text, time, variant }) {
  const cls = variant === "ai" ? "bubble-ai" : mine ? "bubble-mine" : "bubble-theirs";
  return (
    <div className={"bubble " + cls}>
      <div className="meta">{mine ? "You" : name}{time ? " · " + fmtTime(time) : ""}</div>
      {text}
    </div>
  );
}

function useAutoScroll(deps) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, deps);
  return ref;
}

// ================= CLASS CHAT =================
function ChatTab({ me }) {
  const [messages, setMessages] = useState(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const scrollRef = useAutoScroll([messages]);

  useEffect(() => {
    let active = true;
    supabase.from("group_messages").select("*").order("created_at", { ascending: true }).limit(200)
      .then(({ data }) => { if (active) setMessages(data || []); });
    const channel = supabase.channel("group-chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "group_messages" }, (payload) => {
        setMessages((prev) => (prev ? [...prev, payload.new] : [payload.new]));
      }).subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, []);

  async function send(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    setError("");
    const { error } = await supabase.from("group_messages").insert({ sender_id: me.id, sender_name: me.name, text });
    if (error) { setInput(text); setError("Couldn't send that message. Try again."); }
  }

  return (
    <div className="panel">
      <h2>Class chat</h2>
      <div className="chat-scroll" ref={scrollRef}>
        {messages === null && <p className="empty-note">Loading…</p>}
        {messages?.length === 0 && <p className="empty-note">No messages yet — say hello!</p>}
        {messages?.map((m) => (
          <Bubble key={m.id} mine={m.sender_id === me.id} name={m.sender_name} text={m.text} time={m.created_at} />
        ))}
      </div>
      {error && <div className="error-msg" style={{ marginTop: 10 }}>{error}</div>}
      <form className="chat-input-row" onSubmit={send}>
        <input placeholder="Write a message…" value={input} onChange={(e) => setInput(e.target.value)} required />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

// ================= MESSAGES =================
function MessagesTab({ me }) {
  const [openStudent, setOpenStudent] = useState(null); // { id, name }

  if (me.role === "student") return <Thread me={me} studentId={me.id} label="Message your teacher" />;
  if (openStudent) return <Thread me={me} studentId={openStudent.id} label={"Chat with " + openStudent.name} onBack={() => setOpenStudent(null)} />;
  return <StudentList onOpen={setOpenStudent} />;
}

function StudentList({ onOpen }) {
  const [students, setStudents] = useState(null);
  useEffect(() => {
    supabase.from("profiles").select("id,name").eq("role", "student").order("name").then(({ data }) => setStudents(data || []));
  }, []);
  return (
    <div className="panel">
      <h2>Messages</h2>
      <div className="student-list">
        {students === null && <p className="empty-note">Loading…</p>}
        {students?.length === 0 && <p className="empty-note">No students have joined yet.</p>}
        {students?.map((s) => (
          <div className="student-row" key={s.id}>
            <span>{s.name}</span>
            <button onClick={() => onOpen(s)}>Open chat</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Thread({ me, studentId, label, onBack }) {
  const [messages, setMessages] = useState(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const scrollRef = useAutoScroll([messages]);

  useEffect(() => {
    let active = true;
    supabase.from("direct_messages").select("*").eq("student_id", studentId).order("created_at", { ascending: true }).limit(200)
      .then(({ data }) => { if (active) setMessages(data || []); });
    const channel = supabase.channel("dm-" + studentId)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages", filter: `student_id=eq.${studentId}` }, (payload) => {
        setMessages((prev) => (prev ? [...prev, payload.new] : [payload.new]));
      }).subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, [studentId]);

  async function send(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    setError("");
    const { error } = await supabase.from("direct_messages").insert({ student_id: studentId, sender_id: me.id, sender_name: me.name, text });
    if (error) { setInput(text); setError("Couldn't send that message. Try again."); }
  }

  return (
    <div className="panel">
      {onBack && <button className="back-link" onClick={onBack}>&larr; All students</button>}
      <h2>{label}</h2>
      <div className="chat-scroll" ref={scrollRef}>
        {messages === null && <p className="empty-note">Loading…</p>}
        {messages?.length === 0 && <p className="empty-note">No messages yet.</p>}
        {messages?.map((m) => (
          <Bubble key={m.id} mine={m.sender_id === me.id} name={m.sender_name} text={m.text} time={m.created_at} />
        ))}
      </div>
      {error && <div className="error-msg" style={{ marginTop: 10 }}>{error}</div>}
      <form className="chat-input-row" onSubmit={send}>
        <input placeholder="Write a private message…" value={input} onChange={(e) => setInput(e.target.value)} required />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

// ================= ASSIGNMENTS =================
function AssignmentsTab({ me }) {
  const [assignments, setAssignments] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const reload = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    supabase.from("assignments").select("*").order("created_at", { ascending: false }).then(({ data }) => setAssignments(data || []));
  }, [refreshKey]);

  return (
    <div>
      {me.role === "teacher" && <NewAssignmentForm meId={me.id} onCreated={reload} />}
      {assignments === null && <p className="empty-note">Loading…</p>}
      {assignments?.length === 0 && <p className="empty-note">No assignments posted yet.</p>}
      {assignments?.map((a) =>
        me.role === "teacher"
          ? <TeacherAssignmentCard key={a.id} assignment={a} />
          : <StudentAssignmentCard key={a.id} assignment={a} me={me} onChanged={reload} />
      )}
    </div>
  );
}

function NewAssignmentForm({ meId, onCreated }) {
  const [title, setTitle] = useState(""), [desc, setDesc] = useState(""), [due, setDue] = useState("");
  const [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;
    setError("");
    const { error } = await supabase.from("assignments").insert({ title: title.trim(), description: desc.trim(), due_date: due || null, created_by: meId });
    if (error) { setError("Couldn't post that assignment. Try again."); return; }
    setTitle(""); setDesc(""); setDue(""); onCreated();
  }
  return (
    <div className="panel">
      <h2>Post a new assignment</h2>
      <form onSubmit={submit}>
        <div className="field"><label>Title</label><input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
        <div className="field"><label>Instructions</label><textarea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} required /></div>
        <div className="field"><label>Due date (optional)</label><input type="date" value={due} onChange={(e) => setDue(e.target.value)} /></div>
        {error && <div className="error-msg" style={{ marginTop: 10 }}>{error}</div>}
        <button className="btn-primary" style={{ width: "auto", padding: "10px 20px" }} type="submit">Post assignment</button>
      </form>
    </div>
  );
}

function StudentAssignmentCard({ assignment, me, onChanged }) {
  const [sub, setSub] = useState(undefined); // undefined = loading, null = none
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    supabase.from("submissions").select("*").eq("assignment_id", assignment.id).eq("student_id", me.id).maybeSingle()
      .then(({ data }) => { if (active) { setSub(data || null); setContent(data?.content || ""); } });
    // The submissions table is realtime-enabled so a grade the teacher posts
    // while this is open (e.g. the "graded" flip) shows up without a reload.
    const channel = supabase.channel("submission-" + assignment.id + "-" + me.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "submissions", filter: `assignment_id=eq.${assignment.id}` }, (payload) => {
        if (payload.eventType === "DELETE" || payload.new.student_id !== me.id) return;
        setSub(payload.new);
      }).subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, [assignment.id, me.id]);

  async function submit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setError("");
    const { error } = sub
      ? await supabase.from("submissions").update({ content: content.trim(), submitted_at: new Date().toISOString() }).eq("id", sub.id)
      : await supabase.from("submissions").insert({ assignment_id: assignment.id, student_id: me.id, student_name: me.name, content: content.trim() });
    if (error) { setError("Couldn't submit that. Try again."); return; }
    onChanged();
  }

  return (
    <div className="assignment-card">
      <h3>{assignment.title}</h3>
      <div className="due">{assignment.due_date ? "Due " + assignment.due_date : "No due date"}</div>
      <div className="assignment-desc">{assignment.description}</div>
      {sub === undefined && <p className="empty-note">Loading…</p>}
      {sub && sub.grade ? (
        <div className="submission-box">
          <span className="grade-pill">Grade: {sub.grade}</span>
          <div><strong>Your submission:</strong> {sub.content}</div>
          {sub.feedback && <div style={{ marginTop: 6 }}><strong>Feedback:</strong> {sub.feedback}</div>}
        </div>
      ) : sub ? (
        <div className="submission-box">
          <span className="grade-pill pending">Submitted — awaiting grade</span>
          <div><strong>Your submission:</strong> {sub.content}</div>
          {error && <div className="error-msg" style={{ marginTop: 6 }}>{error}</div>}
          <form className="grade-form" onSubmit={submit}>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} />
            <button type="submit">Update</button>
          </form>
        </div>
      ) : sub === null ? (
        <>
          {error && <div className="error-msg" style={{ marginTop: 6 }}>{error}</div>}
          <form className="grade-form" onSubmit={submit}>
            <textarea placeholder="Write or paste your answer here…" value={content} onChange={(e) => setContent(e.target.value)} required />
            <button type="submit">Submit</button>
          </form>
        </>
      ) : null}
    </div>
  );
}

function TeacherAssignmentCard({ assignment }) {
  const [subs, setSubs] = useState(null);
  useEffect(() => {
    let active = true;
    supabase.from("submissions").select("*").eq("assignment_id", assignment.id).order("submitted_at", { ascending: true })
      .then(({ data }) => { if (active) setSubs(data || []); });
    // Realtime so a new (or edited, pre-grade) submission shows up here
    // without the teacher having to reopen the assignment.
    const channel = supabase.channel("submissions-" + assignment.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "submissions", filter: `assignment_id=eq.${assignment.id}` }, (payload) => {
        if (payload.eventType === "DELETE") return;
        setSubs((prev) => {
          const list = prev || [];
          const idx = list.findIndex((s) => s.id === payload.new.id);
          if (idx === -1) return [...list, payload.new];
          const next = [...list];
          next[idx] = payload.new;
          return next;
        });
      }).subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, [assignment.id]);

  async function saveGrade(subId, grade, feedback) {
    const { error } = await supabase.from("submissions").update({ grade, feedback, graded_at: new Date().toISOString() }).eq("id", subId);
    return error;
  }

  const count = subs ? subs.length : 0;
  return (
    <div className="assignment-card">
      <h3>{assignment.title}</h3>
      <div className="due">{assignment.due_date ? "Due " + assignment.due_date : "No due date"}</div>
      <div className="assignment-desc">{assignment.description}</div>
      <details className="sub-details">
        <summary>{count} submission{count === 1 ? "" : "s"}</summary>
        {count === 0 && <p className="empty-note" style={{ padding: "10px 0" }}>No submissions yet.</p>}
        {subs?.map((s) => <SubmissionRow key={s.id} sub={s} onSave={saveGrade} />)}
      </details>
    </div>
  );
}

function SubmissionRow({ sub, onSave }) {
  const [grade, setGrade] = useState(sub.grade || "");
  const [feedback, setFeedback] = useState(sub.feedback || "");
  const [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    setError("");
    const error = await onSave(sub.id, grade, feedback);
    if (error) setError("Couldn't save that grade. Try again.");
  }
  return (
    <div className="sub-row">
      <strong>{sub.student_name}</strong> <small className="muted">· {fmtTime(sub.submitted_at)}</small>
      <div style={{ margin: "6px 0" }}>{sub.content}</div>
      {error && <div className="error-msg" style={{ marginBottom: 6 }}>{error}</div>}
      <form className="grade-form" onSubmit={submit}>
        <input placeholder="Grade" value={grade} onChange={(e) => setGrade(e.target.value)} />
        <textarea placeholder="Feedback (optional)" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
        <button type="submit">Save grade</button>
      </form>
    </div>
  );
}

// ================= STUDY BUDDY (AI) =================
function StudyBuddyTab({ me }) {
  if (me.role === "teacher") return <TeacherStudyLog />;
  return <StudyBuddyChat me={me} />;
}

function StudyBuddyChat({ me }) {
  const [turns, setTurns] = useState([]); // { role: 'user'|'ai', text }
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useAutoScroll([turns, busy]);

  async function send(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setError("");
    setInput("");
    const nextTurns = [...turns, { role: "user", text }];
    setTurns(nextTurns);
    setBusy(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const res = await fetch("/api/study-buddy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: text, history: turns }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setTurns((prev) => [...prev, { role: "ai", text: data.reply }]);
      }
    } catch {
      setError("Couldn't reach Study Buddy. Check your connection and try again.");
    }
    setBusy(false);
  }

  return (
    <div className="panel">
      <h2>Study Buddy</h2>
      <p className="study-intro">Ask about grammar, vocabulary, or practice a short conversation in English — in English, in Spanish, or a mix of both. Study Buddy understands Spanish and will help you find the English words. It's an AI, so it can make mistakes — bring good questions back to class too.</p>
      <div className="chat-scroll" ref={scrollRef}>
        {turns.length === 0 && <p className="empty-note">Try: "¿Cómo se dice 'llevo dos años estudiando inglés'?"</p>}
        {turns.map((t, i) => (
          <Bubble key={i} mine={t.role === "user"} name={t.role === "user" ? me.name : "Study Buddy"} text={t.text} variant={t.role === "ai" ? "ai" : undefined} />
        ))}
        {busy && <p className="typing-note">Study Buddy is thinking…</p>}
      </div>
      {error && <div className="error-msg" style={{ marginTop: 10 }}>{error}</div>}
      <form className="chat-input-row" onSubmit={send}>
        <input placeholder="Ask in English or Spanish…" value={input} onChange={(e) => setInput(e.target.value)} required disabled={busy} />
        <button type="submit" disabled={busy}>Send</button>
      </form>
    </div>
  );
}

function TeacherStudyLog() {
  const [logs, setLogs] = useState(null);
  useEffect(() => {
    supabase.from("study_buddy_logs").select("*").order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => setLogs(data || []));
  }, []);
  return (
    <div className="panel">
      <h2>Study Buddy activity</h2>
      <p className="study-intro">What students have been asking their AI study buddy — useful for spotting what to cover in class. Read-only.</p>
      {logs === null && <p className="empty-note">Loading…</p>}
      {logs?.length === 0 && <p className="empty-note">No questions asked yet.</p>}
      {logs?.map((l) => (
        <div className="log-row" key={l.id}>
          <div className="log-q">{l.student_name}: {l.question}</div>
          <div className="log-a">{l.answer}</div>
          <small className="muted">{fmtTime(l.created_at)}</small>
        </div>
      ))}
    </div>
  );
}
