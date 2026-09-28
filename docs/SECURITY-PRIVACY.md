# Security and Privacy Boundary

## Core rule

Personal health records remain local unless a user explicitly exports them. The peer synchronization layer has a strict conceptual boundary: it is for **project coordination**, not identifiable clinical data.

## Shared workspace allowlist

P2P snapshots contain only workspace metadata, projects, tasks, comments, decisions and evidence records. The synchronization code does not enumerate medication, diagnosis, insurance, appointment, emergency-contact or household-health stores.

## Identity limitations

Trystero peer identifiers are ephemeral technical identifiers, not verified people. Display aliases, disciplinary roles and organization labels are user assertions. The UI repeatedly labels them unverified.

Where verified identity matters, integrate organizational authentication outside this prototype and do not infer identity from peer metadata.

## Public room

The default public commons sends presence only and can be disabled. Do not enter sensitive information in display aliases or organization labels.

## Shared secret

An optional Trystero room password strengthens encryption of session descriptions exchanged over the discovery medium. It is a shared secret, not a complete access-control model.

## TURN

No hidden TURN service exists in the default configuration. Administrators must explicitly configure TURN. TURN relays only peer connections that need it and should be governed as infrastructure with its own privacy/security controls.

## Imports

JSON imports are parsed as data, bounded by size, and rendered through escaped/text-safe UI paths. Imported HTML is not intentionally executed. Institutional deployments should add formal JSON Schema validation at ingestion boundaries.

## WebLLM

Local inference can keep prompts on the device after model loading, but browser/device compromise, extensions or screen capture remain relevant. Do not use the planning copilot as an EHR or with unnecessary PHI.

## Cryptographic integrity

SHA-256 can show whether exported bytes changed. It does not establish author identity or creation date. Use signatures and trusted timestamping where provenance requirements extend beyond integrity.
