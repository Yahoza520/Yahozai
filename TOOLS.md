# TOOLS.md - DENK Development Environment

Quick reference for Claw's development environment, DENK project specifics, and useful commands.

## Workspace Setup

### Local LLM Provider
- **Primary:** Kimi K2.5 (via API)
- **Secondary:** Claude Haiku (via API)
- **Local Fallback:** Ollama (llama3.2:1b)
  - Running on: localhost:11434
  - Config file: `.openclaw/config.json`
  - Start: `ollama serve`
  - Pull: `ollama pull llama3.2:1b`

### Git Configuration
- **Repo root:** /home/user/Yahozai
- **Feature branch:** claude/self-introduction-4vRWe
- **Main branch:** main
- **Remote:** origin

### Memory System
- **Daily logs:** `memory/YYYY-MM-DD.md` (session notes)
- **Long-term:** MEMORY.md (curated learnings)
- **Auto-load sequence:**
  1. SOUL.md (who Claw is)
  2. USER.md (who Yahoza is)
  3. MEMORY.md (long-term context)
  4. memory/YYYY-MM-DD.md (today's notes)

## DENK Project Assets

### Documentation Files
- PRD: `docs/PRD.md` (v0.2)
- Monetization: `docs/DENK_monetization_gamification_appendix.md`
- Legal/KVKK: `docs/LEGAL_KVKK_TOS_OUTLINE.md`
- Partner Template: `docs/PARTNER_MECHAN_TEMPLATE_v0.1.md`
- Pitch: `docs/PITCH_DECK_OUTLINE.md`

### Key Concepts
- **Time Window:** 24h (Basic) / 72h (Premium)
- **Core:** Retrospective location matching
- **Monetization:** DP currency + tiers
- **Safety:** Report/block, Ghost Mode, Partner verification
- **Target:** Istanbul, 22-40, afterwork venues

### Pilot Parameters
- **Venue:** Afterwork cocktail bars
- **Days:** Fri-Sat
- **Time:** 18:00+ (evening through night)
- **Income:** 50-200k TL/month
- **Strategy:** Sentry venue (high foot traffic)

## Timezone & Locale

- **Timezone:** Europe/Istanbul
- **Language:** Turkish (docs) + English (code)
- **Currency:** TL (Turkish Lira)
- **Date Format:** YYYY-MM-DD (ISO)

## External Services & APIs

### LLM API Keys (in .env, not in git)
- KIMI_API_KEY (Kimi K2.5 — primary)
- CLAUDE_API_KEY (Claude Haiku — secondary)
- (Ollama: local, no API key)

### Potential Integrations
- Venue QR system (partner verification)
- Location services (geolocation history)
- Payment processor (DP currency)
- SMS/Email provider (notifications)

## Useful Commands

```bash
# Check OpenClaw config
cat .openclaw/config.json

# View git log
git log --oneline claude/self-introduction-4vRWe

# Commit with message
git add [files]
git commit -m "[type]: message"
git push origin claude/self-introduction-4vRWe

# Read daily memory
cat memory/$(date +%Y-%m-%d).md

# Test Ollama
curl http://localhost:11434/api/status
```

## Shortcuts & Preferences

- **Communication:** Concise, direct, no fluff
- **Documentation:** Turkish preferred (local context)
- **Commits:** Conventional format (feat/fix/docs)
- **Memory:** Write to file (survives sessions)
- **Errors:** Flag immediately, don't suppress