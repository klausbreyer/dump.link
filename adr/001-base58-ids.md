# Use of Base58 IDs for Decentralized ID Generation

## Status

Accepted

## Context

We need to generate unique, URL-friendly IDs in a decentralized manner for client-side tasks.

## Decision

We will use Base58 for ID generation. For project creation, we'll check if the ID already exists (cost-efficient). For buckets and tasks, IDs will be scoped with the project ID, making them double in length. This approach ensures uniqueness within a project and mitigates the risk of cross-project security breaches due to ID collisions.

## Consequences

Scoped IDs confine collision risks to individual projects, enhancing overall system security.
