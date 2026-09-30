---
title: "DevOps for Startups: A Practical Guide"
description: "A stage-by-stage DevOps guide for startups: what to run at each stage, a working GitHub Actions pipeline, and real DORA benchmark numbers to measure against."
publishedDate: 2026-09-30
category: "Infrastructure"
relatedServices: ["devops", "cloud"]
tags: ["devops", "startups", "ci-cd", "dora-metrics"]
targetKeyword: "devops for startups"
sources:
  - label: "DORA (Google Cloud): DORA's software delivery metrics — the four keys"
    url: "https://dora.dev/guides/dora-metrics-four-keys/"
  - label: "Steve Fenton, \"The 2024 DevOps Performance Clusters,\" Octopus Deploy, citing the DORA 2024 State of DevOps Report"
    url: "https://octopus.com/blog/2024-devops-performance-clusters"
  - label: "Google Cloud Blog: Announcing the 2023 State of DevOps Report"
    url: "https://cloud.google.com/blog/products/devops-sre/announcing-the-2023-state-of-devops-report"
  - label: "GitHub Actions documentation: Workflow syntax for GitHub Actions"
    url: "https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions"
  - label: "Terraform documentation: Configuration language"
    url: "https://developer.hashicorp.com/terraform/language"
draft: false
---

Most "DevOps for startups" advice is a list of principles — automate everything, break down silos, measure what matters — with no answer to the question a founder or first engineer actually has: **what do I run, on what, and when do I change it?** This guide answers that directly, stage by stage, with real tools and one working pipeline you can copy.

## The short version

You don't need a platform team at ten employees. You need three things, in this order: a place that deploys your code without you SSH-ing into a server, a pipeline that stops bad code before it ships, and a way to know whether your delivery process is actually getting better or worse. Everything below builds toward those three things at whatever stage you're at.

## Stack by stage: what to actually run

The mistake most early startups make isn't under-investing in DevOps — it's over-investing too early, standing up Kubernetes for a product with twelve users. The table below is a starting point, not a mandate; move a stage earlier or later based on your actual traffic and team size, not your ambitions.

| Stage | Team size | What to run | Why |
| --- | --- | --- | --- |
| Pre-seed / MVP | 1–3 engineers | A managed PaaS: **Render**, **Railway**, or **Fly.io**. Git-push or Docker-image deploys, managed Postgres, built-in TLS and preview environments. | No infrastructure to maintain means no infrastructure to break. You're optimizing for speed of iteration, not for scale you don't have yet. |
| Seed – Series A | 3–15 engineers | CI/CD in **GitHub Actions** or **GitLab CI**, Infrastructure-as-Code in **Terraform** (or **OpenTofu**, the open-source fork), and a managed Kubernetes offering — **Amazon EKS**, **Google GKE**, or **DigitalOcean Kubernetes** for a cheaper, simpler on-ramp. | You now have enough traffic or enough compliance pressure (SOC 2 questionnaires start here) to need reproducible infrastructure and an audit trail, but not enough headcount to run bare-metal Kubernetes yourself. |
| Growth stage | 15+ engineers, dedicated platform function | A platform-engineering team, internal developer platforms (e.g. **Backstage**), self-managed or multi-cluster Kubernetes, dedicated observability stack (**Prometheus** + **Grafana**, or a vendor like **Datadog**), and progressive delivery (canary/blue-green via **Argo Rollouts** or **Flagger**). | At this point the cost of a slow or broken deploy is measured in real revenue and real incidents, and you have the headcount to own the extra operational surface area. |

Two honest caveats. First, this ladder isn't strictly linear — a data-heavy or regulated startup (health, finance) may need Terraform and proper environments from day one, before it needs a managed PaaS at all. Second, moving off a PaaS is a real migration with real cost; don't do it speculatively because a table like this said so.

### Signals it's time to move to the next stage

Rather than a headcount or funding-round trigger, watch for these instead:

- **You're paying more in platform overage fees than an equivalent VM or cluster would cost.** Managed PaaS pricing is convenient, not cheap at scale — it's designed to be worth outgrowing.
- **You need infrastructure a PaaS doesn't expose** — a private VPC peering connection, a specific database extension, a queueing system with configuration the platform doesn't surface.
- **Compliance requires it.** SOC 2 Type II and most enterprise security questionnaires expect a documented, auditable change-management process for infrastructure — screenshots of a PaaS dashboard don't satisfy that the way a Terraform plan/apply history does.
- **You've had more than one incident caused by not knowing what changed.** That's the signal that "click a button in a dashboard" has stopped being safe at your current change volume.

Moving early wastes engineering time on infrastructure instead of product. Moving late means an unplanned, stressful migration during an incident instead of a scheduled one. Neither is catastrophic on its own, but the second is much more expensive.

## Common mistakes at each stage

**Pre-seed:** treating "no infrastructure to manage" as an excuse to skip CI entirely. Even a PaaS deployment benefits from a test gate before it ships — the absence of servers to manage doesn't mean the absence of bugs to catch.

**Seed to Series A:** adopting Kubernetes before adopting Infrastructure-as-Code. Kubernetes without version-controlled manifests and a GitOps flow (or at minimum, a documented `kubectl apply` process) just moves the "nobody knows what's actually deployed" problem from a cloud console into a cluster — it doesn't solve it.

**Growth stage:** building an internal developer platform that only the platform team understands. The point of platform engineering is to make deployment self-service for product engineers; a platform that requires filing a ticket to use isn't actually solving the problem it was built for.

## One real pipeline: GitHub Actions

Here's a working CI/CD workflow that fits the seed-to-Series-A stage in the table above: it runs tests on every pull request, then builds and pushes a Docker image on merge to `main`. It's deliberately unglamorous — no exotic matrix builds, no custom actions — because most teams at this stage need a pipeline that a new hire can read in five minutes, not one that showcases every GitHub Actions feature.

```yaml
name: CI/CD

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --ci

  build-and-push:
    needs: test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ github.repository }}:${{ github.sha }}
            ghcr.io/${{ github.repository }}:latest
```

The `test` job gates everything: it runs on every pull request, so a broken build never reaches `main` in the first place. The `build-and-push` job only runs on a push to `main` (not on pull requests) and depends on `test` passing, so a red pipeline never produces a shippable image. From here, a Kubernetes deployment step or a `render deploys create` / `railway up` call is a small addition, not a rewrite.

For the seed-to-Series-A stage, pair this with a minimal Terraform module rather than clicking through a cloud console — even something this small is worth version-controlling:

```hcl
resource "aws_ecs_cluster" "main" {
  name = "startup-cluster"
}

resource "aws_ecs_service" "app" {
  name            = "app"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [aws_security_group.app.id]
    assign_public_ip = false
  }
}
```

You don't need this on day one. You need it the day someone other than you has to reproduce your infrastructure — which, for most startups, is closer than founders expect.

## Security basics that belong in the pipeline, not a later project

Security is usually treated as a growth-stage concern, added once there's a dedicated security hire. Three things are cheap enough to add at the seed stage that there's no good reason to defer them:

- **Dependency and secret scanning in CI.** GitHub's Dependabot and secret scanning are free and largely zero-config on GitHub-hosted repos; GitLab ships equivalent free-tier scanning. This is minutes of setup, not a project.
- **Least-privilege IAM from the start.** It's far cheaper to define a scoped deployment role once in Terraform than to retroactively narrow a set of admin credentials that fifteen services have started depending on.
- **Secrets out of environment variables in plaintext config and into a secrets manager** (AWS Secrets Manager, HashiCorp Vault, or even your CI platform's encrypted secrets store) as soon as you have more than one environment. Copy-pasting a production API key into a `.env` file that gets committed once is a common, avoidable startup incident.

None of this requires a security engineer. It requires deciding to do it before the first production incident, rather than after.

## Observability: know before your users tell you

A pipeline that ships code safely is only half the loop — the other half is knowing what that code does once it's running. At minimum, before the seed-to-Series-A stage:

- **Structured logs** shipped somewhere searchable (even a managed PaaS's built-in log viewer, before you need a dedicated tool).
- **One uptime/error alert** — a simple health-check ping or an error-rate threshold — routed somewhere a human will actually see it, not just to a dashboard nobody opens.
- **A single dashboard for the metrics that matter to your product** (request latency, error rate, queue depth — whatever's load-bearing for you), so "is production healthy" is a five-second check, not a round of manual log-grepping.

At the growth stage this becomes a proper observability stack — Prometheus and Grafana, or a vendor platform like Datadog or Honeycomb — but the underlying discipline (know before your users tell you) is the same at every size.

## Measuring whether it's working: real DORA metrics

Google's DevOps Research and Assessment (DORA) team has spent over a decade studying what separates high-performing engineering organizations from the rest, publishing findings in the *Accelerate* research program and the annual State of DevOps Report. Its four keys are the closest thing DevOps has to an agreed measurement standard:

| Metric | What it measures |
| --- | --- |
| Deployment frequency | How often you successfully release to production |
| Lead time for changes | Time from a commit landing to it running in production |
| Change failure rate | The percentage of deployments that cause a failure requiring remediation |
| Time to restore service | How long it takes to recover once a failure happens |

These aren't abstract — DORA's research clusters organizations into elite, high, medium and low performers, and the 2024 State of DevOps Report puts real numbers on each cluster:

| Performer cluster | Deployment frequency | Lead time for changes | Change failure rate | Time to restore service |
| --- | --- | --- | --- | --- |
| Elite | On demand (multiple times a day) | Less than one day | 5% | Less than one hour |
| High | Daily to weekly | One day to one week | 20% | Less than one day |
| Medium | Weekly to monthly | One week to one month | 10% | Less than one day |
| Low | Monthly to every six months | One to six months | 40% | One week to one month |

(The 2024 report noted an unusual inversion: medium performers actually posted a lower change failure rate than high performers that year — a reminder to read your own trend line, not just chase a static target.)

A startup with one deploy a week and a same-day lead time is already closer to "high performer" than to "low performer," and that's a genuinely useful thing to know before you decide you need to hire a platform team. Track these four numbers from your CI/CD system and incident log from day one — even a spreadsheet is enough — and you'll have an honest answer to "is our delivery process getting better" instead of a gut feeling.

## Culture, briefly — because it's the part that actually fails

Tooling advice like the above is necessary but not sufficient. DORA's own research, going back to the *Accelerate* book, is consistent on this point: the tools matter less than whether the organization actually uses them the way they're designed to be used. A team with a perfect GitHub Actions pipeline that still merges Friday afternoon hotfixes without review, or that treats a failing test as something to re-run until it passes rather than something to fix, gets none of the benefit the pipeline is supposed to provide.

Two practices matter more than any specific tool choice:

- **Small, frequent changes over large, infrequent ones.** A pull request that changes forty files is harder to review, harder to test meaningfully, and harder to roll back cleanly than four pull requests that each change ten. This is also most of why deployment frequency and lead time move together in the DORA data — teams that ship small changes often are, almost by definition, shipping them fast.
- **Blameless incident review.** The goal of looking at what caused a production incident is to find the gap in the process (a missing test, a missing alert, a missing runbook step), not to find the person to hold responsible. Teams that skip this step tend to relearn the same lesson from the same category of incident repeatedly, because nothing about the process actually changed.

Neither of these needs a platform team, a budget, or a specific tool. They need a team that's decided to work that way, which is the one part of "DevOps for startups" that genuinely is cultural rather than technical — and the one part no stack table can substitute for.

## Where this fits with the rest of your stack

DevOps and cloud infrastructure decisions compound: the platform you pick at seed stage shapes what a Series A migration costs, and vice versa. If you want a second opinion on the table above for your specific stage, see our [DevOps service](/services/devops/) and [Cloud service](/services/cloud/).
