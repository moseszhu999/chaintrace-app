# 02 Registration and Login Requirements

## Login and registration relationship

Wallet login and business registration are different.

A user first connects a wallet. If the wallet is not registered, the user can only register a business role. If the wallet is already registered, the system reads the permanent role and enters that role's workspace.

## Registration rules

| Rule | Requirement |
|---|---|
| Wallet first | Registration starts after wallet connection. |
| One wallet, one role | A wallet can bind only one business role on ChainTrace. |
| Role is permanent | Once selected, the role cannot be changed. |
| Role determines workspace | Different roles see completely different business workspaces. |
| Strong warning before confirmation | Users must understand that the selected role is permanent. |
| Wrong role handling | In MVP, wrong-role users use another wallet to register again. |

## Pre-registration wallet state

| State | Meaning |
|---|---|
| Wallet connected | The user controls the wallet. |
| Not registered | No ChainTrace business identity exists for this wallet. |
| No role | No business role is attached. |
| No business functions | The user can only complete registration. |

## Post-registration wallet state

| State | Meaning |
|---|---|
| Wallet connected | The returning user controls the wallet. |
| Registered | The wallet has a ChainTrace business identity. |
| Role locked | The role is fixed forever for this wallet. |
| Workspace entered | The user enters the role-specific business workspace. |

## Input principle

Use fixed choices wherever possible.

Dropdown/select inputs should be used for country/region, language, role, account type, institution type, trade region, currency, business category, financing type, service region, and similar standardized values.

Manual input is allowed only for information that cannot be standardized well, such as detailed address, display name, contact person, email, phone, company name, notes, and explanations.

## Common registration fields

| Field | Required | Input method |
|---|---:|---|
| Wallet address | Yes | Auto-detected |
| Role | Yes | Fixed option |
| Country/region | Yes | Dropdown |
| Common language | Yes | Dropdown |
| Account type | Yes | Dropdown |
| Display name | Yes | Manual input |
| Contact email | Yes | Manual input |
| Agent work mode | Yes | Fixed option |
| Detailed address | Optional or role-dependent | Manual input |
| Contact person | Optional or role-dependent | Manual input |
| Phone | Optional | Manual input |

## Explicitly deferred

Pre-login marketing/display pages are not part of this step.
