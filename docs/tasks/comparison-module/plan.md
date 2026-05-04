# Task: Comparison Module

## Goal

Enable users to compare matches side-by-side in a table format — either one resume vs multiple JDs, or one JD vs multiple resumes — with insight data in a matrix view.

## Scope

**In scope:**

- Dashboard sidebar menu entry ("Compare")
- `/dashboard/compare` page
- API endpoint to fetch user's matches with insight data
- Two comparison modes: "By Resume" (1 resume vs N JDs) and "By JD" (1 JD vs N resumes)
- Table layout: insight names on left, match columns on right
- Generate button for missing insights per cell
- Max 3 comparison columns at a time

**Out of scope:**

- Cross-user comparison
- PDF export of comparison (can reuse existing export later)

## Approach

1. Add "Compare" nav item to `DashboardSidebar`
2. Create API endpoint `/api/v1/matches/compare` to fetch match data with insights
3. Build the comparison page with mode toggle, selectors, and matrix table

## Acceptance Criteria

- [ ] Compare menu in sidebar next to Matches
- [ ] Two modes: By Resume / By JD
- [ ] Select anchor (1 resume or 1 JD) then pick up to 3 counterparts
- [ ] Matrix table shows insight names on left, match columns on right
- [ ] Missing insights show a Generate button
- [ ] Generated insights populate the cell without page reload
