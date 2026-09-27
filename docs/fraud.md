# Fraud Detection & Reputation System

To ensure enterprises receive legitimate, high-fidelity African data, AFRIX implements multi-signal anomaly detection and a reputation scoring algorithm.

## 1. Fraud Signals Tracked

| Signal | Detection Mechanism | Risk Impact |
|---|---|---|
| **Impossible Speed** | Elapsed duration between `startedAt` and `submittedAt` is `< 3 seconds` | +45 Risk Score |
| **Fast Completion** | Duration between `startedAt` and `submittedAt` is `< 10 seconds` | +20 Risk Score |
| **Device Reuse** | Same browser/device fingerprint used across multiple worker accounts | +25 to +50 Risk Score |
| **Repeated Answers** | Identical copy-pasted response strings across multiple form fields | +25 Risk Score |
| **Withdrawal Velocity** | More than 3 withdrawal requests within a 24-hour window | +35 Risk Score |
| **Location Anomaly** | Missing or implausible GPS coordinates for field verification tasks | Flagged for manual review |

## 2. Automated Action Thresholds

- **ALLOW** (`Risk Score < 30`): Normal task flow. Eligible for auto-approval if the task validation type is `AUTOMATIC`.
- **CHALLENGE** (`Risk Score 30 - 59`): Submission marked for enhanced review.
- **REQUIRE REVIEW** (`Risk Score 60 - 79`): Submission flagged, automatic reward halted until enterprise reviewer checks evidence.
- **RESTRICT / BLOCK** (`Risk Score >= 80`): Immediate restriction and creation of a `FraudEvent` for admin investigation.

## 3. Worker Reputation Score

Reputation is computed using a weighted composite formula:

$$\text{Reputation} = (0.40 \times \text{Accuracy}) + (0.20 \times \text{Completion}) + (0.20 \times \text{Reliability}) + (0.10 \times \text{Quality}) + \max(0, 10 - 0.10 \times \text{FraudScore})$$

- High reputation unlocks Tier 3 (Verified), Tier 4 (Trusted), and Tier 5 (Pro), which grant access to higher-paying enterprise field tasks and speech recording campaigns.
