# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

See `_shared/skill-resolver.md` for the full resolution protocol.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| frontend task | frontend-design | C:\Users\usuario\.agents\skills\frontend-design\SKILL.md |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### frontend-design
- Choose a BOLD aesthetic direction before coding: minimal, maximalist, retro-futuristic, organic, luxury, playful, editorial, brutalist, art deco, industrial, etc.
- Typography: Use distinctive fonts (never Inter/Roboto/Arial). Pair display fonts with refined body fonts.
- Color: Commit to cohesive aesthetic. Dominant colors with sharp accents outperform timid palettes.
- Motion: Prioritize CSS-only animations. Use Motion library for React. Focus on high-impact page load reveals with staggered animations.
- Spatial: Embrace asymmetry, overlap, diagonal flow, grid-breaking, generous negative space.
- Backgrounds: Create atmosphere with gradient meshes, noise textures, geometric patterns, layered transparencies, custom shadows.
- NEVER use generic AI aesthetics: avoid Inter/Roboto, purple gradients on white, predictable layouts.
- Match implementation complexity to aesthetic vision - maximalist needs elaborate code, minimalist needs precision.

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| GEMINI.md | C:\Personal\split-ease\GEMINI.md | Project context with architecture, tech stack, conventions |

Read the convention files listed above for project-specific patterns and rules. All referenced paths have been extracted — no need to read index files to discover more.