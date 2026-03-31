<!--
Sync Impact Report:
- Version change: N/A → 1.0.0 (initial constitution)
- Modified principles: N/A (new constitution)
- Added sections: All sections (Core Principles, Performance Standards, Testing Strategy, Git Workflow, AI Usage Guidelines, MCP Usage Guide, Governance)
- Removed sections: N/A
- Templates requiring updates:
  ✅ plan-template.md (reviewed - Constitution Check section compatible)
  ✅ spec-template.md (reviewed - requirements structure compatible)
  ✅ tasks-template.md (reviewed - task categorization compatible)
- Follow-up TODOs: None
-->

# DeepSeek Chat Constitution

## Core Principles

### I. Test-Driven Development (NON-NEGOTIABLE)

TDD is mandatory for all feature development:

- Tests MUST be written before implementation code
- Tests MUST be reviewed and approved by the user before implementation begins
- Tests MUST fail initially (Red state)
- Implementation proceeds only after failing tests are confirmed
- Red-Green-Refactor cycle is strictly enforced

**Rationale**: TDD ensures code correctness, provides living documentation, and enables confident refactoring. Without tests, we cannot verify functionality or prevent regressions.

**Executable Check**: CI pipeline MUST fail if tests are not written before implementation. PRs without tests MUST be rejected.

---

### II. Readability First

Code is written once but read many times:

- Code MUST prioritize readability over cleverness
- Variable and function names MUST clearly express intent
- Complex logic MUST include explanatory comments
- Functions SHOULD be small and single-purpose
- Magic numbers and strings MUST be replaced with named constants

**Rationale**: Maintainable code depends on human comprehension. Readable code reduces bugs and speeds up onboarding.

**Executable Check**: Linting rules enforce naming conventions. Code review MUST assess readability.

---

### III. Component Convention Compliance

All components MUST follow established conventions:

- Components MUST use consistent file naming (PascalCase for components, camelCase for utilities)
- Components MUST have clear single responsibility
- Components MUST be self-contained with explicit dependencies
- Shared components MUST be documented with usage examples

**Rationale**: Consistency reduces cognitive load and enables parallel development.

**Executable Check**: Automated linting checks file naming patterns. PR templates include convention checklist.

---

### IV. Ambiguity Clarification

Unclear requirements MUST be clarified before implementation:

- Specifications with ambiguity MUST trigger clarification questions
- Implementation MUST NOT proceed when requirements are unclear
- Assumptions MUST be documented and validated
- Edge cases MUST be explicitly addressed

**Rationale**: Building the wrong thing wastes time. Clarification prevents rework.

**Executable Check**: `/speckit.clarify` command MUST be used when specifications are incomplete. Plan phase MUST identify all NEEDS CLARIFICATION items.

---

### V. TODO Annotation Discipline

Incomplete work MUST be clearly marked:

- Temporary solutions MUST include TODO with explanation
- TODO items MUST include: what, why, and when to address
- Technical debt MUST be tracked in issues, not just TODO comments
- Critical TODOs MUST block PR merge

**Rationale**: TODOs prevent temporary solutions from becoming permanent. They create a backlog of improvements.

**Executable Check**: Pre-commit hooks warn on TODOs without issue references. PR description MUST list new TODOs.

---

## Performance Standards

### Resource Optimization

- **MUST**: Monitor memory usage; set thresholds based on environment
- **MUST**: Profile before optimizing; measure actual bottlenecks
- **SHOULD**: Lazy-load non-critical resources
- **MAY**: Implement code splitting for web applications

**Executable Check**: Performance profiling tools (Chrome DevTools, clinic.js, etc.) integrated in development workflow.

---

### Caching Strategy

- **MUST**: Cache expensive computations and I/O operations
- **MUST**: Implement cache invalidation logic
- **SHOULD**: Use appropriate caching layer (memory, Redis, CDN)
- **MAY**: Implement stale-while-revalidate for user-facing content

**Executable Check**: Cache hit rates monitored. Cache invalidation tested.

---

### Performance Metrics

- **MUST**: Define performance budgets for each feature
- **MUST**: Measure: response time (p50, p95, p99), throughput, error rate
- **SHOULD**: Set up alerts for performance degradation
- **MAY**: Track custom business metrics (conversion, engagement)

**Executable Check**: Metrics dashboard configured. Performance gates in CI/CD.

---

## Testing Strategy

### Unit Tests

- **MUST**: Test pure functions and business logic in isolation
- **MUST**: Achieve minimum 80% code coverage for critical paths
- **SHOULD**: Aim for 90%+ coverage on new code
- **MAY**: Use property-based testing for data transformations

**Executable Check**: `npm run test:coverage` or equivalent. CI blocks coverage below threshold.

---

### Component Tests

- **MUST**: Test UI components with user interactions
- **MUST**: Verify component props and state behavior
- **SHOULD**: Test accessibility (ARIA labels, keyboard navigation)
- **MAY**: Visual regression testing for design-critical components

**Executable Check**: Component test suite runs in CI. Storybook or equivalent for component documentation.

---

### E2E Tests

- **MUST**: Cover critical user journeys (happy path)
- **SHOULD**: Test error scenarios and edge cases
- **MAY**: Test cross-browser/cross-device compatibility

**Executable Check**: E2E tests run before release. Critical path coverage documented.

---

### Coverage Thresholds

| Test Type | Minimum | Target   |
|-----------|---------|----------|
| Unit      | 80%     | 90%+     |
| Component | 70%     | 85%+     |
| E2E       | N/A     | Critical paths |

**Executable Check**: Coverage reports generated in CI. PRs show coverage delta.

---

### Mock Strategy

- **MUST**: Mock external service calls (APIs, databases)
- **MUST**: Use consistent mock fixtures
- **SHOULD**: Validate mock contracts match real services
- **MAY**: Use contract testing for API mocks

**Executable Check**: Mocks defined in dedicated test fixtures. Contract tests validate API compatibility.

---

## Git Workflow

### Branch Strategy

- **MUST**: Use sequential branch numbering (configured in project)
- **MUST**: Feature branches: `###-feature-name`
- **MUST**: Never commit directly to main/master
- **SHOULD**: Delete branches after merge
- **MAY**: Use release branches for stabilization

**Executable Check**: Branch protection rules on main. Numbering enforced by `.specify/init-options.json`.

---

### Commit Conventions

- **MUST**: Use conventional commits format: `type(scope): description`
- **MUST**: Types: feat, fix, docs, style, refactor, test, chore
- **SHOULD**: Keep subject line under 72 characters
- **MAY**: Use body for detailed explanation

**Executable Check**: Commit lint hook enforces format. Examples:
```
feat(chat): add message streaming support
fix(auth): resolve token refresh race condition
test(api): add contract tests for user endpoints
```

---

### PR Template

Pull requests MUST include:

- [ ] Description of changes
- [ ] Link to related issue/spec
- [ ] Testing performed
- [ ] Breaking changes (if any)
- [ ] Checklist: tests pass, lint passes, manual QA complete
- [ ] Performance impact assessment
- [ ] New TODOs added to issues

**Executable Check**: PR template enforced. Missing checklist blocks merge.

---

### Release Process

- **MUST**: Use semantic versioning (MAJOR.MINOR.PATCH)
- **MUST**: Generate changelog from commits
- **SHOULD**: Tag releases in git
- **MAY**: Automate release notes generation

**Executable Check**: Release script validates version. Changelog updated.

---

## AI Usage Guidelines

### Development Workflow

1. **Clarification Phase**: Use `/speckit.clarify` when specs are unclear
2. **Planning Phase**: Use `/speckit.plan` to generate design artifacts
3. **Implementation Phase**: Use `/speckit.implement` to execute tasks
4. **Code Review**: Use `/simplify` to review and improve code

### AI Prompts Best Practices

- **MUST**: Provide context (files read, existing patterns)
- **MUST**: Specify expected output format
- **SHOULD**: Ask for explanations, not just code
- **MAY**: Request alternatives with trade-offs

### When to Use AI

| Task | Recommended | Notes |
|------|-------------|-------|
| Boilerplate generation | YES | Saves time |
| Refactoring | YES | Use `/simplify` |
| Debugging | YES | Provide error context |
| Architecture decisions | ASK | Request options first |
| Security review | VERIFY | Always double-check |

---

## MCP Usage Guide

### Design System Integration

- **MUST**: Use configured design tokens for consistency
- **MUST**: Follow component variants defined in design system
- **SHOULD**: Contribute reusable patterns back to design system

**Executable Check**: Design tokens imported from shared config. Component variants match Figma/design specs.

---

### API Integration

- **MUST**: Use typed contracts for all API calls
- **MUST**: Handle errors and loading states
- **SHOULD**: Implement retry logic with exponential backoff
- **MAY**: Use API SDKs if available

**Executable Check**: Contract tests validate API shape. Error handling tested.

---

### Deployment Tools

- **MUST**: Environment-specific configuration
- **MUST**: Database migrations run before deployment
- **SHOULD**: Use blue-green or canary deployments
- **MAY**: Auto-rollback on health check failure

**Executable Check**: Deployment checklist verified. Health endpoints monitored.

---

### Project-Specific MCP

For DeepSeek Chat:

- **MUST**: Use DeepSeek API client for AI operations
- **MUST**: Implement streaming responses with proper cleanup
- **MUST**: Handle API rate limits gracefully
- **SHOULD**: Cache common prompts to reduce API calls

**Executable Check**: API client usage follows best practices. Rate limiting tested.

---

## Governance

### Amendment Procedure

1. Propose change with rationale
2. Update version following semantic versioning
3. Sync changes to all dependent templates
4. Communicate changes to team
5. Update this Sync Impact Report

### Versioning Policy

- **MAJOR**: Backward-incompatible principle changes
- **MINOR**: New principles or major expansions
- **PATCH**: Clarifications and wording improvements

### Compliance Review

- All PRs MUST verify constitution compliance
- Complex patterns MUST be justified in plan.md Complexity Tracking
- Use `/speckit.analyze` for cross-artifact consistency checks

### Override Process

In rare cases, principles may be overridden with:

1. Documented justification in plan.md
2. Approval from project maintainer
3. Timeline for remediation

---

**Version**: 1.0.0 | **Ratified**: 2026-03-30 | **Last Amended**: 2026-03-30
