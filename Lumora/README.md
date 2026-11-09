# Lumora

> **Through every moment, keep the light.**

Lumora is a private mobile support and memory-preservation application designed for people and families navigating illness together.

It provides a safe shared space where patients, family members, and invited caregivers can support one another, record meaningful moments, complete daily check-ins, and preserve memories.

Lumora is **not a medical, hospital, or social-media application**. It focuses on emotional support, family connection, coping, and preserving meaningful moments.

## Features

- User registration and login with Supabase Authentication
- Role-based experiences for:
  - Patient
  - Family Member
  - Caregiver
- Private Lumora Spaces for invited members
- **Lightbook** for recording meaningful moments
  - Title
  - Caption
  - Occasion
  - Location
  - Date
  - Photo
  - Private or shared visibility
- Shared family timeline
- Daily emotional check-ins
- Reactions and comments on shared content
- Role-aware support and coping information
- Profile and privacy settings
- Theme preferences
- Sign out
- Persistent backend data using Supabase

## Technology Stack

- **React Native**
- **Expo**
- **Expo Router**
- **TypeScript**
- **Supabase**
  - Authentication
  - PostgreSQL database
  - Row Level Security (RLS)
- **React Native Web** for the web version

## Project Structure

```text
Lumora/
├── src/
│   ├── app/
│   │   ├── (tabs)/
│   │   ├── comments/
│   │   └── ...
│   ├── components/
│   └── lib/
├── assets/
├── IMPLEMENTATION_PLAN.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Installation

### Prerequisites

Make sure you have:

- Node.js installed
- npm installed
- Expo CLI available through the project dependencies
- A Supabase project

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Lumora
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root.

Add:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

These values are available from the Supabase project settings/API keys.

**Do not add Supabase secret/service-role keys to the application or commit them to GitHub.**

### 4. Start the application

Start Expo with:

```bash
npx expo start
```

Then choose the platform you want to use.

### Web

```bash
npx expo start --web
```

### Android

```bash
npx expo start --android
```

### iOS

```bash
npx expo start --ios
```

## Environment Variables

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | URL of the Lumora Supabase project |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable API key used by the client |

Only the publishable key should be exposed to the client application. Database access is protected through Supabase authentication and Row Level Security policies.

## Database

Lumora uses Supabase for persistent application data.

The main tables include:

- `profiles`
- `lumora_spaces`
- `space_members`
- `memories`
- `check_ins`
- `comments`
- `reactions`

User authentication is handled through Supabase Auth.

## Test Login

### Test Account

Use the following account for demonstration/testing:

```text
Email: <TEST_ACCOUNT_EMAIL>
Password: <TEST_ACCOUNT_PASSWORD>
Role: Patient
```

> Replace the placeholders above with the test account created for the demonstration before submitting the repository.

If a test account has not been created, create one through the application's registration flow and use those credentials for the evaluation.

## Testing

TypeScript can be checked with:

```bash
npx tsc --noEmit
```

The project also uses Expo's development tooling for validation.

## Implementation

Lumora was developed incrementally according to the project's implementation plan.

The development process was divided into phases covering:

1. Project foundation
2. Application onboarding and navigation
3. Core Lumora experiences
4. Lightbook and meaningful moments
5. Daily check-ins and support
6. Backend integration
7. Authentication and persistent data
8. Final testing and refinement

The detailed implementation process is documented in:

```text
IMPLEMENTATION_PLAN.md
```

## Privacy & Permissions

Lumora is designed around private spaces and role-based access.

Patients control their Lumora Space and invitations. Family members can participate according to their permissions, while caregivers have a more limited invited role.

Private content is intended to remain accessible only to the appropriate user, while shared content can appear in the shared family experience.

Supabase Row Level Security is used to protect database access.

## Current Scope

Lumora focuses on the core experience required for the project demonstration:

- Authentication
- Lumora Spaces
- Role-based experiences
- Lightbook
- Shared timeline
- Daily check-ins
- Support resources
- Persistent Supabase data
- Privacy and access controls

Future development could include additional production hardening, expanded testing, and further accessibility and platform-specific refinements.

---

**Lumora — Through every moment, keep the light.**