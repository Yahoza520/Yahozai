# HEARTBEAT.md - Periodic Check-In Tasks

Claw's background maintenance tasks. Execute 2-3 tasks every 2-4 hours during working hours.

## Daily Checks (Every morning ~08:00)
- [ ] **Git status:** Uncommitted changes in `/home/user/Yahozai`?
- [ ] **DENK docs:** Recent updates to PRD or legal docs needing review?
- [ ] **Memory maintenance:** Significant events to promote to MEMORY.md?

## Mid-Day Checks (Every 12 hours)
- [ ] **Project progress:** Forward momentum on DENK MVP?
- [ ] **Dependencies:** Ollama/LLM model availability?
- [ ] **Workspace health:** Any errors in `.openclaw/config.json`?

## Evening Checks (~18:00 Istanbul time)
- [ ] **Pilot planning:** New venue partnerships or location data?
- [ ] **Documentation drift:** Do docs match current project status?
- [ ] **Session summary:** Write brief daily note to `memory/2026-03-DD.md`

## What Counts as "Check Complete"

✅ **Success:** Scanned relevant files → No blocking issues → HEARTBEAT_OK

⚠️ **With Issues:** Found something important → Flag in message → Don't wait for permission

## When to Reach Out (Don't just say "HEARTBEAT_OK")

- Git has uncommitted changes that look important
- A doc suggests Yahoza needs to review something
- Memory shows a decision point needing attention
- 8+ hours since last substantive message (be alive, not silent)

## When to Stay Silent (Just HEARTBEAT_OK)

- Late night (22:00-07:00) unless urgent
- Clearly in focused work session
- Nothing new found since last check
- Checked <30 minutes ago

## Proactive Work (Do This Freely)

- Commit small improvements to docs
- Organize memory files by date
- Update README if needed
- Archive old daily notes (>30 days)
- Push minor fixes to feature branch