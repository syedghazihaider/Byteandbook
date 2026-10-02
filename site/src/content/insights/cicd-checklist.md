---
title: "The CI/CD Checklist Every Team Should Use"
description: "A fully ungated CI/CD checklist by pipeline stage, with a real pipeline YAML example and honest tool comparisons for security scanning, CI platforms and IaC."
publishedDate: 2026-09-30
category: "Infrastructure"
relatedServices: ["devops"]
tags: ["ci-cd", "checklist", "devops", "security"]
targetKeyword: "ci/cd checklist"
sources:
  - label: "GitHub Actions documentation: Workflow syntax for GitHub Actions"
    url: "https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions"
  - label: "GitLab documentation: CI/CD YAML syntax reference"
    url: "https://docs.gitlab.com/ee/ci/yaml/"
  - label: "Semgrep: Why choose Semgrep over Snyk"
    url: "https://semgrep.dev/contact/semgrep-vs-snyk/"
  - label: "Pulumi: Why choose Pulumi over Terraform"
    url: "https://www.pulumi.com/blog/why-choose-pulumi-over-terraform/"
  - label: "HashiCorp Terraform documentation"
    url: "https://developer.hashicorp.com/terraform/language"
draft: false
---

Most CI/CD checklists you'll find online make you trade an email address for the actual list. That's backwards for a document meant to be pinned above someone's desk. This one is the whole thing, inline, organized by the order a change actually moves through a pipeline: source control, build, test, security scan, staging, production, rollback.

## Why this is ungated

A checklist that's hidden behind a signup form has an obvious business reason to exist that way — it's a lead-generation asset, not primarily a reference document. That's a legitimate way to run a content business, but it means the checklist you actually get is secondary to the email address it collects.

This one is written to be used directly: copy the items you need into your own tracker, adapt the pipeline YAML to your stack, and don't give us your email for it.

## Source control

- [ ] Branch protection is enabled on your main branch — no direct pushes, pull requests required.
- [ ] At least one approving review is required before merge, enforced by the platform, not by convention.
- [ ] Commit signing (GPG or SSH) is required or strongly encouraged for a verifiable history.
- [ ] Secrets are never committed — a pre-commit hook or a tool like `gitleaks` or `trufflehog` scans for them before they land.
- [ ] `.gitignore` actually excludes build artifacts, `.env` files, and local config.

## Build

- [ ] The build is reproducible — pinned dependency versions (a lockfile, not a floating range), not "whatever was latest today."
- [ ] Build artifacts are versioned by commit SHA, not by a mutable tag like `latest`, so you can always trace a running artifact back to the exact code that produced it.
- [ ] The build runs in a clean, isolated environment (a container or a fresh CI runner) — never "works on my machine" as the bar.
- [ ] Build time is tracked. A build that quietly grows from 2 minutes to 20 over six months is a sign something needs caching or splitting.
- [ ] Dependencies are cached between runs (e.g. `actions/setup-node`'s built-in npm cache) so CI time doesn't scale with dependency count on every single run.

## Test

- [ ] Unit tests run on every pull request, not just before a release.
- [ ] Test failures block the merge — a red pipeline is a hard stop, not a warning to ignore.
- [ ] Integration tests run against a real (or realistic, containerized) dependency — a database, a queue — not only mocks.
- [ ] Flaky tests are tracked and fixed or quarantined, not silently re-run until green. A test suite people don't trust gets skipped, which defeats the point of having one.
- [ ] Coverage is measured, but not worshipped — a coverage percentage target is a smell detector, not a quality guarantee.

## Security scan

- [ ] **Static analysis (SAST)** runs on every pull request. Two real options with a genuine tradeoff: **Snyk** has a stronger SaaS experience and a large, actively maintained vulnerability database out of the box; **Semgrep** is free and open-source for its core engine and fully self-hostable, which matters if you can't send code to a third-party service.
- [ ] **Dependency scanning (SCA)** checks your third-party packages for known CVEs on every build, not on a manual schedule — both Snyk and GitHub's built-in Dependabot cover this.
- [ ] **Secret scanning** runs in CI as a backstop even if you also scan pre-commit, since pre-commit hooks can be skipped or bypassed locally.
- [ ] **Container image scanning** runs against the built image before it's pushed to a registry, not just against source code — a clean codebase can still produce a vulnerable base image.
- [ ] Scan results have an actual severity gate (e.g. block on critical/high, warn on medium) — a scanner nobody acts on is just noise.

## Staging

- [ ] Staging is deployed automatically on every merge to main, so it never drifts more than one merge behind production.
- [ ] Staging's configuration (infrastructure, environment variables, feature flags) mirrors production as closely as is practical — the same Infrastructure-as-Code module, different variable values, not a hand-built parallel environment.
- [ ] A smoke test suite runs against staging after every deploy, checking that the core paths (login, checkout, the main API endpoints — whatever "core" means for your product) actually work post-deploy, not just that the deploy succeeded.
- [ ] Staging data is either synthetic or properly anonymized — real customer data in a lower environment is a real risk, not a theoretical one.

## Production

- [ ] Production deploys require an explicit gate — a manual approval, a scheduled window, or a passing staging smoke test — never "it built, so it shipped."
- [ ] Deploys are progressive where the traffic justifies it: canary or blue-green rather than an all-at-once cutover, so a bad release affects a fraction of users before it affects all of them.
- [ ] Health checks and readiness probes are wired into the deploy process itself, so a failed rollout is detected automatically, not by a user complaint.
- [ ] Deploy events are logged and visible (a Slack notification, a dashboard annotation) so "did we just deploy?" is never a question someone has to ask in an incident channel.
- [ ] Feature flags decouple deploy from release for risky changes — you can ship the code without turning the behavior on for everyone at once.

## Rollback

- [ ] A rollback is a single, documented, tested action — not a novel procedure someone improvises during an incident.
- [ ] Database migrations are backward-compatible for at least one release, so rolling back application code doesn't leave you with a schema the old code can't read.
- [ ] Rollback time is known, not assumed — it's worth actually timing a rollback in staging so the number in your runbook is real.
- [ ] Whoever is on call has rollback permissions and knows the procedure without needing to find the one engineer who usually does it.
- [ ] Every rollback is followed by a short retro on what triggered it — a rollback that happens the same way twice is a process gap, not bad luck.

## How to actually roll this out

A 35-item checklist dropped on a team that's already shipping code will get ignored. It works better introduced in three passes:

1. **Audit first, change nothing.** Go through every item against your current pipeline and mark it done, missing, or partial. This alone usually surfaces two or three gaps nobody had gotten around to — a staging environment that's quietly drifted from production, or a rollback procedure that exists only in one engineer's memory.
2. **Fix the gate items before the convenience items.** Branch protection, a required test gate, and a production deploy approval step matter more than caching or dashboard annotations. If you can only do five things this month, do the ones that block a bad change from shipping, not the ones that make a good change ship faster.
3. **Bake the rest into your Infrastructure-as-Code and pipeline config, not into a wiki page.** A checklist item that lives only as prose in a doc gets skipped under deadline pressure. The same item enforced as a required CI check (a branch protection rule, a mandatory `sast` job, a merge gate) gets enforced by the platform instead of by discipline.

## Common failure modes this checklist catches

- **The staging environment that stopped being staging.** It drifted from production's configuration months ago, so "it worked in staging" stopped meaning anything, and nobody noticed because nobody was checking it against the checklist above.
- **The rollback nobody has actually done.** A documented rollback procedure that's never been executed is a hypothesis, not a safety net — the first real rollback is a bad time to discover it doesn't work.
- **The security scan that's on but not enforced.** A SAST or dependency scan running in CI with no severity gate just produces a report nobody reads. Scanning without gating is closer to the appearance of security than the fact of it.
- **The database migration that breaks the rollback.** Application code rolls back cleanly; the schema it now points to doesn't match. This is one of the most common causes of a rollback turning into a second incident instead of resolving the first one.

## One real pipeline: source through test

Here's a minimal GitLab CI pipeline covering the source-through-test stages above — cache, lint, test, with a security scan stage using GitLab's built-in SAST template rather than a hand-rolled script:

```yaml
stages:
  - build
  - test
  - security

variables:
  NODE_ENV: "test"

cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/

build:
  stage: build
  image: node:20
  script:
    - npm ci
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 hour

test:
  stage: test
  image: node:20
  script:
    - npm run lint
    - npm test -- --ci
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
    - if: '$CI_COMMIT_BRANCH == "main"'

sast:
  stage: security
  include:
    - template: Security/SAST.gitlab-ci.yml
```

The `sast` job pulls in GitLab's maintained SAST template rather than reimplementing scanning logic — worth doing on any platform that ships one, since a template gets updated with new rules on a schedule your own script won't.

## Two more honest tool comparisons

- **CI platform — GitHub Actions vs. GitLab CI:** GitHub Actions wins on ecosystem — if your code is already on GitHub, it's zero-migration and has the largest marketplace of pre-built actions. GitLab CI is the stronger pick if you want source control, CI/CD, and a container registry as one integrated product with fewer third-party integrations to manage.
- **Infrastructure as Code — Terraform vs. Pulumi:** Terraform's HCL is purpose-built and has by far the largest provider ecosystem and community track record. Pulumi lets you write infrastructure in a real programming language (TypeScript, Python, Go), which pays off when your infrastructure logic needs actual conditionals and loops beyond what HCL's constructs comfortably express.
- **Container image scanning — Trivy vs. Grype:** Trivy (from Aqua Security) scans images, filesystems and IaC in one tool and is the more common default in CI templates out of the box. Grype (from Anchore) is narrower in scope but pairs cleanly with Syft for SBOM generation if a software bill of materials is already part of your compliance requirements — both are free and open-source, so the choice is mostly about which existing toolchain you're already in.

## How this differs from a generic "best practices" list

The distinction that matters is enforceable versus aspirational. "Write good tests" is aspirational — nobody disagrees with it, and it changes nothing about what actually ships. "Test failures block the merge, enforced by branch protection" is enforceable — it's either configured or it isn't, and you can check which in thirty seconds by looking at your repository settings.

Every item in this checklist was written to pass that test: if you can't point to where it's configured (a setting, a required CI job, a gate in the deploy pipeline), it doesn't belong on the list, because it won't survive contact with a deadline.

That's also why this checklist is shorter in some places than others. Source control and security scanning have hard, binary settings to check. Culture-adjacent items — "communicate deploys well," "review code thoughtfully" — are real, but they don't belong on an enforceable checklist, so they're left out rather than padded in as vague bullet points that look actionable but aren't.

## Where this fits with the rest of your pipeline

A checklist only helps if it's actually followed — that's a process and tooling problem as much as a technical one. For help building or auditing a pipeline against these stages, see our [DevOps service](/services/devops/).
