# A self-hoster supplies the runtime, and there is still one owner

The documented deployment is one owner. That owner supplies a GitHub App, a Cloudflare Workers deployment, a Postgres database, a private runner repository, and provider keys. CodePoppy does not provide these accounts. The reference database is Neon, and any Postgres that can run the schema is acceptable. Multi-user administration, seats, and a hosted control plane are outside the product.

The allowed dashboard user is the owner's immutable GitHub user ID, set in the deployment. There is no sign-up.

## Considered Options

- Offer a hosted multi-tenant control plane in the first release.
- Accept any Node host as a second documented control plane.

## Consequences

- The public repository contains the application, the schema, the example runner workflow, and documentation. It contains no provider keys, no private replay corpus, and no production workflow secrets.
- The license is Apache-2.0. The project name is CodePoppy. Package, domain, organization, and trademark clearance happen before the first public release, not before private use.
