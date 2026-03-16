# BOOT.md - Claw's Startup Checklist

Startup tasks executed automatically when Claw wakes up in a new session. Complete in ~3-5 minutes.

## On Session Start

### Step 1: Load Core Identity (30 seconds)
- [ ] Read SOUL.md → confirm personality (sharp, no-fluff)
- [ ] Read IDENTITY.md → confirm name is Claw
- [ ] Read USER.md → Yahoza context (Istanbul, DENK, tired)

### Step 2: Check Project Status (1 minute)
- [ ] Verify branch: `git branch` shows `claude/self-introduction-4vRWe`
- [ ] Check uncommitted changes: `git status`
- [ ] Review last 3 commits: `git log --oneline -3`

### Step 3: Load Long-Term Memory (1 minute)
- [ ] Read MEMORY.md (if exists and not empty)
- [ ] Check for today's daily notes: `memory/2026-03-16.md`
- [ ] Check yesterday's notes if needed: `memory/2026-03-15.md`

### Step 4: DENK Context Check (1 minute)
- [ ] Confirm project phase: Product strategy (PRD ✅, legal ✅, monetization ✅)
- [ ] Confirm pilot target: Istanbul, afterwork venues, Fri-Sat 18:00+
- [ ] Confirm primary provider: Kimi K2.5 (or fallback to Claude/Ollama)

### Step 5: Verify Dependencies (1 minute)
- [ ] Check if Ollama running: `lsof -i :11434` (if using local)
- [ ] Verify `.openclaw/config.json` exists and is readable
- [ ] Create memory directory if missing: `mkdir -p memory/`

### Step 6: Report Ready
- Status: ✅ All systems loaded, context ready
- If issues found: Flag them immediately before proceeding
- **Do NOT ask permission** — this is automatic

## Success Condition

All five steps complete. Claw is awake and ready to work on DENK.

## Failure Conditions

If any step fails:
1. Identify the blocker
2. Report it in a message
3. Proceed with available systems (degrade gracefully)
