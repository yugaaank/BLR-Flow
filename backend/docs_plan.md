
# Phase 0: Kill Criteria (30 min)

Before building anything.

Compute:

```text
Persistent Hotspots
=
Junctions appearing in Top 20
for ≥80% of weeks
```

Measure:

```text
A = % of all violations
B = % of all multi-violation cases
```

Decision:

```text
If A < 15%
→ Pivot project

If A ≥ 15%
→ Continue

If B >> A
→ Strong story
```

---

# Phase 1: Data Validation (1 hr)

### 1. Create Weekly Dataset

```python
week
junction
violations
multi_violation_count
backlog_count
```

### 2. Validate

Output:

```text
Total weeks
Total junctions
Top 20 per week
```

### Deliverable

```text
validation_report.md
```

Containing:

* Number of weeks
* Number of junctions
* Top hotspot list

---

# Phase 2: Persistent Hotspot Discovery (1 hr)

### Goal

Find junctions consistently problematic.

### Method

For each junction:

```text
weeks_in_top20
÷
total_weeks
```

Example:

```text
Safina Plaza
21/21 weeks
100%
```

### Classification

```text
Persistent
≥80%

Semi-Persistent
50-79%

Transient
<50%
```

### Deliverable

Table:

| Junction     | Persistence % |
| ------------ | ------------- |
| Safina Plaza | 100           |
| KR Market    | 95            |
| Elite        | 90            |

---

# Phase 3: Concentration Analysis (1 hr)

### Most Important Section

Compute:

```text
Persistent Hotspots Share
```

Example:

```text
12 junctions
=
8% of junctions

but

34% of violations
```

Then:

```text
Concentration Ratio

34 / 8
=
4.25x
```

### Repeat for

```text
Multi-Violation Cases
```

Example:

```text
12 junctions
=
55% of obstruction-related violations
```

This becomes your strongest slide.

### Deliverable

Pareto chart.

---

# Phase 4: Obstruction Analysis (1 hr)

### Goal

Prove persistent hotspots are not random.

### Compute

For every junction:

```text
Multi-Violation Rate

=
multi_violation
/
total violations
```

Compare:

```text
Persistent Hotspots

vs

Rest of City
```

Output:

```text
Persistent:
31%

Others:
12%
```

If true:

```text
Persistent hotspots
generate more severe violations.
```

---

# Phase 5: Operational Alert Engine (45 min)

### Backlog Analysis

Compute:

```text
Backlog %

=
FALSE SCITA
/
Total
```

Rank stations.

Example:

```text
Kodigehalli
45%

City Average
14%
```

### Alert Rule

```text
Station backlog
>
2 × city average

→ Alert
```

Output:

```text
Operational Alert:
Kodigehalli backlog anomaly
```

No root-cause claims.

---

# Phase 6: Recommendation Engine (45 min)

Do NOT generate hours.

Do NOT generate staffing counts.

Generate priorities.

Example:

```text
Priority 1
Safina Plaza

Reason:
100% persistence
High multi-violation concentration

Priority 2
KR Market

Reason:
Persistent hotspot
High obstruction patterns
```

---

# Phase 7: Final Story (2 hrs)

### Slide 1

Problem

```text
Enforcement is reactive.
```

---

### Slide 2

Discovery

```text
Hotspots are highly persistent.
```

---

### Slide 3

Evidence

```text
8% of junctions
generate 34% of violations

4.25× concentration
```

---

### Slide 4

Obstruction

```text
Persistent hotspots
contain 55% of multi-violation cases.
```

---

### Slide 5

Operational Alerts

```text
Kodigehalli
45% backlog
vs
14% city average
```

---

### Slide 6

Solution

```text
Persistent Hotspot Detection
+
Operational Alert Engine
```

---

### Slide 7

Recommendation

```text
Shift from reactive sweeps
to proactive monitoring of
persistent hotspots.
```

---

# Files to Submit

```text
analysis.ipynb

persistent_hotspots.csv

operational_alerts.csv

presentation.pdf

README.md
```

# Absolute Rule

Do not claim:

```text
Congestion reduction %
Traffic flow improvement %
Officer-hours saved
Resource savings
```

unless directly measured from data.

Use only findings you can prove from the dataset.
