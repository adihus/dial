
## A Portable Addressing, Identity, Credential, and Authority Layer for the Economy of Things

**Version:** v5.4 draft completion  
**Date:** June 2026  
**Contributors:** Lionscraft, Pairpoint, Vodafone

---

## 1. Executive Summary

DIAL is a portable addressing, identity, credential, and authority layer for humans, enterprises, AI agents, devices, assets, and machines.

The purpose of DIAL is to make trusted participation portable across digital networks. A participant should be reachable through a usable address, identifiable through a standards-based identity object, credentialed by recognized issuers, and authorized to act across relevant networks.

DIAL is based on four functional layers:

1. **Addressing** — human-readable Names and telco-style Numbers used to find, send to, identify, and manage participants.
2. **Identity** — the subject represented behind the address, expressed as a DID, or Decentralized Identifier.
3. **Credentials** — claims made about that subject by recognized issuers, expressed as Verifiable Credentials or equivalent attestations.
4. **Authority** — the permissions, limits, delegation, and revocation rules that define what the subject is allowed to do.

This separation is important because each layer solves a different problem. A wallet address can prove control of a key, but does not provide a usable address, issuer-backed trust, or delegated authority. A name can improve usability, but does not by itself prove who verified the subject. A credential can prove that a claim was made by an issuer, but does not by itself define what the subject is permitted to do. DIAL combines these layers into a system that can be verified by counterparties across applications, chains, institutional systems, and machine networks.

DIAL uses open identity standards where possible. DIDs provide the identity format. Verifiable Credentials provide the credential format. DIAL adds the product layer, Names and Numbers, Directory, trust registry, authority model, resolver, policy engine, issuer management, verification flows, and commercial logic.

The trust registry is central to the architecture. It defines which issuer DIDs are recognized as authoritative for which claim types. This is necessary because open credential standards allow anyone to issue a credential, but relying parties still need to know which issuers are valid for specific claims.

DIAL does not define itself by any single underlying network. It abstracts supported networks and infrastructure environments through a resolver and adapter layer. The DIAL address is the user-facing primitive; networks are deployment and execution environments.

In the initial commercial phase, the retail product supports `.dial` addresses on Ethereum/EVM and Canton. The enterprise product starts on Canton through Vodafone/Pairpoint-managed infrastructure, allowing an enterprise to receive its own namespace and participate without first operating its own dedicated node. Over time, the same address model can extend across additional networks and infrastructure ecosystems, including Midnight, NEAR, Nillion, Allora, EnergyWeb, Avalanche, Chainlink-based integrations, and other supported environments.

DIAL itself is the layer that makes these components usable as one system. It provides the addressing layer, DIAL identity method, Directory, trust registry, credential orchestration, authority logic, resolver, network adapters, application layer, APIs, billing, and governance rules.

The result is a standards-native trust and authority layer where Names and Numbers resolve to identities, identities resolve to credentials and authority, and counterparties can verify participants without integrating separately with every underlying issuer.

The first commercial products express this architecture in two forms. For retail users, a `.dial` address resolves to a public profile page, social links, current modes, optional wallet/payment information, and an AI-managed receptionist for request routing. For enterprise users, DIAL provides organization-owned namespaces such as `.acme` and structured prefixes such as `+ACME`, initially bundled with managed Canton access where the enterprise does not want to apply for or operate its own node. These are initial product surfaces, not the boundary of the architecture.

---

## 2. Problem Statement: Trusted Participation Is Not Portable

The digital economy is expanding beyond human users and conventional application accounts. Enterprises are delegating actions to software systems and AI agents. Connected devices are producing data and triggering workflows. Institutional networks are being used for regulated digital settlement. Blockchain systems provide programmable value, but usually identify participants through wallet addresses.

These systems are converging, while their trust models remain separate.

A transaction may involve an enterprise, an AI agent acting on its behalf, a connected device, a telco verification signal, an institutional eligibility check, a smart contract payment, and a regulated settlement network. Each system may hold part of the trust picture, but that trust usually remains inside its own environment.

This creates the core verification problem: a relying party needs to know who or what a participant is, what has been verified about it, and what it is allowed to do, without integrating separately with every telco, bank, enterprise system, device-security provider, and institutional network.

DIAL addresses this by making four things portable:

1. the address used to reach or reference the participant;
2. the identity behind that address;
3. the credentials issued about that identity; and
4. the authority that defines what the identity is allowed to do.

The practical goal is that a relying party can resolve a DIAL Name or Number, verify who or what it represents, check which recognized issuers have attested to it, and confirm what it is authorized to do.

---

## 3. DIAL Product Architecture

DIAL is organized around four product layers:

`Address → Identity → Credentials → Authority`

The address layer gives each participant a structured point of reference. The identity layer defines the subject behind that address. The credential layer attaches recognized claims to the identity. The authority layer defines what the identity is permitted to do.

The four layers are connected by resolution. A DIAL address resolves to a DIAL identity. The identity links to credentials. Credentials are evaluated against recognized issuers. Authority determines whether the identity can perform a specific action in a specific context.

This section describes the product architecture. Section 4 then maps this architecture to the underlying systems and rails.

---

### 3.1 Addressing

The addressing layer defines how DIAL participants are named, organized, controlled, and resolved.

It has five components:

1. **Address formats** — the forms an address can take.
2. **Address spaces** — the controlled zones in which addresses exist.
3. **Address Space Registry** — the control record for those address spaces.
4. **Address records** — the individual addresses created inside an address space.
5. **DIAL Directory / Resolver** — the resolution layer that maps address records to DIAL identities.

These components are needed because DIAL is not only addressing individual users. It must support public identities, enterprise namespaces, telco-style allocation, agent fleets, device fleets, and machine endpoints under one addressing model.

#### 3.1.1 Address Formats

DIAL supports two address formats: **Names** and **Numbers**.

A **Name** is a semantic address. It is used when the address should carry meaning, role, brand, or organizational context.

Examples:
- `agent.dial`
- `support.acme`

A **Number** is a structured address. It is used when the address needs to support scale, hierarchy, fleet allocation, device identity, machine identity, or telco-style operational use.

Examples:

- `+DIAL·1234`
- `+ACME·0001·0001`

Names and Numbers are two formats for the same DIAL architecture. They do not create separate identity systems. Both formats ultimately resolve to DIAL identities.

The reason to support both is architectural. Some participants need semantic recognizability. Others need structured allocation. An enterprise may want `support.acme` for a public-facing service agent, while using `+ACME·1234` for a device, meter, SIM-linked endpoint, vehicle, or machine participant.

#### 3.1.2 Address Spaces

An address format becomes useful only when it exists inside a controlled address space.

For Names, the address space is a **namespace**, such as `.dial` or `.acme`.
For Numbers, the address space is a **prefix**, such as `+DIAL` or `+ACME`.

A namespace is useful when addresses should be organized around a brand, institution, role structure, or public identity domain. For example, `.acme` allows Acme to create addresses such as `agent.acme` or `support.acme`.

A prefix is useful when addresses need to be allocated at scale. For example, `+ACME` allows Acme to create structured addresses such as `+ACME·1234` for machines, devices, fleet members, or operational endpoints.

The `.dial` namespace and `+DIAL` prefix are the native address spaces of the DIAL network. Institution-owned spaces such as `.acme` and `+ACME` allow organizations to operate their own DIAL-compatible address zones while still using the same identity, credential, and authority infrastructure.

#### 3.1.3 Address Space Registry

The **Address Space Registry** records who controls each namespace and prefix.

It is the control layer for DIAL address spaces.

For example:

- `.dial` and `+DIAL` may be controlled by DIAL.
- `.acme` and `+ACME` may be controlled by Acme.
- `.vodafone` and `+VF` may be controlled by Vodafone.

Control of an address space gives the controller the right to create and manage address records inside that space, subject to DIAL’s rules.

This component is separate from credentials and authority. Acme may control `.acme` and `+ACME`, but that does not make Acme authoritative for SIM verification, bank KYB, insurance, or hardware integrity. Address-space control only defines who may create addresses inside that namespace or prefix. Credential authority is handled later through the Trust Registry.

#### 3.1.4 Address Records

An **address record** is the individual Name or Number created inside an address space.

Examples:
- `agent.acme`
- `+ACME·1234`

An address record should contain at least:
- the address;
- its controller;
- its status;
- its target DIAL identity.

It may also contain expiry, renewal status, service metadata, policy references, or routing metadata depending on the final design.

The address record is the bridge between address-space control and identity resolution. The Address Space Registry determines who may create the address. The address record determines what the address points to.

For example, Acme may control `.acme`, create `agent.acme`, and configure that address record to resolve to `did:dial:agent:acme-grid-agent`.

#### 3.1.5 DIAL Directory / Resolver

The **DIAL Directory** is the resolution layer for address records. It maps issued Names and Numbers to DIAL identities.

Examples:
`agent.acme` → `did:dial:agent:acme-grid-agent`
`+ACME·1234` → `did:dial:device:meter-1234`

The Directory connects the addressing layer to the identity layer. A DIAL address becomes useful because it resolves into an identity that can carry controllers, credentials, authority policies, proof references, execution addresses, and service endpoints.

The addressing flow is therefore:
`Address Space → Address Record → DIAL Identity`

For Names:
`.acme → agent.acme → did:dial:agent:acme-grid-agent`

For Numbers:
`+ACME → +ACME·1234 → did:dial:device:meter-1234`

This gives DIAL a structured addressing model for public identities, institution-owned identities, agents, devices, machines, and operational endpoints.

---

### 3.2 Identity

The identity layer defines the stable subject behind a DIAL address.

The addressing layer expresses context. It gives a participant one or more usable references that reflect how the participant is reached, organized, or understood in a particular setting. An address can include a public name, country opco, department, team, role, service function, fleet structure, or operational prefix.

For example:

`john.de.vodafone`
identifies John in a Vodafone Germany context.

If John later moves to Vodafone Romania, his address changes to:
`john.ro.vodafone`

The address changes because the organizational context has changed. The identity remains the same because the subject has not changed.

John’s DIAL identity remains:
`did:dial:vodafone:person:employee123398`

This is the reason DIAL separates addressing from identity. The address layer carries contextual meaning. The identity layer preserves continuity of subject.

That continuity is important. Credentials, authority history, revocation history, audit trails, employment attestations, relationship changes, risk status, and execution permissions attach to the identity, not merely to the current address. If every address change created a new identity, DIAL would fragment trust history across multiple records and lose the ability to distinguish between a new subject and the same subject in a new context.

The same principle applies to non-human participants.

A device may be reachable today through:
`+ACME·1234`

If the device receives a new operational number or moves into a different fleet, the address changes. The device identity remains stable if the underlying device is still the same subject.

The identity layer therefore performs three functions:

1. it gives each subject a stable identifier;
2. it separates the subject from changing address context; and
3. it creates the object to which credentials, authority, relationships, status, execution mappings, and service endpoints attach.

In DIAL, this stable identity object is expressed as a Decentralized Identifier, or DID. The architecture aligns with the W3C Decentralized Identifiers specification, currently published as **DID v1.1, W3C Candidate Recommendation Snapshot, 05 March 2026**. A DID is a standards-based identifier for a subject. In the W3C DID model, the subject may be a person, organization, thing, data model, abstract entity, or another subject determined by the DID controller.

---

#### 3.2.1 DIAL DID Syntax

A DID follows the general pattern:

`did:<method>:<method-specific-id>`

The first segment, `did`, identifies the string as a Decentralized Identifier. The second segment identifies the DID method. The remaining part is the method-specific identifier.

DIAL uses its own DID method:

`did:dial`

This means the identity is resolved according to the DIAL DID method. The DIAL DID method defines how DIAL identities are created, resolved, updated, controlled, and revoked.

The DIAL DID syntax is:
`did:dial:<space>:<subject-type>:<local-id>`

| Segment          | Meaning                                                             |
| ---------------- | ------------------------------------------------------------------- |
| `did`            | Identifies the string as a Decentralized Identifier.                |
| `dial`           | Identifies the DIAL DID method.                                     |
| `<space>`        | Identifies the DIAL identity space.                                 |
| `<subject-type>` | Identifies the primitive class of subject.                          |
| `<local-id>`     | Identifies the specific subject inside that space and subject type. |

For example:

`did:dial:acme:agent:grid-agent`

means:

| Segment      | Value        | Meaning                                             |
| ------------ | ------------ | --------------------------------------------------- |
| `did`        | `did`        | The identifier is a Decentralized Identifier.       |
| method       | `dial`       | The identifier uses the DIAL DID method.            |
| space        | `acme`       | The identity belongs to Acme’s DIAL identity space. |
| subject type | `agent`      | The subject is an agent.                            |
| local ID     | `grid-agent` | The specific subject is Acme’s grid agent.          |

This syntax keeps the identity stable and limited. It identifies the identity space, the primitive subject type, and the local subject. It does not encode the full organizational path, current address, role, team, department, jurisdiction, or authority state.

That richer context belongs elsewhere in DIAL:

|Context|Modeled through|
|---|---|
|Current readable or operational reference|Addressing layer|
|Organizational hierarchy and membership|Identity relationships|
|Verified facts|Credentials|
|Permissions and limits|Authority|
|Operational groupings|Collections|

---

#### 3.2.2 Identity Space

The `<space>` segment identifies the DIAL identity space in which the subject exists. It normally corresponds to the organization, institution, public namespace, or controller context responsible for the identity.

Examples include:

- `dial`
- `acme`
- `sumitomo`

The identity space is related to the addressing layer, but it is not a literal copy of every address space.

For example, Vodafone may control several address spaces:

- `.vodafone`
- `.de.vodafone`
- `.uk.vodafone`
- `+VF`

These address spaces can all resolve to identities under the same Vodafone identity space.

|Address space|Address record|Resolved DID|
|---|---|---|
|`.de.vodafone`|`john.de.vodafone`|`did:dial:vodafone:person:employee123398`|
|`.uk.vodafone`|`john.uk.vodafone`|`did:dial:vodafone:person:employee887211`|
|`.vodafone`|`support.vodafone`|`did:dial:vodafone:agent:support`|
|`+VF`|`+VF·0001·0001`|`did:dial:vodafone:device:router-0001`|

This means `.vodafone`, `.de.vodafone`, `.uk.vodafone`, and `+VF` are *address* spaces. `vodafone` is the *identity* space used inside the DID.

The DIAL Directory maps address records to DIAL DIDs. The mapping is not a mechanical string conversion. DIAL supports multiple addresses resolving to the same DID where they represent the same subject.

Example:
`support.vodafone` and `+VF·7000` resolve to `did:dial:vodafone:agent:support`

This is why addressing and identity are separate layers. The address layer expresses context and reachability. The identity layer preserves the stable subject.

---

#### 3.2.3 Subject Types

The `<subject-type>` segment identifies the primitive class of subject represented by the DID.

The initial DIAL subject types are:

|Subject type|Represents|Typical examples|
|---|---|---|
|`person`|A human individual|employee, customer, operator, admin, signer|
|`organization`|A legal entity or organizational unit|group company, opco, department, team, bank, institution, DAO|
|`agent`|A software or AI actor that performs tasks or initiates actions|support agent, grid agent, treasury agent, settlement agent|
|`device`|A physical connected endpoint|meter, router, sensor, SIM-linked endpoint, vehicle device|
|`asset`|A physical or digital object that is owned, financed, insured, managed, or economically represented|tower, solar farm, insured object, tokenized asset|
|`account`|An account-like control point for value, access, custody, settlement, or platform participation|wallet, custody account, bank account, settlement account, platform account|
|`system`|A software system, platform, application, API, smart contract system, or enterprise backend|ERP, billing API, settlement engine, identity hub|
|`collection`|A grouped set of identities used for operational, credentialing, or authority purposes|fleet, swarm, portfolio, roster, pool, cluster|

These subject types identify the basic class of the subject. They do not encode every business role, department, jurisdiction, fleet, hierarchy, or permission directly into the DID string.

For example, a human employee remains a `person` even when that person sits inside a team, department, opco, and group. The organizational structure is modeled through relationships.

|Address|DID|Explanation|
|---|---|---|
|`john.de.vodafone`|`did:dial:vodafone:person:employee123398`|A specific Vodafone Germany employee.|
|`john.uk.vodafone`|`did:dial:vodafone:person:employee887211`|A different Vodafone UK employee.|
|`john.ro.vodafone`|`did:dial:vodafone:person:employee123398`|The same employee after moving to Vodafone Romania.|

The address layer distinguishes current context. The DID preserves the subject.

The main distinctions are:

|Distinction|Explanation|
|---|---|
|`organization` vs `collection`|An `organization` is a formal entity or unit, such as an opco, department, or team. A `collection` is an operational grouping, such as a device fleet, agent swarm, asset portfolio, or response roster.|
|`agent` vs `system`|An `agent` acts with delegated agency. It receives tasks, makes decisions, triggers workflows, or initiates actions. A `system` hosts, records, exposes, processes, or executes.|
|`device` vs `asset`|A `device` communicates or acts. An `asset` is owned, financed, insured, managed, collateralized, or economically represented. A telecom tower is an `asset`; a sensor on that tower is a `device`.|
|`account` vs `wallet`|DIAL uses `account` rather than `wallet` because the identity model covers crypto wallets, bank accounts, custody accounts, settlement accounts, exchange accounts, and platform accounts.|

Examples:

|DID|Meaning|
|---|---|
|`did:dial:vodafone:person:employee123398`|A human individual in Vodafone’s identity space.|
|`did:dial:vodafone:organization:VFDE`|Vodafone Germany as an organizational unit.|
|`did:dial:acme:agent:grid-agent`|Acme’s grid-management agent.|
|`did:dial:acme:device:meter-1234`|A specific connected meter in Acme’s fleet.|
|`did:dial:vodafone:asset:tower-778`|A telecom tower as an economically represented asset.|
|`did:dial:acme:account:treasury-wallet-1`|A treasury account or wallet controlled in Acme’s identity space.|
|`did:dial:acme:system:erp`|Acme’s ERP system.|
|`did:dial:acme:collection:meter-fleet-berlin`|A grouped fleet of meter identities.|

The rule is:

`subject-type` defines the primitive class of the identity.  
Relationships define hierarchy and membership.  
Credentials prove claims about the identity.  
Authority defines what the identity is permitted to do.

---

#### 3.2.4 Local Identifier

The `<local-id>` segment identifies the specific subject within the relevant identity space and subject type. It is unique within that `<space>:<subject-type>` context.

Examples:

|DID|Local ID|
|---|---|
|`did:dial:acme:agent:grid-agent`|`grid-agent`|
|`did:dial:acme:device:meter-1234`|`meter-1234`|
|`did:dial:vodafone:person:employee123398`|`employee123398`|
|`did:dial:vodafone:organization:VFDE`|`VFDE`|

The local identifier may be human-readable, operational, or system-generated. For public agents or assets, it may be readable. For employees, customers, devices, accounts, or internal systems, it may be a stable internal identifier.

This keeps the DID stable while allowing addresses to carry contextual meaning.

Example:
`john.de.vodafone` is a readable work-context address.
`did:dial:vodafone:person:employee123398` is the stable identity.

A DID does *not* encode the full organizational path:
`did:dial:vodafone:person:group:VFDE:risk:fraud-ops:john`

That structure would make the identity depend on temporary organizational position, department name, team name, and human name. It would become brittle when the person moves teams, the department is renamed, or another John appears in the same structure.

The DID remains *stable*:
`did:dial:vodafone:person:employee123398`

The address, relationships, credentials, and authority layers express the current context around that identity.

---

#### 3.2.5 Relationships and Hierarchy

The DID string does *not* carry the full organizational or operational context. That context belongs in relationships, credentials, collections, and authority.

For example, a person has relationships such as:

|Relationship|Target|
|---|---|
|`employedBy`|`did:dial:vodafone:organization:VFDE`|
|`memberOf`|`did:dial:vodafone:organization:fraud-ops-team`|
|`includedIn`|`did:dial:vodafone:collection:fraud-response-roster`|

An organizational unit has relationships such as:

|Relationship|Target|
|---|---|
|`partOf`|`did:dial:vodafone:organization:group`|
|`partOf`|`did:dial:vodafone:organization:VFDE`|

A device has relationships such as:

|Relationship|Target|
|---|---|
|`memberOf`|`did:dial:acme:collection:meter-fleet-berlin`|
|`ownedBy`|`did:dial:acme:organization:energy-division`|

This lets DIAL model complex structures without making the DID string brittle.

For example, a human sits inside a team, department, opco, and group:
`person → team → department → opco → group`

The person remains a `person` identity. The team, department, opco, and group are `organization` identities. The relationships between them express the hierarchy.

The same model applies to devices, agents, assets, and systems.

A device belongs to a fleet.  
An agent belongs to an agent swarm.  
An asset belongs to a portfolio.  
A system belongs to an enterprise architecture domain.

The DID remains the stable subject. Relationships describe where that subject sits.

---

#### 3.2.6 Identity Record

A DID resolves to a DID Document or equivalent DIAL identity record. This record describes how the identity is controlled, verified, and connected to the rest of the DIAL architecture.

It contains or references:

- the controller of the identity;    
- verification methods and key references;
- service endpoints;
- credential references;
- authority references;
- status references;
- execution address mappings;
- resolver endpoints;
- relationship references to other DIAL identities.

The distinction between the subject and the controller is important.

The subject is what the DID represents. The controller is the person, organization, or system that manages that DID.

Examples:

|DID|Subject|Controller|
|---|---|---|
|`did:dial:acme:agent:grid-agent`|Acme’s grid agent|Acme|
|`did:dial:acme:device:meter-1234`|A device in Acme’s fleet|Acme or its device-management system|
|`did:dial:vodafone:person:employee123398`|A person|The person and/or Vodafone, depending on the identity model|

The identity layer creates the stable object that the rest of DIAL relies on.

The flow is:

`john.de.vodafone → did:dial:vodafone:person:employee123398 → identity record`

or:

`+ACME·1234 → did:dial:acme:device:meter-1234 → identity record`

Once an address resolves to a controlled identity, the next layer attaches credentials to that identity.

---

### 3.3 Credentials

The credential layer defines what has been verified about a DIAL identity, and who has verified it.

The identity layer gives DIAL a stable subject. For example, `did:dial:vodafone:person:employee123398` identifies the same person even if the person’s address changes from `john.de.vodafone` to `john.ro.vodafone`.

But the DID alone does not tell a relying party what is true about that subject.

It does not prove that the person works for Vodafone, belongs to Vodafone Romania, completed a compliance check, controls a verified phone number, or is eligible for a particular workflow. It only gives DIAL a stable identity object.

Credentials add verified meaning to that identity.

A credential is a statement made by an issuer about a subject. In DIAL, the subject is usually a DIAL DID. The issuer is the party making the statement. The claim is the fact being asserted. A verifier, or relying party, is the party checking whether to rely on that statement.

For example:

- Vodafone may issue a credential saying that `did:dial:vodafone:person:employee123398` is currently employed by Vodafone Romania.
- Vodafone Identity Hub may issue a credential saying that a phone number or SIM associated with that identity has been verified.
- Acme may issue a credential saying that `did:dial:acme:agent:grid-agent` belongs to Acme.
- A bank may issue a credential saying that `did:dial:acme:organization:main` has passed KYB.

In this sense, a credential is a portable attestation. It allows a fact verified inside one system to become usable by another system without requiring every relying party to integrate directly with the original source.

The credential layer therefore performs three functions:

1. it attaches verified claims to DIAL identities;
2. it identifies who issued those claims; and
3. it gives relying parties a way to decide whether those claims should be trusted.

---

#### 3.3.1 Credential Model

DIAL credentials are expressed as Verifiable Credentials or equivalent attestations. The architecture aligns with the W3C Verifiable Credentials Data Model v2.0, a W3C Recommendation dated 15 May 2025.

A credential is a standard way to express a verified claim about a subject.

In DIAL, the subject is usually a DIAL DID. The credential says something about that DID, and the issuer is the party making the claim.

A credential has five core elements:

|Element|Meaning|
|---|---|
|Issuer|The party making the claim.|
|Subject|The DIAL identity the claim is about.|
|Claim|The fact being asserted about the subject.|
|Status|Whether the credential is active, expired, suspended, revoked, or superseded.|
|Proof|The signature, proof, reference, or verification mechanism that allows the claim to be checked.|

For example:

|Element|Example|
|---|---|
|Issuer|`did:dial:bankx:organization:main`|
|Subject|`did:dial:vodafone:person:employee123398`|
|Claim|This DID has passed KYC.|
|Status|Active|
|Proof|Issuer signature, credential reference, or privacy-preserving proof|

Credentials are not a single business category. They are a common object class for many different claim types.

DIAL can support many credential claim types, including:

|Claim type|What it proves|
|---|---|
|Binding claim|An address-layer object is currently associated with a DIAL DID.|
|KYC / KYB claim|A person or organization has passed identity or business verification.|
|Employment claim|A person is employed by, or associated with, an organization.|
|Role claim|A person, agent, or system holds a specific role.|
|Device claim|A device is verified, active, genuine, or part of an approved fleet.|
|Ownership claim|A DID owns, controls, or is responsible for an asset, account, device, or system.|
|Compliance claim|A subject has passed a required compliance, audit, or certification check.|
|Risk-status claim|A subject satisfies a risk, fraud, security, or eligibility condition.|

A binding claim is important because target systems often encounter the address layer first, not the DID directly.

A bank may see a wallet signature. An application may see an API key. A device network may see a device key. An agent platform may see an agent signing key. These are address-layer or interaction-surface objects. They are not the stable identity.

A VC with a binding claim links that interaction surface to the stable DIAL DID.
Example:
`wallet:0xABC... → VC with binding claim → did:dial:vodafone:person:employee123398`

A VC with a KYC claim then proves something about the DID itself.
Example:
`did:dial:vodafone:person:employee123398 → VC with KYC claim`

Both are credentials. They differ by claim type, issuer, subject, status, and verification rule. This allows a verifier to move from the surface it sees to the identity that carries the relevant credentials.

Example flow:
`wallet → VC with binding claim → DID → VC with KYC claim → verifier decision`

If John rotates from wallet `0xABC` to wallet `0xDEF`, the KYC claim does not need to be reissued. The KYC credential remains attached to:

`did:dial:vodafone:person:employee123398`

Only the binding claim changes. The old wallet binding is revoked or expires, and a new VC with a binding claim links `0xDEF` to the same DID.

This keeps wallets, keys, and other technical addresses replaceable while preserving identity and credential continuity. The credential layer records verified facts. It does not define permitted actions.

Credentials answer:

`What has been verified about this identity?`

Authority answers:

`What is this identity allowed to do?`

---

#### 3.3.2 Issuers and Claim Types

Credentials are only useful when the issuer is meaningful for the claim being made.

Different issuers are authoritative for different types of claims. DIAL therefore treats issuer recognition as claim-specific.

|Issuer type|Typical claim types|
|---|---|
|Telco issuer / Vodafone Identity Hub|SIM verification, number verification, network status, device connectivity, account-risk signals, fraud-risk signals|
|Enterprise issuer|employment, role, department, opco, internal ownership, agent ownership, device fleet membership|
|Device-security issuer|hardware integrity, secure element status, firmware integrity, anti-spoofing, device binding|
|Bank, custodian, or Canton institution|KYB, custody, account control, settlement eligibility, institutional status|
|Insurer|policy coverage, insured status, asset coverage, risk classification|
|Auditor or compliance issuer|audit status, compliance status, certification, control validation|
|Public or ecosystem issuer|ecosystem membership, partner status, developer status, reputation credential|

For example, Vodafone Identity Hub is meaningful for telco-related claims. It can attest that a number, SIM, account, network signal, or device-connectivity context has been verified.

Acme is meaningful for Acme’s internal claims. It can attest that `did:dial:acme:agent:grid-agent` belongs to Acme, or that `did:dial:acme:device:meter-1234` is part of Acme’s meter fleet.

A bank or Canton-connected institution is meaningful for institutional claims. It can attest that an enterprise passed KYB, that a custody relationship exists, or that an account is eligible for settlement.

No issuer is automatically authoritative for every claim. The credential layer depends on knowing which issuer is recognized for which claim type.

---

#### 3.3.3 Trust Registry

The Trust Registry records which issuers are recognized for which claim types.

It is the credential-layer counterpart to the Address Space Registry.

The Address Space Registry answers:

`Who controls this address space?`

The Trust Registry answers:

`Who is recognized to issue this type of claim?`

These are different questions.

Acme may control `.acme` and `+ACME`. That means Acme can create and manage addresses inside those address spaces. It does not mean Acme is trusted to issue every type of credential.

For example:

|Issuer|Recognized claim type|
|---|---|
|Vodafone Identity Hub|SIM verification, number verification, network status, account-risk signals|
|SecurePoint|hardware binding, firmware integrity, device-security status|
|Acme|internal agent ownership, device fleet membership, enterprise role claims|
|Canton-connected bank|KYB, custody relationship, settlement eligibility|
|Insurer|insurance coverage, insured asset status|

A verifier evaluates a credential in context.

If Vodafone Identity Hub issues a SIM verification credential, the verifier checks whether Vodafone Identity Hub is recognized for SIM verification.

If Acme issues a credential saying that `grid-agent.acme` belongs to Acme, the verifier checks whether Acme is recognized for internal agent ownership.

If Acme issues a credential saying that a bank account passed institutional KYB, the verifier does not accept that claim merely because Acme controls `.acme`. The verifier checks the Trust Registry and sees that KYB claims require a recognized institutional issuer.

The Trust Registry therefore prevents address-space control from being confused with claim authority.

---

#### 3.3.4 Credential Continuity

Credentials attach to the DIAL identity, not merely to the current address.

This preserves continuity when an address changes.

For example:

`john.de.vodafone → did:dial:vodafone:person:employee123398`

Later:

`john.ro.vodafone → did:dial:vodafone:person:employee123398`

The readable address changes because John’s organizational context changes. The credentials continue to attach to the same DID.

Some credentials remain valid across the move. Training history, employment history, completed compliance checks, and audit trails may continue to belong to the same subject.

Other credentials change. A Vodafone Germany role credential expires or is revoked. A Vodafone Romania role credential is issued. The credential layer captures this evolution without fragmenting the identity.

The same pattern applies to non-human subjects.

A device moves from one fleet to another.  
An agent moves from testing to production.  
An asset moves from uninsured to insured.  
An account moves from inactive to approved.  
A system moves from uncertified to certified.

The DID remains the stable subject. Credentials record the evolving facts around that subject.

---

#### 3.3.5 Privacy, Status, and Proof

Not every credential should expose its raw contents.

Some claims are safe to disclose directly. Others are sensitive.

For example, a verifier may need to know that:

- a person is currently employed by Vodafone;
- a SIM or number has been verified;
- a device is not high-risk;
- an enterprise has passed KYB;
- an asset is insured;
- an agent belongs to Acme;
- an account is eligible for settlement.

The verifier does not necessarily need to see the underlying HR record, SIM data, fraud signal, bank file, insurance policy, internal ownership document, or compliance file.

DIAL therefore separates the credential claim from the disclosure method. A credential can be referenced, checked, proven, or selectively disclosed depending on the sensitivity of the claim.

Credential status also matters. A credential may be:

- active;
- expired;
- suspended;
- revoked;
- superseded.

For public or low-sensitivity credentials, status may be checked directly. For sensitive credentials, the verifier may receive a proof that the relevant condition is satisfied without seeing the underlying data.

The infrastructure for private proof is described in Section 4. At the product-architecture level, the principle is that DIAL credentials are verifiable without requiring unnecessary disclosure of sensitive source data.

---

### 3.4 Authority

The authority layer defines what a DIAL identity is permitted to do.

The previous layers establish reference, continuity, and verified facts:

`Addressing → Identity → Credentials`

The address layer gives the subject a usable reference. The identity layer preserves the stable subject behind that reference. The credential layer records verified claims about that subject.

Authority is the next step. It defines permitted action.

This distinction matters because verified facts do not automatically create permission.

A credential may say that a person is employed by Vodafone Romania. Authority determines whether that person may approve supplier payments, access a settlement workflow, operate a device fleet, or act on behalf of Vodafone in a specific context.

A credential may say that `did:dial:acme:device:meter-1234` is a verified meter in Acme’s fleet. Authority determines whether that device may submit readings into a settlement workflow.

A credential may say that `did:dial:acme:agent:grid-agent` belongs to Acme. Authority determines whether that agent may trigger demand-response events, access device data, or initiate settlement instructions within defined limits.

Credentials answer:

`What has been verified about this identity?`

Authority answers:

`What is this identity permitted to do?`

In DIAL, authority is represented through **Authorization Credentials** or **Capability Credentials**. These are specialized credentials whose claim type is permission.

A factual credential says:

`This fact is true about this DID.`

An authorization credential says:

`This DID is permitted to perform this action on this target or resource under these conditions.`

However, an authorization credential alone does not decide every action. The credential carries a portable grant. The final authorization decision is made by the target system by evaluating that grant against its own policy, workflow state, limits, freshness requirements, and invocation proof.

The authority layer is therefore a join between:

1. a portable authorization credential;
    
2. a valid delegation chain;
    
3. root recognition through the Trust Registry where required;
    
4. required factual credentials;
    
5. target-side policy and state;
    
6. revocation and freshness checks; and
    
7. a signed invocation of the specific requested action.
    

This is the difference between portable authority and a simple permission lookup. DIAL should not require every target system to trust a live DIAL resolver returning `authorized = true` or `authorized = false`. A resolver may exist as a convenience layer, especially inside one enterprise domain, but the canonical authority model is verifiable, presentable, delegable, and portable across systems.

---

#### 3.4.1 Authorization Credential Model

An authorization credential defines a portable grant of permission from one DIAL identity to another.

It has the same general structure as other credentials: issuer, subject, claim, status, and proof. The difference is that the claim is an authority claim.

At minimum, an authorization credential defines:

|Element|Meaning|
|---|---|
|Grantor / issuer|The DID granting the authority.|
|Subject|The DID receiving the authority.|
|Target|The system, application, contract, workflow, environment, or domain where the authority applies.|
|Resource|The asset, device, account, dataset, fleet, workflow, contract, or object the authority applies to.|
|Action|The permitted action.|
|Scope|The context in which the permission applies.|
|Static limits|Bounds that can be verified from the credential itself, such as per-transaction ceiling, expiry, or resource scope.|
|Conditions|Credentials, statuses, relationships, or contextual requirements that must remain valid.|
|Expiry|When the authority ends.|
|Revocation status|Whether the authority is active, suspended, revoked, expired, or superseded.|
|Proof|Signature, delegation proof, capability proof, or other verification mechanism.|

Example:

|Element|Example|
|---|---|
|Grantor / issuer|`did:dial:acme:organization:energy-division`|
|Subject|`did:dial:acme:agent:grid-agent`|
|Target|`did:dial:acme:system:demand-response-platform`|
|Resource|`did:dial:acme:collection:meter-fleet-berlin`|
|Action|Trigger demand-response event|
|Scope|Berlin smart-meter fleet|
|Static limit|Maximum 10 events per credential period|
|Conditions|Agent ownership credential active; production approval credential active; meter fleet credential active|
|Expiry|31 December 2026|
|Revocation status|Active|
|Proof|Signed authorization credential with verifiable delegation chain|

This object is not merely a role label. It is a portable permission credential that a target system can verify.

The authorization credential proves that authority has been granted. The target system still evaluates whether the requested action is allowed in the current state of the workflow.

---

#### 3.4.2 Portable Grant and Target-Side Decision

Authority in DIAL has two sides.

The first side is the **portable grant**. This is the authorization credential that the subject presents, or that the target retrieves from a credential service. It proves that a grantor issued authority to the subject.

The second side is the **target-side decision**. This is the target system’s evaluation of the presented grant against its own policy and state.

This distinction is necessary because many authorization rules cannot live inside a credential held by the subject.

For example:

|Rule|Where it belongs|
|---|---|
|John may approve supplier payments up to EUR 50,000.|Portable authorization credential|
|John cannot approve a payment he created.|Target-side workflow policy and state|
|This payment requires two independent approvals.|Target-side policy and workflow state|
|John has already approved EUR 48,000 today.|Target-side counter or state accumulator|
|The request is a replay of an earlier approval.|Target-side invocation and nonce check|

The portable credential carries the grant. The target system applies the live decision logic.

This means authority is not only a credential that travels with the subject. It is the combination of:

`portable grant + target policy + target state + invocation proof`

For low-risk actions, a target may accept a simple, recently valid authorization credential. For high-value or stateful actions, the target checks additional live state, counters, separation-of-duty rules, and freshness requirements before allowing the action.

---

#### 3.4.3 Delegation Chain

Authority must be delegable.

A target system cannot verify only that an authorization credential exists. It must also verify that the grantor had the right to grant that authority.

For example, John cannot issue himself an authorization credential saying that he may approve supplier payments. The verifier must be able to trace the authority back to a valid root.

A delegation chain may look like this:

`Vodafone Group → Vodafone Romania → Finance Department → John`

Each link in the chain narrows authority. It does not widen it.

Vodafone Group may delegate finance authority to Vodafone Romania. Vodafone Romania may delegate supplier-payment authority to the Finance Department. The Finance Department may delegate payment-approval authority to John within defined limits.

A verifier checks the chain.

It asks:

1. Who is the root authority?
    
2. Is that root recognized for this authority domain?
    
3. Did the root delegate authority to the next party?
    
4. Did each delegate have the right to delegate further?
    
5. Did each delegation stay within the scope it received?
    
6. Does the final authorization cover the requested action?
    
7. Is every relevant credential, delegation, and status still valid?
    

This prevents self-granted authority and unauthorized widening of permissions.

---

#### 3.4.4 Root Recognition and the Trust Registry

Inside a single organization, the authority root may be clear. Vodafone controls Vodafone’s internal authority chain. Acme controls Acme’s internal authority chain.

Across organizations, this is not enough.

If a Vodafone-issued authorization is presented to a supplier system, the supplier must decide whether Vodafone is a recognized authority root for that target, action, or domain. This is a trust question, not merely an address-space question.

The Address Space Registry answers:

`Who controls this namespace or prefix?`

The Trust Registry answers:

`Which roots, issuers, or authorities are recognized for this claim or authority domain?`

For authority that crosses organizational boundaries, the Trust Registry is used to recognize authority roots.

Example:

|Authority root|Recognized domain|
|---|---|
|Vodafone Group|Vodafone employee authority and Vodafone-controlled workflows|
|VFRO|Vodafone Romania operational authority within delegated scope|
|Acme Energy Division|Acme grid-agent and smart-meter workflow authority|
|Canton-connected bank|Institutional settlement eligibility authority|
|Custodian|Custody and account-control authority|

This makes the authority chain portable across seams. A verifier accepts a delegation chain because it recognizes the root for the relevant authority domain.

---

#### 3.4.5 Conditions, Limits, and State

Authorization credentials are bounded.

Some bounds are **static**. They can be verified from the authorization credential itself.

Examples:

|Static bound|Example|
|---|---|
|Per-transaction limit|Approve payments up to EUR 50,000 per transaction|
|Expiry|Valid until 31 December 2026|
|Resource scope|Applies only to a specific account, fleet, system, or workflow|
|Geographic scope|Applies only to a specific opco, country, or region|
|Network scope|Applies only in a specific application, chain, or settlement environment|

Other bounds are **stateful**. They require the target system or another state source to evaluate current state.

Examples:

|Stateful bound|Required state|
|---|---|
|Cumulative limit|Amount already approved in the relevant period|
|Frequency limit|Number of actions already performed today|
|Separation of duties|Who created, reviewed, or approved the prior workflow step|
|Two-person approval|Whether another independent approval has been collected|
|Replay prevention|Whether the exact invocation has already been used|

DIAL authority therefore cannot be purely static.

A credential can say that John has authority to approve supplier payments up to a defined limit. But the procurement system must still check whether John created the payment, whether the cumulative limit has already been reached, whether the payment requires another approver, and whether the invocation is fresh.

The target system is where stateful rules are evaluated because the target system owns the relevant workflow state.

---

#### 3.4.6 Credential Conditions

Authority can depend on credentials remaining valid.

Examples:

|Authority|Required credential condition|
|---|---|
|A person may approve supplier payments.|Employment credential and finance-role credential remain active.|
|A device may submit meter readings.|Device credential and fleet-membership credential remain active.|
|An agent may trigger demand-response events.|Agent ownership credential and production-approval credential remain active.|
|An account may execute settlement.|KYB, custody, and settlement-eligibility credentials remain active.|
|An asset may enter an insured workflow.|Insurance credential remains active.|

If a required credential expires, is revoked, or fails a status check, the authorization no longer validates.

This allows DIAL authority to remain dynamic. Authority is not a one-time permission. It is a permission whose validity depends on current credentials, current status, current scope, and current limits.

---

#### 3.4.7 Revocation and Freshness

Authority needs lifecycle control.

An authorization credential may be:

- active;
    
- expired;
    
- suspended;
    
- revoked;
    
- superseded.
    

Revocation is especially important because permissions may need to be withdrawn immediately. A person may leave a role. An agent may be compromised. A device may fail verification. An account may lose eligibility. A system may lose certification.

Revocation must apply not only to the final authorization credential, but also to the delegation chain and required credential conditions.

For example, if Vodafone Group revokes Vodafone Romania’s delegated authority, then John’s leaf authorization no longer validates even if John’s own authorization credential still appears active. The chain above him has failed.

This creates a liveness requirement. A verifier must know whether the final credential, each relevant delegation link, and each required condition credential are still valid.

DIAL should therefore use freshness requirements based on risk and value.

Low-value or high-frequency actions may tolerate cached status for a short period. High-value or sensitive actions require fresher status checks.

Examples:

|Action type|Freshness requirement|
|---|---|
|Low-value device ping|Cached status may be acceptable within a defined window|
|Routine agent task|Recent status proof required|
|Supplier payment approval|Fresh status on authorization, delegation chain, and required credentials|
|Institutional settlement action|Fresh or near-real-time status and revocation check required|

The architecture should make staleness explicit. A verifier should know whether it is relying on a fresh check, a cached proof, or a short-lived authorization credential.

---

#### 3.4.8 Privacy and Verifiability

Authority can expose sensitive information.

A public authority graph may reveal internal reporting lines, approval limits, operational systems, payment workflows, device fleets, or security structure. Publishing full authority records in the clear would leak organizational intelligence.

DIAL therefore separates verifiability from full disclosure.

A verifier needs to know whether the presented authority is valid for the requested action. It does not always need to see every internal policy detail.

For example, a verifier may need to know:

`This DID has valid authority to approve this payment amount.`

It may not need to see:

- the employee’s full internal role structure;
    
- all approval limits;
    
- all internal reporting lines;
    
- the complete procurement policy;
    
- all other authorities held by the same person.
    

DIAL can therefore support privacy-preserving authority checks.

At the product-architecture level, the principle is:

`Authority should be verifiable without unnecessarily disclosing the full internal authority graph.`

The infrastructure layer can support this through commitments, revocation references, status proofs, short-lived credentials, and private proofs.

---

#### 3.4.9 Invocation Proof and Audit

A valid authorization credential must be bound to the specific action being requested.

Otherwise, a presented authority could be replayed or reused outside its intended context.

The acting wallet, key, agent, device, or system must sign an invocation that includes the relevant request details.

An invocation should include:

|Invocation element|Meaning|
|---|---|
|Subject DID|The identity attempting to act.|
|Target|The system or workflow receiving the request.|
|Action|The requested action.|
|Resource|The resource being acted on.|
|Parameters|Relevant request details, such as amount or workflow ID.|
|Nonce or challenge|Prevents replay.|
|Timestamp|Supports freshness and auditability.|
|Presented credentials|Credentials and authorization credentials used for the decision.|
|Signature|Proof that the current interaction surface initiated this request.|

For high-value actions, the signed invocation also becomes the audit artifact.

It records:

- who acted;
    
- through which DID;
    
- using which wallet, key, or interaction surface;
    
- under which authorization credential;
    
- under which delegation chain;
    
- with which required credentials;
    
- against which target and resource;
    
- at what time;
    
- with what result.
    

This gives DIAL authority a tamper-evident decision trail without reducing the model to a bare boolean response.

---

#### 3.4.10 Authority and Target Systems

Authority is checked when a DIAL identity tries to act in a target system.

A target system may be:

- an enterprise application;
    
- a payment system;
    
- a procurement workflow;
    
- a smart contract;
    
- an agent network;
    
- a device network;
    
- an institutional settlement workflow;
    
- an API;
    
- a backend system.
    

The target system starts from the interaction surface it sees.

For example, it may see a wallet signature, an API key, a device key, an agent signing key, or a DIAL Name.

The target system then resolves toward the DID and evaluates authority.

Example flow:

`wallet → VC with binding claim → DID → factual credentials → authorization credential → target policy and state → action`

For a payment approval, the target system checks:

1. Which DID is acting?
    
2. Is the wallet, key, or address-layer object bound to that DID?
    
3. What factual credentials does the DID present?
    
4. What authorization credential does the DID present for this action?
    
5. Does the delegation chain lead back to a recognized authority root?
    
6. Are the required credentials active?
    
7. Is the authorization active, unrevoked, in scope, fresh enough, and within limits?
    
8. Does the target’s own policy or state block the action?
    
9. Is the invocation signed, fresh, and bound to this exact request?
    
10. Is the final decision recorded for audit where required?
    

Only after those checks does the subject become an authorized actor in that context.

This completes the DIAL product architecture:
`Address → Identity → Credentials → Authority → Action`

The first three layers make the subject reachable, stable, and verified. The authority layer makes the subject permissioned and executable.

---

## 4. System Architecture: Components and Supporting Rails

The product architecture described above defines DIAL's conceptual model:

`Address → Identity → Credentials → Authority → Action`

The system architecture explains how this model is implemented across product services, registries, resolvers, network adapters, issuer integrations, user applications, enterprise administration tools, and payment or execution environments.

The central design principle is **network-agnostic addressability**. A DIAL address should remain intelligible to the user even when the underlying networks, wallets, settlement rails, proof systems, or execution environments change. The address is the portable point of interaction. Networks are resolution environments.

This means DIAL should not be presented as a Canton product, an Ethereum product, or a product of any single chain. Canton, Ethereum/EVM, Avalanche, NEAR, Midnight, Nillion, Allora, EnergyWeb, Chainlink-based infrastructure, and future systems are deployment surfaces. DIAL is the addressing, identity, credential, authority, routing, and product layer that sits above them.

### 4.1 System Components

The minimum DIAL system contains the following components.

| Component | Function |
|---|---|
| Address Space Registry | Records who controls namespaces and prefixes such as `.dial`, `.acme`, `+DIAL`, and `+ACME`. |
| Address Record Service | Creates and manages individual Names and Numbers inside controlled address spaces. |
| DIAL Directory / Resolver | Resolves DIAL addresses into DIAL identities, service endpoints, payment endpoints, network mappings, profile pages, and authority references. |
| DIAL DID Registry | Creates, updates, resolves, suspends, and revokes DIAL identities. |
| Identity Record Store | Maintains DID documents or equivalent DIAL identity records, including controllers, verification methods, service endpoints, relationships, and execution mappings. |
| Credential Orchestration Service | Coordinates credential issuance, storage, status checking, presentation, and selective disclosure. |
| Trust Registry | Records which issuers or authority roots are recognized for which claim types and authority domains. |
| Authority / Policy Engine | Evaluates authorization credentials, delegation chains, required credential conditions, freshness, limits, target policies, and invocation proofs. |
| Network Adapter Layer | Connects DIAL identities and addresses to supported networks, wallets, payment systems, proof systems, settlement environments, and messaging transports. |
| Retail Application Layer | Provides `.dial` address purchase, profile pages, modes, public request flows, social modules, and AI receptionist features. |
| Enterprise Application Layer | Provides namespace management, address issuance, organization directories, delegated administration, policy configuration, and managed infrastructure bundles. |
| Payment and Routing Service | Maps DIAL addresses to payment endpoints, request endpoints, wallet bindings, stablecoin flows, payment instructions, and future cross-network routing logic. |
| Audit and Event Log | Records changes to address records, identity records, credentials, authorities, resolver mappings, admin actions, and high-value invocations. |
| Billing and Commercial Logic | Manages address purchases, renewals, premium names, subscriptions, enterprise packages, AI usage, payment fees, and support tiers. |

These components can be implemented as separate services or as modules within a unified DIAL platform. The important architectural point is that they solve distinct problems and should remain separable.

### 4.2 Canonical Resolution Flow

A relying party normally starts with a DIAL address.

Example:

`finance.acme`

The resolver should be able to answer progressively richer questions:

1. Does this address exist?
2. Which address space controls it?
3. Who controls the address record?
4. Which DIAL identity does it resolve to?
5. What service endpoints are attached?
6. What payment or network endpoints are attached?
7. What credentials are available or provable?
8. Which issuers are recognized for those credentials?
9. What authority applies in the requested context?
10. Which action, if any, may proceed?

The canonical flow is:

`DIAL address → address record → DIAL identity → identity record → credentials → trust registry → authority → network endpoint → action`

For a retail profile, the flow may stop early:

`david.dial → profile page → request flow → receptionist → owner notification`

For a payment, it may continue to a payment endpoint:

`david.dial → DIAL identity → wallet/payment mapping → supported network → payment instruction`

For an enterprise workflow, it may continue to authority validation:

`finance.acme → DID → employment/role credentials → authorization credential → target policy → signed approval`

For a device or agent workflow, it may continue to machine execution:

`+ACME·0001·0042 → device DID → device credentials → authority credential → target system → data submission or action`

### 4.3 Network-Agnostic Resolution Layer

DIAL should use a network adapter pattern.

The DIAL resolver should not assume that every network exposes the same primitives. Some networks are account-based. Some are contract-based. Some are institutional ledgers. Some are privacy-preserving proof systems. Some are oracle or message-transport layers. Some are agent or data networks rather than settlement chains.

The resolver therefore maps DIAL identities to network-specific endpoints through adapter records.

| Adapter record field | Meaning |
|---|---|
| DIAL identity | The stable identity being mapped. |
| Network or environment | The target network, system, or infrastructure environment. |
| Endpoint type | Wallet, account, contract, custody account, settlement account, proof endpoint, device endpoint, API endpoint, or service endpoint. |
| Endpoint value | The actual technical address, account reference, contract address, DID, API URL, custody reference, or other endpoint identifier. |
| Binding credential | Credential proving that the endpoint is currently bound to the DIAL identity. |
| Status | Active, pending, suspended, revoked, expired, or superseded. |
| Policy reference | Conditions under which the mapping may be used. |
| Freshness requirement | How recent the binding or status proof must be for a given use case. |

This pattern makes the DIAL identity stable while allowing the technical endpoint to change. A user may rotate an EVM wallet. An enterprise may change its Canton account mapping. A device may move between fleets. An agent may receive a new signing key. DIAL preserves continuity by updating endpoint bindings rather than replacing the identity.

### 4.4 Current Deployment Matrix

The initial product strategy should distinguish between product scope and deployment availability.

| Product surface | Current deployment | Commercial meaning |
|---|---|---|
| Retail `.dial` address | Ethereum/EVM and Canton | Individuals, founders, creators, professionals, small teams, and Web3 users can buy a `.dial` address with a profile page and AI receptionist. |
| Enterprise DIAL namespace | Canton | Enterprises can receive a controlled namespace and participate through Vodafone/Pairpoint-managed Canton infrastructure rather than immediately operating their own dedicated node. |

This is a starting matrix, not the final architecture.

Over time, both retail and enterprise offerings can expand across additional networks and infrastructure ecosystems. Future integrations may include Midnight, NEAR, Nillion, Allora, EnergyWeb, Avalanche, Chainlink-based infrastructure, additional EVM environments, and other networks where trusted addressability is useful.

### 4.5 Canton Deployment

Canton is the first enterprise deployment surface because it is designed for institutional participation, privacy, permissioned workflows, and regulated digital asset environments.

In the near-term enterprise product, DIAL can be packaged with Vodafone/Pairpoint-managed Canton infrastructure.

The enterprise value proposition is:

`Enterprise namespace + managed network access + address issuance + identity and authority layer`

A company such as Acme can receive an enterprise namespace:

`.acme`

It can then issue addresses such as:

- `ceo.acme`
- `treasury.acme`
- `legal.acme`
- `supplier-payments.acme`
- `agent-01.acme`
- `meter-fleet.acme`

The enterprise can also receive a structured prefix:

`+ACME`

It can then issue operational Numbers such as:

- `+ACME·0001·0001`
- `+ACME·0001·0002`
- `+ACME·0200·4381`

These addresses can resolve to people, departments, accounts, systems, agents, devices, fleets, assets, or payment endpoints.

The managed infrastructure bundle is especially useful for enterprises that want to enter a network but do not yet want to apply for, operate, monitor, upgrade, and govern their own dedicated node. The multitenant node gives them a first operational path. DIAL gives them a usable address and identity layer on top of that infrastructure.

### 4.6 Ethereum and EVM Deployment

Ethereum and EVM networks are the first broad retail deployment surface because they already have large communities of wallets, users, developers, stablecoins, and public applications.

In the retail product, a user buys a `.dial` address such as:

`david.dial`

That address resolves first to an application-level profile page and later to one or more wallet, payment, or messaging endpoints.

The retail `.dial` address can support:

- public profile and verified links;
- latest posts or public updates;
- mode-aware profile states such as conference mode, hiring mode, fundraising mode, partnership mode, job-seeking mode, or closed mode;
- AI receptionist request intake and routing;
- wallet mappings;
- payment requests;
- stablecoin receiving instructions;
- cross-network address resolution as additional networks are added.

The user should not need to understand every network mapping to use the product. The user-facing primitive is the DIAL address. The resolver handles the network-specific mapping behind it.

### 4.7 Privacy and Private Proof Layer

DIAL should support both public profile use cases and sensitive institutional use cases.

For public profiles, the user may choose to display name, bio, links, social posts, public wallet addresses, documents, and contact modes. These are intentionally visible.

For institutional credentials and authority, full disclosure is often inappropriate. A verifier may need to know that an enterprise has passed KYB, a person has a valid role, a device is genuine, or an agent has authority, without receiving the full underlying file, internal role graph, fraud signal, bank record, or device-security report.

The privacy layer should therefore support:

- selective disclosure;
- status proofs;
- credential freshness proofs;
- proof of credential existence without raw data disclosure;
- proof of membership in an approved set;
- proof that an authority condition is satisfied;
- revocation and non-revocation proofs;
- policy-based disclosure rules.

Nillion or equivalent private-computation and private-proof systems can serve this role where appropriate. DIAL should treat privacy infrastructure as an adapter-capable proof layer rather than as the sole identity registry.

### 4.8 Chainlink and Cross-Network Transport

Some infrastructure is not best understood as a user-facing network. Chainlink-based integrations, for example, may provide cross-chain messaging, oracle delivery, proof transport, or workflow automation rather than a namespace where a user primarily holds an address.

DIAL should therefore distinguish between:

- **settlement networks**, where value or state is recorded;
- **identity or proof environments**, where credentials, proofs, or privacy-preserving claims are generated or verified;
- **message and transport infrastructure**, where instructions, proofs, or state updates move between environments;
- **application environments**, where users, agents, devices, or enterprise systems interact.

The DIAL resolver should not flatten all of these into one category. It should know which role each integration plays.

### 4.9 Security Model

DIAL's security model depends on clear separation between address control, identity control, credential authority, and action authority.

The system should assume that each layer can fail independently.

| Risk | Control |
|---|---|
| Address hijacking | Address-space registry, controller authentication, transfer locks, recovery rules, audit logs. |
| Incorrect endpoint binding | Binding credentials, endpoint verification, wallet/key challenge, status checks, revocation. |
| Fake credential issuer | Trust Registry, issuer onboarding, claim-type recognition, issuer revocation. |
| Stale credential | Credential status service, freshness windows, expiry, revocation checks. |
| Unauthorized delegation | Delegation-chain validation and root recognition. |
| Replay attack | Signed invocation, nonce, timestamp, target binding. |
| Over-disclosure | Selective disclosure, private proofs, role-based disclosure policy. |
| Spam and abuse | Rate limits, verification, reputation, paid priority requests, request scoring, address-level controls. |
| AI misrouting | Human confirmation for sensitive actions, audit trail, policy-constrained receptionist behavior. |

The most important rule is that a readable address is not sufficient proof of authority. `treasury.acme` may be a readable and controlled address. A target system must still verify the identity, credentials, delegation chain, endpoint binding, and invocation proof before allowing a sensitive action.

---

## 5. Product Surfaces

DIAL is a protocol-shaped product. It can be used as infrastructure, but the first commercial surfaces must be simple enough for users and enterprises to buy.

The near-term product should therefore be expressed through two product families:

1. **Retail DIAL** — `.dial` addresses for individuals, professionals, founders, creators, small teams, and Web3 users.
2. **Enterprise DIAL** — organization-owned namespaces and managed network access, initially bundled with Vodafone/Pairpoint-managed Canton infrastructure.

### 5.1 Retail DIAL: `.dial` Address

The retail product starts with a paid `.dial` address.

Examples:

- `david.dial`
- `adi.dial`
- `sarah.dial`
- `lionscraft.dial`

The address is the product anchor. It gives the user a memorable, portable public endpoint. The first utility attached to that endpoint is the DIAL profile page and AI receptionist.

A retail `.dial` address should include:

- address purchase and renewal;
- public profile page;
- social links;
- latest X and LinkedIn posts where supported;
- current mode card;
- optional wallet or payment address;
- optional Calendly or booking link;
- attachments such as deck, CV, job spec, portfolio, paper, or data room request link;
- mode-aware request routing;
- AI receptionist processing after basic verification;
- owner notifications by email, Telegram, or dashboard.

The product line is:

`Buy your .dial → publish your profile → route requests → receive payments → extend across networks`

### 5.2 DIAL Profile Page

The DIAL profile page is the public expression of a DIAL address.

It has two layers.

The **stable profile layer** contains information that does not change often:

- name;
- profile photo or avatar;
- role and organization;
- short bio;
- verified social links;
- website;
- wallet/payment settings;
- calendar link;
- connected social accounts;
- uploaded assets.

This layer should require login because it affects identity, verification, payment endpoints, and security.

The **dynamic mode layer** expresses what the user is open to right now.

Supported initial modes include:

| Mode | Purpose | Primary CTA |
|---|---|---|
| Conference Mode | The user is attending, speaking, sponsoring, or exhibiting at an event. | Request a meeting. |
| Fundraising Mode | The user or organization is raising capital or speaking with investors. | Request investor pack. |
| Hiring Mode | The user or organization is looking for candidates. | Apply or recommend someone. |
| Looking for Job Mode | The user is open to roles, projects, advisory work, or opportunities. | Send opportunity. |
| Partnership Mode | The user or organization is open to strategic collaborations. | Propose partnership. |
| Closed Mode | The user is limiting inbound access. | Request access or urgent route. |

The mode changes the page headline, CTA, attachments, request questions, routing rules, and receptionist instructions.

A profile page should not become a messy link tree. It should have one primary mode and one primary action, with secondary cards available where useful.

### 5.3 AI Receptionist

The AI receptionist is the mode-aware request and administration layer attached to a DIAL address.

It has two sides.

The **public side** receives requests from visitors. It should be structured, rate-limited, and protected against abuse. Public visitors should not receive unlimited free-form AI chat before they are verified. The public flow can feel conversational, but the early steps should be deterministic and inexpensive.

The **owner side** is where the richest AI experience should begin. The owner can talk to the receptionist through Telegram or another authenticated channel.

Examples:

- “Switch me to conference mode next week.”
- “I am speaking at WebX in Tokyo. Open me to telecom, Web3, and enterprise identity meetings.”
- “Close my DIAL until Monday.”
- “Turn on fundraising mode and attach the investor deck.”
- “I’m hiring a Web3 BD lead. Add the job spec to the page.”

The receptionist proposes a page update, shows a preview, and asks for confirmation before publishing.

The receptionist may update mode information through the authenticated messaging channel. Core identity fields, payment endpoints, connected accounts, uploaded documents, billing, and security settings should require login to DIAL.

### 5.4 Payments and Address Utility

The `.dial` address should become usable for payments and transaction routing.

In the first stage, payment utility can be simple:

- display a wallet address;
- show supported network and token information;
- allow copy/QR code;
- map the DIAL address to a verified payment endpoint;
- generate payment request links.

In later stages, DIAL can support richer payment resolution:

- send to a DIAL address;
- request payment from a DIAL address;
- resolve the best payment rail based on payer and recipient preferences;
- support stablecoin payments;
- support Canton settlement endpoints;
- support EVM wallet endpoints;
- support enterprise-controlled payment accounts;
- support agent-initiated payments under authority limits.

The design principle is that the address remains stable while the payment endpoint can change.

### 5.5 Enterprise DIAL

Enterprise DIAL gives an organization a controlled address space.

Example:

`.acme`

The organization can issue addresses such as:

- `ceo.acme`
- `finance.acme`
- `treasury.acme`
- `supplier.acme`
- `support.acme`
- `agent-01.acme`
- `device-fleet.acme`

It can also issue structured Numbers under a prefix:

`+ACME`

Enterprise DIAL should include:

- namespace and prefix issuance;
- admin console;
- delegated administration;
- employee, team, department, agent, device, asset, account, and system address management;
- credential issuer configuration;
- trust registry integration;
- authority and policy configuration;
- resolver and API access;
- audit logs;
- managed network access where bundled.

In the initial enterprise deployment, DIAL can be packaged with Vodafone/Pairpoint-managed Canton access. The customer receives a usable namespace and can participate through a multitenant node model without first applying for and operating a dedicated node.

Over time, enterprise DIAL should become network-agnostic in practice as well as in architecture. The same `.acme` namespace should be able to resolve across Canton, EVM, future supported networks, proof systems, agent networks, and device environments.

### 5.6 Developer and API Layer

DIAL should expose APIs so third-party applications can resolve addresses, verify credentials, check authority, and route requests.

Initial APIs may include:

| API | Function |
|---|---|
| Address lookup | Resolve a Name or Number into an address record. |
| Profile lookup | Retrieve public profile fields for a `.dial` address. |
| Endpoint lookup | Retrieve payment, messaging, or service endpoints subject to policy. |
| DID resolution | Resolve a DIAL DID into an identity record. |
| Credential status | Check whether a credential is active, expired, revoked, or superseded. |
| Trust registry query | Check whether an issuer is recognized for a claim type. |
| Authority check | Evaluate whether a DID has a valid grant for a requested action. |
| Invocation submission | Submit a signed action request for target-side evaluation. |
| Webhook/event API | Notify systems when address, credential, authority, or profile state changes. |

The API layer is where DIAL becomes infrastructure for applications beyond the native profile page.

---

## 6. Commercial Model

DIAL has two commercial motions: retail and enterprise.

### 6.1 Retail Revenue

Retail revenue can come from:

| Revenue line | Description |
|---|---|
| Address purchase | User buys a `.dial` address. |
| Annual renewal | User renews the address each year. |
| Premium names | High-value names can be priced differently. |
| Profile subscription | Paid public profile features, modes, social modules, and attachments. |
| AI receptionist subscription | Monthly or annual plan based on request volume, AI processing, and routing features. |
| Payment/routing fees | Fees on payment requests, payment routing, or premium transaction utilities. |
| Priority request fees | Optional paid contact or refundable signal to reduce spam and prioritize inbound. |
| Marketplace fees | Later fees from secondary transfer, leasing, or premium address auctions. |

The first paid MVP should not depend on all of these. The cleanest starting bundle is:

`Paid .dial address + public profile + modes + AI receptionist`

### 6.2 Enterprise Revenue

Enterprise revenue can come from:

| Revenue line | Description |
|---|---|
| Namespace issuance | Enterprise receives a controlled namespace such as `.acme`. |
| Namespace renewal | Annual or multi-year renewal of the namespace. |
| Per-address fees | Charges for issued employee, department, agent, device, asset, account, or system addresses. |
| Managed network access | Bundled access to supported infrastructure, initially through managed Canton access where applicable. |
| Admin console | Enterprise subscription for directory, policy, credential, and authority management. |
| Credential and proof volume | Usage-based pricing for credential issuance, status checks, proofs, and verifications. |
| Integration fees | Implementation, API integration, issuer onboarding, and custom workflow configuration. |
| Support and governance | Enterprise support, security review, audit support, and governance services. |

The short-term enterprise story is commercially strongest when DIAL is not sold as an abstract namespace alone. It should be bundled with a practical access problem:

`Enter the network + receive your enterprise address space + manage identities and authority`

### 6.3 Pricing Logic

Retail pricing should be simple enough for fast adoption. Enterprise pricing should reflect infrastructure, compliance, support, and integration requirements.

Retail pricing can be organized around:

- address tier;
- profile features;
- receptionist request volume;
- AI processing credits;
- payment utilities;
- premium support.

Enterprise pricing can be organized around:

- namespace size;
- number of issued addresses;
- managed infrastructure requirements;
- number of credential issuers;
- number of verifications/proofs;
- API volume;
- support level;
- custom integration complexity.

---

## 7. Roadmap

DIAL should present the roadmap as the progressive expansion of one address primitive.

The sequence is:

`Profile → Receptionist → Payments → Enterprise Namespace → Multi-Network Resolution → Agents and Things`

### Phase 1 — Paid Address and Profile MVP

The first retail MVP should prove that users will pay for a `.dial` address and share it publicly.

Features:

- `.dial` address purchase and renewal;
- public profile page;
- social links;
- X and LinkedIn latest-post modules where available;
- profile modes;
- mode-specific attachments;
- basic request routing;
- owner dashboard;
- notification email;
- Ethereum/EVM and Canton endpoint bindings where supported.

The success tests are:

1. users pay to claim addresses;
2. users publish or share the addresses;
3. visitors submit meaningful requests;
4. owners find the routed requests more useful than ordinary DMs, email, or generic contact forms.

### Phase 2 — AI Receptionist

The next phase turns the profile page into an active front desk.

Features:

- mode-aware request flow;
- verified sender intake;
- spam scoring;
- request summarization;
- owner inbox;
- owner-side Telegram receptionist;
- mode updates by conversation;
- preview and publish flow;
- priority request handling;
- basic analytics.

The key product rule is:

`No public AI before trust.`

Visitor-side flows should be structured and protected. Owner-side AI can be richer because the owner is authenticated and paying.

### Phase 3 — Payments and Network Utility

This phase makes the address economically useful.

Features:

- wallet mapping;
- payment endpoint resolution;
- stablecoin receiving instructions;
- payment requests;
- payment QR codes;
- Canton payment or settlement endpoint mapping where applicable;
- EVM wallet bindings;
- payment-status notifications;
- early cross-network routing rules.

The user-facing promise becomes:

`Send to david.dial`

or:

`Pay finance.acme`

### Phase 4 — Enterprise Namespace and Managed Access

This phase expands the enterprise product.

Features:

- enterprise namespace issuance;
- structured prefix issuance;
- admin console;
- delegated admin roles;
- address issuance for people, departments, agents, devices, assets, accounts, and systems;
- managed Canton access through Vodafone/Pairpoint infrastructure;
- credential issuer configuration;
- trust registry configuration;
- authority policy templates;
- audit and reporting.

The enterprise promise is:

`Your organization’s address layer, connected to the networks you use.`

### Phase 5 — Multi-Network Expansion

This phase extends DIAL across additional networks and infrastructure environments.

Potential integrations include:

- Midnight;
- NEAR;
- Nillion;
- Allora;
- EnergyWeb;
- Avalanche;
- Chainlink-based infrastructure;
- additional EVM networks;
- future institutional settlement environments.

DIAL should integrate each environment according to its function. Some networks will support payment. Some will support identity anchoring. Some will support privacy. Some will support data, oracle, message, or agent workflows. The resolver should model these differences rather than forcing every integration into the same category.

### Phase 6 — Agents, Devices, and the Economy of Things

The long-term roadmap extends DIAL beyond humans and organizations.

DIAL addresses can be assigned to:

- AI agents;
- device fleets;
- IoT endpoints;
- energy assets;
- telecom towers;
- vehicles;
- sensors;
- payment accounts;
- enterprise systems;
- autonomous workflows.

At this stage, DIAL becomes infrastructure for the economy of things.

An AI agent should be addressable, identifiable, credentialed, and authorized.

A device should be addressable, identifiable, credentialed, and authorized.

A machine transaction should be routed to the correct identity, checked against credentials and authority, and recorded with appropriate auditability.

---

## 8. Use Cases

### 8.1 Founder or Professional Profile

A founder buys:

`david.dial`

The address resolves to a public profile page.

The profile shows:

- name;
- role;
- organization;
- verified socials;
- latest LinkedIn and X posts;
- current mode;
- relevant attachments;
- request CTA.

In Conference Mode, the page says the founder is attending or speaking at upcoming events and is open to relevant meetings.

In Fundraising Mode, the page allows investors to request access to a deck.

In Hiring Mode, the page lets candidates or referrers submit relevant information.

The AI receptionist screens inbound requests, asks for missing context, summarizes the request, and routes it to the owner.

### 8.2 Enterprise Canton Onboarding

Acme wants to participate in Canton but does not want to operate its own node immediately.

Through the DIAL enterprise package, Acme receives:

- managed access through Vodafone/Pairpoint infrastructure;
- `.acme` namespace;
- optional `+ACME` prefix;
- admin console;
- address issuance tools;
- credential and authority framework.

Acme can create:

- `treasury.acme`;
- `legal.acme`;
- `supplier-payments.acme`;
- `agent-01.acme`;
- `+ACME·0001·0001`.

The addresses can resolve to Acme identities, accounts, departments, agents, devices, and systems.

### 8.3 Supplier Payment Approval

A supplier-payment workflow receives a signed approval from:

`john.ro.vodafone`

The system resolves the address to a DIAL DID.

It checks:

1. whether John’s current wallet or signing key is bound to that DID;
2. whether John has an active employment credential;
3. whether John has an active finance-role credential;
4. whether John has a valid authorization credential for supplier payments;
5. whether the delegation chain leads back to a recognized Vodafone authority root;
6. whether the amount is within limits;
7. whether John created the payment himself;
8. whether another independent approval is required;
9. whether the invocation is signed, fresh, and non-replayed.

Only then does the target system accept the action.

### 8.4 AI Agent Delegation

Acme deploys an AI agent:

`grid-agent.acme`

The agent has a DIAL DID:

`did:dial:acme:agent:grid-agent`

Acme issues credentials proving that the agent belongs to Acme and is approved for production use. Acme also issues an authorization credential allowing the agent to trigger demand-response events within a specific fleet, subject to limits.

When the agent attempts an action, the target system checks the agent’s identity, credentials, authority, delegation chain, target policy, and signed invocation.

This allows AI agents to act within defined authority rather than as opaque API keys or unmanaged service accounts.

### 8.5 Device and Fleet Verification

Acme operates a fleet of smart meters.

Each meter receives a structured DIAL Number:

`+ACME·0001·0042`

The Number resolves to a device DID.

The device receives credentials from recognized issuers proving device integrity, fleet membership, ownership, and operational status.

When the device submits a reading, the target system checks:

- device identity;
- endpoint binding;
- device-security credential;
- fleet membership;
- authority to submit readings;
- freshness and revocation;
- signed invocation.

This allows machine data to become more trustworthy without forcing every consuming system to integrate directly with every device-security provider.

---

## 9. Governance, Risk, and Compliance

DIAL needs governance because addressability, credentials, and authority create trust dependencies.

### 9.1 Address Governance

Address governance determines who can create, transfer, renew, suspend, or revoke address spaces and address records.

Governance questions include:

- who may control `.dial` names;
- how premium names are allocated;
- how organization names are reserved;
- how trademark or impersonation disputes are handled;
- how expired addresses are released;
- how compromised addresses are recovered;
- how enterprise namespaces are issued;
- how subordinate address issuance is delegated.

Retail address governance can use simpler rules. Enterprise address governance requires stronger verification, contract terms, and administrator controls.

### 9.2 Issuer Governance

Issuer governance determines who is recognized for which claim types.

This is the role of the Trust Registry.

DIAL should not treat all issuers as equal. A telco may be recognized for SIM and network claims. A bank may be recognized for KYB or custody claims. An employer may be recognized for employment and internal role claims. A device-security provider may be recognized for hardware-integrity claims.

The Trust Registry should support:

- issuer onboarding;
- claim-type mapping;
- issuer suspension;
- issuer revocation;
- recognition by domain;
- jurisdictional restrictions;
- audit history;
- relying-party views.

### 9.3 Authority Governance

Authority governance determines how permission roots are recognized, how delegation chains are validated, and how permissions are revoked.

Enterprise authority should generally begin with the enterprise’s own root authority for internal workflows. Cross-organization authority requires explicit recognition by the relying party, network, or trust framework.

Sensitive authority should be:

- scoped;
- time-limited;
- revocable;
- auditable;
- conditioned on active credentials;
- bound to signed invocations;
- evaluated against target-side policy and state.

### 9.4 Privacy and Data Minimization

DIAL should minimize unnecessary disclosure.

A verifier should receive only what it needs for the decision it is making.

For example, a relying party may need to know that a person is currently employed by Vodafone and has a valid role credential. It may not need to see the person’s full HR record, salary, internal reporting line, or complete employment file.

Privacy rules should apply differently across product surfaces.

Retail public profiles are intentionally public. Enterprise credentials and authority graphs are often sensitive. The system should keep those two visibility models separate.

### 9.5 Abuse, Spam, and AI Safety

DIAL profiles create public reachability. Public reachability creates abuse risk.

The first AI receptionist should therefore be designed as a gate rather than an open public chatbot.

Controls should include:

- structured first-contact flows;
- sender verification;
- rate limits;
- domain and IP controls;
- suspicious-link filtering;
- duplicate detection;
- disposable-email controls;
- owner-configured allowed topics;
- request scoring;
- paid or refundable priority signals where useful;
- clear audit logs for routed requests.

The AI should not be allowed to perform high-impact actions without owner confirmation or policy constraints. In the MVP, the receptionist should route, summarize, and update public mode information only after owner confirmation.

### 9.6 Regulated Activity Boundaries

DIAL can support payments, settlement endpoints, credentials, and authority. These features may interact with regulated environments depending on jurisdiction, asset type, user type, and transaction flow.

DIAL should separate:

- address ownership;
- profile publication;
- endpoint resolution;
- payment initiation;
- custody;
- settlement;
- regulated identity checks;
- issuer recognition;
- authority evaluation.

This separation helps preserve product flexibility and reduces the risk of describing DIAL as performing functions that are actually performed by regulated partners, custodians, banks, settlement networks, or enterprise systems.

---

## 10. Implementation Blueprint

The implementation should start with a narrow, paid, demonstrable product and then expand into the full architecture.

### 10.1 MVP Scope

The first MVP should include:

- paid `.dial` address claim;
- address record creation;
- public profile page;
- editable stable profile fields;
- mode cards;
- social links;
- dummy or connected latest-post modules;
- basic request flow;
- owner inbox or notification email;
- AI summary after sender verification;
- Telegram receptionist for owner-side mode updates;
- basic admin dashboard;
- audit log for profile and mode changes.

The MVP should avoid:

- unrestricted public AI chat;
- autonomous external posting;
- complex custody;
- full cross-chain routing;
- deep enterprise permission graphs;
- unmanaged sensitive document upload through Telegram;
- high-impact actions without confirmation.

### 10.2 Core Data Objects

A practical MVP schema can begin with:

| Object | Purpose |
|---|---|
| User | Owner account. |
| Address | `.dial` address or enterprise address record. |
| AddressSpace | Namespace or prefix. |
| Profile | Stable public profile fields. |
| Mode | Current and saved mode configurations. |
| Asset | Uploaded or linked document such as deck, CV, job spec, or paper. |
| SocialConnection | X, LinkedIn, Facebook, website, or other public link/integration. |
| Request | Visitor-submitted request. |
| ReceptionistConfig | Tone, routing rules, accepted topics, and mode-specific instructions. |
| Message | Conversation or request message. |
| Notification | Email, Telegram, or dashboard notification. |
| PaymentEndpoint | Wallet, account, or payment instruction mapping. |
| AuditEvent | Record of changes and sensitive actions. |

As the system matures, additional objects can be added for DIDs, credential records, issuer records, trust registry entries, authority credentials, endpoint bindings, proof records, and network adapters.

### 10.3 Minimum APIs

Initial APIs:

- `POST /addresses/claim`
- `GET /resolve/{address}`
- `GET /profiles/{address}`
- `POST /requests/{address}`
- `POST /requests/{id}/verify`
- `GET /owner/requests`
- `POST /modes/{address}/preview`
- `POST /modes/{address}/publish`
- `POST /telegram/webhook`
- `GET /payments/{address}`

Future APIs:

- `GET /did/{did}`
- `GET /credentials/status/{id}`
- `POST /credentials/present`
- `GET /trust-registry/issuers`
- `POST /authority/check`
- `POST /invocations`
- `GET /network-adapters/{network}/resolve`

### 10.4 Release Milestones

| Milestone | Outcome |
|---|---|
| M0 Prototype | Clickable profile and mode demo using mock data. |
| M1 Paid Retail MVP | Users can buy a `.dial`, publish a profile, and receive routed requests. |
| M2 Receptionist MVP | Owners can update modes through Telegram and receive AI summaries. |
| M3 Payment Mapping | Users can attach verified payment endpoints and display/request payments. |
| M4 Enterprise Pilot | Enterprise namespace issued with managed Canton access and admin console. |
| M5 Credential Pilot | Selected credentials can be issued, checked, and displayed/proven. |
| M6 Authority Pilot | Delegated authority can be modeled and checked for limited workflows. |
| M7 Multi-Network Expansion | Additional network adapters added for selected ecosystems. |

---

## 11. Open Design Questions

Several design questions should be resolved before production-scale deployment.

1. **Root registry model** — Which records must be anchored onchain, which can be maintained in controlled databases, and which require multiple registries?
2. **DIAL DID method** — Should `did:dial` be a full DID method from the start, or should DIAL initially use existing DID methods with a DIAL resolver overlay?
3. **Address transferability** — Can `.dial` addresses be transferred, sold, leased, or delegated, and under what restrictions?
4. **Premium name policy** — How are high-value names, trademarks, institutional names, and reserved terms handled?
5. **Enterprise namespace verification** — What KYB or authorization process is required before issuing `.acme` or equivalent namespaces?
6. **Credential issuer onboarding** — Who approves issuers for each claim type, and how is issuer recognition revoked?
7. **Privacy architecture** — Which proofs require private-computation infrastructure, which can use ordinary credential status checks, and which should remain offchain?
8. **Payment routing liability** — What does DIAL verify when resolving a payment endpoint, and what remains the responsibility of the payer, wallet, custodian, or settlement network?
9. **AI receptionist boundaries** — Which actions can the receptionist perform automatically, which require owner confirmation, and which require dashboard login?
10. **Enterprise admin delegation** — How does an organization delegate address issuance, credential issuance, and authority grants without creating uncontrolled internal sprawl?

These questions do not block the MVP. They define the path from a paid address/profile product toward a full identity, credential, authority, and economy-of-things platform.

---

## 12. Conclusion

DIAL starts from a simple product idea: a user or organization should be able to own a usable address.

That address should be more than a profile link. It should resolve to identity, credentials, authority, payment endpoints, request routing, and eventually the agents, devices, assets, and machines that participate in digital economies.

The short-term product is concrete. Retail users can buy `.dial` addresses that come with public profile pages, current modes, social updates, payment endpoints, and an AI receptionist. Enterprise customers can receive organization-owned namespaces and, in the first deployment, use DIAL together with Vodafone/Pairpoint-managed Canton infrastructure.

The long-term architecture is broader. DIAL is a network-agnostic address layer. It can resolve across Canton, Ethereum/EVM, and future supported networks and infrastructure systems. It can carry identities based on open standards, credentials from recognized issuers, and authority that is scoped, revocable, portable, and auditable.

As AI agents, devices, systems, and machines become economic participants, each will need a way to be reached, identified, verified, permissioned, and held accountable. DIAL provides the address layer for that future.

The path is therefore:

`human-readable address → trusted identity → verified credentials → delegated authority → executable participation`

DIAL makes trusted participation portable.
