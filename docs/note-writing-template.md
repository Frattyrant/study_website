# Note writing template

This site remains compatible with ordinary Obsidian Markdown. Existing notes do
not need to be rewritten.

Use this optional structure when a new note needs a cleaner published article:

````markdown
# Note title

One short summary sentence.

## First concept

Explain the idea in normal Markdown.

> [!note] Key point
>
> Put important context here.

> [!tip] Practice
>
> Add a command, workflow, or habit worth remembering.

> [!warning] Watch out
>
> Describe risk, caveat, or a common mistake.

```bash
docker image ls
```

## Next step

- Keep headings in order.
- Prefer fenced code blocks with a language name.
- Use local images normally in Obsidian; the sync script publishes referenced
  images into `public/content-assets`.
````

Supported callout types are:

- `[!note]`
- `[!info]`
- `[!tip]`
- `[!success]`
- `[!warning]`
- `[!danger]`
- `[!error]` as an alias of danger
- `[!caution]` as an alias of warning
- `[!important]` as an alias of note
