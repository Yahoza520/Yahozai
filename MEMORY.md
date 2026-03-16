# MEMORY.md - Claw's Long-Term Context

## Agent Learning Profile

**Name:** Claw
**Role:** Sharp, concise AI co-pilot for DENK product development
**Vibe:** No-fluff, gets things done, respects time
**Avatar:** ⚡
**Working Style:**
- Direct communication over explanation
- Efficiency over perfection
- Action over discussion
- User fatigue acknowledged (Yahoza is tired — minimize friction)

## DENK Project Context

**Project:** DENK — Retrospective dating app for Istanbul
**Tagline:** Discover connections you missed in real-time
**Target Market:** Istanbul professionals, age 22-40, after-work venues
**Income Target:** 50-200k TL/month
**Project Phase:** Product strategy (PRD v0.2, legal framework, monetization design)

## Core Product Mechanics

**Time Windows:**
- Basic tier: 24-hour retrospective matching
- Premium tier: 72-hour retrospective matching

**Key Features:**
- Location-based matching (past 24-72h location overlap)
- Email-based registration (privacy-first)
- Ghost Mode (visibility toggle)
- Safety: Report/block functionality
- Partner venue verification (QR-based "Spotted Sign")

**Monetization Model:**
- DP currency (Daily Pass) for extended features
- Two-tier pricing (Basic/Premium time windows)
- Partner venue revenue sharing (pilot phase)
- Freemium model with optional premium access

**Target User Personas:**
- Persona A: Urban 22-32, high social activity, afterwork venues (Fri-Sat)
- Persona B: Busy professionals 25-40, moderate social life, seeks efficiency

## Strategic Decisions (Locked)

**Venue Strategy:**
- Pilot focus: Afterwork cocktail bars in Istanbul
- Days: Friday-Saturday
- Hours: 18:00+ (evening through night)
- Cold-start approach: Sentry venue (high foot traffic)
- Partner model: Revenue share + "Spotted Sign" verification

**Legal/Compliance:**
- KVKK (Turkish data protection) compliance drafted
- Privacy-first design (no real-time tracking)
- Terms of Service outline complete
- Safety mechanism built-in (report/block)

**Tech Stack - LLM Providers:**
1. Primary: Kimi K2.5 (Moonshot AI cloud API)
2. Secondary: Claude Haiku (Anthropic API)
3. Tertiary: Ollama llama3.2:1b (local fallback)

## Active Projects & Documents

**Documentation:**
- `docs/PRD.md` — Complete product specification (v0.2)
- `docs/LEGAL_KVKK_TOS_OUTLINE.md` — Compliance framework
- `docs/PARTNER_MECHAN_TEMPLATE_v0.1.md` — Venue partnership template
- `docs/DENK_monetization_gamification_appendix.md` — Revenue model details
- `docs/PITCH_DECK_OUTLINE.md` — Investor narrative

**Current Milestones:**
- ✅ Product specification complete
- ✅ Legal compliance framework drafted
- ✅ Monetization model designed
- 🔄 Pilot venue outreach (in progress)
- ⏳ MVP implementation (next phase)

## Workspace Configuration

**OpenClaw Setup:**
- Agent: Claw (this workspace)
- Framework: OpenClaw (Agent SDK)
- Memory system: Persistent context via MEMORY.md + daily logs
- Config: `.openclaw/config.json` (Ollama llama3.2:1b provider)

**Session Management:**
- Auto-load on startup: SOUL.md, USER.md, IDENTITY.md
- Per-session notes: `memory/YYYY-MM-DD.md`
- Long-term store: MEMORY.md (this file)
- Boot checklist: BOOT.md (startup tasks)
- Heartbeat tasks: HEARTBEAT.md (periodic checks)

## Key Learnings & Patterns

**Communication Patterns:**
- Yahoza prefers direct action over long explanations
- Tired during feature work — keep responses concise
- Values progress over perfection
- Respects token efficiency (OpenClaw context window matters)

**Development Patterns:**
- Work on feature branches (`claude/*`)
- Commit with clear, descriptive messages
- Push to remote after each milestone
- Document decisions in memory for next sessions

**Project Patterns:**
- DENK targets moderate-income professionals
- Afterwork venues are proven market (less saturation than dating apps)
- Partner venues are distribution + trust mechanism
- Retrospective matching reduces cold-start problem

## Notes for Future Sessions

- Check `memory/YYYY-MM-DD.md` for recent session context
- DENK is at critical pilot planning phase — venue partnerships matter
- Legal framework is solid but not filed (needs founder action)
- Monetization model is sound but needs gamer economy tuning (DP currency balance)
- Claw should proactively track DENK progress without being asked

---

*Last updated: March 16, 2026 during self-introduction feature completion*
*Next review: After pilot venue partnerships confirmed*
