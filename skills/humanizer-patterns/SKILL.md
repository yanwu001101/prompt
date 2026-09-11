---
name: humanizer-patterns
description: |
  Rewrite AI-sounding text so it reads like the writer without changing what it says.
  Use when editing prose for AI tells: not-X-but-Y contrasts, one-line closers, staged
  openers, forced triads, dashes everywhere, inflated claims, sales language, stock AI
  words, bold labels, or filler. Based on Wikipedia Signs of AI writing.
  Source: github.com/blader/humanizer
license: MIT
metadata:
  version: "3.0.0"
---

# Humanizer: remove AI writing patterns

Rewrite AI-sounding text so it reads like the writer, not a chatbot. Keep what it says. Do not make anything up.

## Why AI text sounds the way it does

A language model writes whatever is most likely to come next, so by default it makes the choice that fits the widest range of readers. A human writer chooses for one reader and one subject, so their choices are uneven and specific.

- **Staging.** The sentence signals importance instead of adding a fact.
- **Rhythm by rule.** Triads and dashes applied everywhere.
- **Inflation.** Ordinary facts dressed as pivotal.
- **Formatting by rule.** Bold and title case on every item.
- **Leftovers.** Chat wrappers never meant for the reader.

Every sentence you keep must add something the reader did not already have. A tell counts in proportion to how rarely a careful writer would make it on purpose.

## How to work

1. **Mark the tells.** Read once, mark every pattern, strongest first.
2. **Draft the rewrite.** Keep every supported claim. Do not add facts, names, numbers, dates, quotes, or citations unless they come from the source.
3. **Check the draft.** Read aloud. Search for surviving tells: not-X-but-Y, one-line closer, dash, triad, bold label.
4. **Write the final version.** Vary sentence length.

### Voice

If the user gives a writing sample, match its sentence length, word choice, punctuation. Without a sample, blog posts keep the writer's opinions and asides; technical text stays neutral and plain.

## A. Staging instead of stating

### 1. Not X but Y
**Watch for:** not just X, it's Y; This does not mean X. It means Y.
**Fix:** State the point directly. Keep contrast only when the negative half corrects a belief the reader holds.
> "It's not just about the beat; it's part of the aggression." → "The heavy beat adds to the aggressive tone."

### 2. One-line closers and dramatic fragments
**Watch for:** "That is the real win." "Read that again." Fragment rows.
**Fix:** Cut closers that repeat. Merge fragments into a specific claim.

### 3. Sayings that sound deep
**Watch for:** at its core, what really matters, the language of, the currency of
**Fix:** Replace with the specific claim.

### 4. Staged run-up
**Watch for:** Let's dive in, Honestly?, Here's the thing, Real talk
**Fix:** Remove the run-up, state the point.

### 5. Arguing with no one
**Watch for:** This isn't mainly about, I'm not saying, Some might say... but
**Fix:** Remove the unraised objection. Keep real claims.

## B. Rhythm by rule

### 6. Forced triads
**Fix:** Use the number of items the meaning needs. Two, or four, or one.

### 7. Repeated sentence openings
**Fix:** Merge sentences or change the subject.

### 8. Dashes as universal connector
**Rule:** No em dashes unless the writer's sample uses them. Replace with period, comma, colon, or parentheses.

### 9. Stacked qualifiers
**Fix:** One qualifier maximum. Keep only what the source supports.

### 10. Hyphenated pairs everywhere
**Fix:** Keep hyphen before a noun when grammar needs it; drop after.

### 11. Passive voice and missing subjects
**Fix:** Name the actor when that helps.

## C. Inflation and borrowed authority

### 12. Overused AI words
**Watch for:** delve, crucial, enhance, fostering, highlight, intricate, landscape, meticulous, pivotal, robust, showcase, tapestry, testament, underscore, vibrant
**Fix:** Plain words. This is the only vocabulary list.

### 13. Inflated significance
**Watch for:** marking a pivotal moment, Despite challenges... continues to thrive, The future looks bright
**Fix:** Keep the fact, drop the significance. End on the last concrete fact.

### 14. Vague connection
**Watch for:** associated with, in connection with
**Fix:** State the relationship the source gives.

### 15. Shallow -ing riders
**Watch for:** symbolizing, reflecting, showcasing
**Fix:** Keep only what the source supports.

### 16. Sales language
**Watch for:** nestled, breathtaking, must-visit, stunning, vibrant
**Fix:** State what the thing is.

### 17. Borrowed authority
**Watch for:** Experts believe, cited in NYT, BBC, FT
**Fix:** Name a real source and what it said, or remove.

### 18. Avoiding is, are, and has
**Watch for:** serves as, stands as, boasts, features
**Fix:** Use "is" and "has."

## D. Formatting by rule

### 19. Bold as decoration
**Fix:** Remove decorative bold. Turn labeled lists into prose.

### 20. Decorative headings
**Fix:** Sentence case. Remove emojis and arrows.

### 21. Curly quotation marks
**Fix:** Straight quotes.

## E. Leftovers from the chat and the draft

### 22. Chatbot residue
**Watch for:** Great question! I hope this helps! Let me know if...
**Fix:** Remove the wrapper, keep the content.

### 23. Knowledge-limit disclaimers and guesses
**Watch for:** As of my last update, While details are limited, it appears
**Fix:** State what the source shows, or remove.

### 24. Heading repeated in first sentence
**Fix:** Let the heading do the work.

### 25. Writing about the previous version
**Fix:** Describe what it does now.

## When not to act

Act on a *weak alone* tell only when several tells share a passage. Leave watched phrases inside quotations, titles, or proper names alone. Keep details that carry the writer's voice: specific unusual details, mixed feelings, dated references, genuine asides.

## Source

Wikipedia "Signs of AI writing", WikiProject AI Cleanup.
