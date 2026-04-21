---
title: The All-Consuming Monorepo
slug: the-all-consuming-monorepo
date: 2026-04-20
excerpt: Our monorepo keeps eating things. First our other repos. Then our docs. Then our prompts. It's almost done with our landing page and our feature flags too.
cover: /article-covers/the-all-consuming-monorepo.jpg
xUrl: https://x.com/owengretzinger/status/2046246995161948551
---

Our monorepo keeps eating things.

First our other repos. Then our docs. Then our prompts. It's almost done with our landing page and our feature flags too.

Everything is collapsing into one folder, and I don't think we'll stop.

## One repo to rule them all

A few months ago I pulled all our separate apps into a single monorepo. Backend, internal dashboards, every service.

The pitch had obvious wins like shared CI and easier cross-service changes. The bigger one (the one I really wanted) was that agents could finally see everything at once.

The first cross-service change I asked it to make after the migration shipped in a single PR. Before, that would have meant juggling multiple repos across multiple windows and manually giving Claude context. The productivity jump was instant.

## Then the monorepo started eating things

Once you start using agents heavily, you realize that nothing really competes with a file in a folder.

Sure, there are plugins and MCPs and CLIs for everything now. We use plenty of them. But agents are just too good at using a file system. `grep`, `cat`, `ls`. That's the native interface. Anything that requires a network hop feels like a downgrade once you've been markdown-pilled.

So we started pulling things into the repo. One by one.

### Notion → markdown

Engineering docs that don't change much used to live in Notion. Onboarding, architecture overviews, runbooks. We moved all of it into the repo as markdown. Now it's version controlled, and agents have it in context by default.

### Prompts → in-code package

We used to use a hosted prompt management service. The thinking was that a dashboard would make it easier to edit prompts.

In practice, it created a parallel universe to our codebase. Prompt changes lived outside code review. Engineers had to leave the IDE to inspect or edit anything. Agents could read every other file in the repo but couldn't see the prompts the code was actually using.

So I built a shared prompts package. Each prompt is a `config.yaml` + `content.md` pair, fully typed, with cost / latency / full request and response logged for every run. Source of truth is Git. Runtime is Redis, so content edits still hot-reload without a redeploy.

Same goal as the hosted service, minus the parallel universe.

(Might write a separate post on how the package actually works 👀)

### Webflow → Next.js

We had our landing page on Webflow. Nice for designers (kind of), painful for everything else.

The data flow looked like this: Webflow form → Zapier → our backend.

Recently a zap silently broke and we missed 6,000 form completions before anyone noticed. Six thousand. Real people who never got processed properly into our systems.

So we're rebuilding it in plain Next.js, hosted next to the backend. The form posts directly to our server, no Zapier in between.

It's also way easier to iterate on. Anyone on the team can ask an agent in a Slack discussion thread to change something on the page, and the agent opens a PR. You don't have to know Webflow or be a designer to ship a landing page change anymore.

### PostHog → YAML

Half our flags lived in environment variables. The other half lived in PostHog.

Both are invisible to agents. Env vars are scattered across deploy configs the agent can't reach. PostHog is yet another fetch to yet another external service.

So we're moving them all to YAML files in the repo. One source of truth. Version controlled. Agents read them like any other config.

Now when an agent is reasoning about a feature, it knows whether the flag is on, who it's enabled for, and what the rollout looks like. Without making a single API call.

## The rule

If an agent should be able to do X, then X has to live in the repo.

OpenAI calls this harness engineering. Their article puts it best: "anything it can't access in-context while running effectively doesn't exist."

For this experiment they even put design docs and plans straight into the repo as markdown, with a "doc-gardening" agent running in the background to keep everything fresh.

So far it has has been too big of a bite to chew, but if the monorepo gets hungry again, Linear just might just be next on the menu.

## Now the repo eats engineers too

If agents aren't effective for you, it's not a model problem. It's a context problem. And now that all the context an agent could dream of is inside our monorepo, we're seeing huge productivity gains.

In fact, in the last 13 weeks, 4 non-engineers on our team shipped 114 merged PRs (all going through regular eng review).

And for us on the engineering team, this has let us move up a level of abstraction. Every engineer at Boardy is a PM/engineer hybrid: we define problems, hold strong opinions about what should get built, and orchestrate the agents that ship. The rest is agency and good judgment, which the agents are still behind on.

Like I said at the start, I don't think it stops. And we're hiring engineers who want to be around for what gets eaten next.
