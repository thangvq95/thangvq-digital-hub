---
name: template-custom-skill
description: Example of a custom skill.
metadata:
  short-description: Template custom skill
---

# Template Custom Skill

## 📌 Important Notes

To install all skills defined in `skills-lock.json` locally, run:

```bash
npx skills experimental_install -y
```

To find and install a specific new skill from the registry:

```bash
npx skills install <skill-name>
```

After installing or creating a new skill, save it to the repository so the VPS agent can use it:

```bash
git add .agents/skills/
git commit -m "chore: commit new skills directly to repo"
git push
```
