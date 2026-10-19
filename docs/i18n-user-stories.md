# Epic E16 — Internationalization (Spanish, English, French, Portuguese)

> Branch: `traduccion`. All new text, keys and documentation are written in English.
> Spanish stays the default language; English is the second language; French and Portuguese (Brazil) come after.

## Why

The app is written entirely in Spanish: about 26 screens and 28 components contain
text that is hard-coded in the source, and there is no i18n library yet
(`package.json` has neither `i18next` nor `expo-localization`). Users outside
Spanish-speaking countries (the tariff catalog already covers Ecuador and the
United States) cannot use the app comfortably.

## Screen inventory (what has to be translated)

Counts are an approximate number of lines with visible text, found by searching
the source. They are a guide for estimating, not an exact string count.

| Area | Screens / components | Approx. text lines |
|------|----------------------|--------------------|
| Auth | Login, Register, VerifyEmail, ForgotPassword, ResetPassword, AuthLayout, PasswordStrengthMeter | 67 |
| Profile | Profile, ChangePassword, DeleteAccount, AppearanceSection | 55 |
| Places | Places, CreatePlace, EditPlace, PlaceCard, placeForm, SelectField | 43 |
| Dashboard and cost | PlaceDashboard, PlaceTariff, CostCard, ConsumptionCard | 35 |
| Devices | LinkDevice, PlaceDevice, DeviceWifiSetup, DeviceStatusCard | 35 |
| Valve | ValveHistory, ValveCard, CloseValveDialog | 12 |
| Notifications | Notifications, NotificationPreferences, NotificationItem | 15 |
| Tips | Tips, TipsPanel | 9 |
| Navigation | MainNavigator, AppShell, Splash | 26 |
| Admin | AdminDevices, AdminDeviceDetail, AdminDeviceCreate, AdminUsers, AdminMetrics, AdminTips, CredentialsSheet, TipFormDialog | 130 |
| Domain and core | Messages and labels in `src/domain` (13 files) and `src/core` (3 files) | not counted |

## Stories

### HU-070 — i18n infrastructure

> **As** a developer
> **I want** a translation layer with one dictionary per language
> **so that** no screen has hard-coded text

```gherkin
Scenario: default language
  Given the device language is Spanish
  When the app starts
  Then every text is shown in Spanish

Scenario: English device
  Given the device language is English
  When the app starts
  Then every translated text is shown in English

Scenario: unsupported language
  Given the device language is neither Spanish nor English
  When the app starts
  Then Spanish is used

Scenario: missing key
  Given a key exists in Spanish but not in English
  When that text is shown
  Then the Spanish text is shown instead of the raw key
```

| Field | Value |
|-------|-------|
| Story Points | 5 |
| Priority | Must Have |
| Service(s) | frontend |
| Dependencies | none |

---

### HU-071 — Language selector

> **As** a user
> **I want** to choose the app language from my profile
> **so that** I can use the app in the language I understand best

```gherkin
Scenario: change language
  Given I am on the Profile screen
  When I choose English
  Then all visible texts change to English without restarting the app

Scenario: remembered choice
  Given I chose English
  When I close and reopen the app
  Then the app opens in English

Scenario: no stored choice
  Given I never chose a language
  When I open the app
  Then the device language is used
```

| Field | Value |
|-------|-------|
| Story Points | 3 |
| Priority | Must Have |
| Service(s) | frontend |
| Dependencies | HU-070 |

---

### HU-072 — Translate account and access screens

> **As** an English-speaking user
> **I want** the login, registration, verification and password recovery screens in English
> **so that** I can create and recover my account

```gherkin
Scenario: all auth texts translated
  Given the language is English
  When I open Login, Register, Verify email, Forgot password and Reset password
  Then titles, labels, placeholders, buttons, hints and validation messages are in English

Scenario: password strength
  Given the language is English
  When I type a password
  Then the strength meter shows its level in English
```

| Field | Value |
|-------|-------|
| Story Points | 3 |
| Priority | Must Have |
| Service(s) | frontend |
| Dependencies | HU-070 |

---

### HU-073 — Translate places, dashboard and tariffs

> **As** an English-speaking user
> **I want** places, the consumption dashboard and the tariff screens in English
> **so that** I understand my consumption and cost

```gherkin
Scenario: places and dashboard
  Given the language is English
  When I open Places, Create place, Edit place and the dashboard
  Then all texts are in English

Scenario: tariffs and cost
  Given the language is English
  When I open the tariff screen and the cost card
  Then labels, units and help texts are in English
```

| Field | Value |
|-------|-------|
| Story Points | 5 |
| Priority | Must Have |
| Service(s) | frontend |
| Dependencies | HU-070 |

---

### HU-074 — Translate devices and valve

> **As** an English-speaking user
> **I want** the device linking, Wi-Fi setup and valve screens in English
> **so that** I can link my meter and control the water safely

```gherkin
Scenario: device screens
  Given the language is English
  When I open Link device, Place device and Wi-Fi setup
  Then all texts and status labels (Connected, Disconnected, Never reported) are in English

Scenario: valve confirmations
  Given the language is English
  When I close the valve
  Then the confirmation dialog, the card and the history are in English
```

| Field | Value |
|-------|-------|
| Story Points | 3 |
| Priority | Must Have |
| Service(s) | frontend |
| Dependencies | HU-070 |

---

### HU-075 — Translate profile, notifications and tips

> **As** an English-speaking user
> **I want** my profile, notifications and saving tips in English
> **so that** I can manage my account and read alerts

```gherkin
Scenario: profile and account actions
  Given the language is English
  When I open Profile, Change password and Delete account
  Then all texts and confirmations are in English

Scenario: notifications
  Given the language is English
  When I open the notification center and the preferences
  Then screen texts are in English
```

| Field | Value |
|-------|-------|
| Story Points | 3 |
| Priority | Should Have |
| Service(s) | frontend |
| Dependencies | HU-070 |

---

### HU-076 — Localized error messages from the services

> **As** an English-speaking user
> **I want** error messages from the services in my language
> **so that** I understand what went wrong

```gherkin
Scenario: known error
  Given the language is English
  When a service answers with a known error code (for example account locked)
  Then the app shows the message for that code in English

Scenario: unknown error
  Given the service answers with a code the app does not know
  When the error is shown
  Then a generic message in the current language is shown
```

> Checked: every service answers with a stable code in the `title` of the Problem Details
> body (for example `auth.account_locked`), so the translation lives only in the app and no
> service had to change. Texts written by the services themselves (notification title and body,
> the tariff disclaimer) and the content of the tips stay in the language they were written in.

| Field | Value |
|-------|-------|
| Story Points | 5 |
| Priority | Should Have |
| Service(s) | frontend, ms-iam and the other services (to be confirmed) |
| Dependencies | HU-070 |

---

### HU-077 — Locale-aware numbers, dates and currency

> **As** a user
> **I want** dates, liters and money in the format of my language
> **so that** the numbers are easy to read

```gherkin
Scenario: number format
  Given the language is English
  When consumption is shown
  Then decimals use a point and thousands use a comma

Scenario: date format
  Given the language is English
  When a date is shown in history or alerts
  Then it follows the English date format
```

| Field | Value |
|-------|-------|
| Story Points | 3 |
| Priority | Should Have |
| Service(s) | frontend |
| Dependencies | HU-070 |

---

### HU-078 — Translate the admin screens

> **As** an administrator who speaks English
> **I want** the admin screens in English
> **so that** I can manage users, devices and tips

```gherkin
Scenario: admin screens
  Given the language is English
  When I open the admin users, devices, device detail, metrics and tips screens
  Then all texts, table headers and dialogs are in English
```

| Field | Value |
|-------|-------|
| Story Points | 5 |
| Priority | Could Have |
| Service(s) | frontend |
| Dependencies | HU-070 |

---

### HU-079 — Translation completeness check

> **As** a developer
> **I want** an automatic test that compares both dictionaries
> **so that** a missing translation is caught before merging

```gherkin
Scenario: missing translation
  Given a key exists in the Spanish dictionary but not in the English one
  When the tests run
  Then the test fails and names the missing key

Scenario: complete dictionaries
  Given both dictionaries have the same keys
  When the tests run
  Then the test passes
```

| Field | Value |
|-------|-------|
| Story Points | 2 |
| Priority | Should Have |
| Service(s) | frontend |
| Dependencies | HU-070 |

---

### HU-080 — Number, date and money formats for French and Portuguese

> **As** a French or Portuguese speaking user
> **I want** numbers, dates and prices written the way my language writes them
> **so that** I read my consumption and my bill without confusion

```gherkin
Scenario: number format by language
  Given the language is Spanish, Portuguese, English or French
  When consumption is shown
  Then Spanish and Portuguese use "1.234,5", English uses "1,234.5" and French uses "1 234,5"

Scenario: price typed in the French way
  Given the language is French
  When I type "5 234,50" in the tariff field
  Then the price is 5234.5

Scenario: dates
  Given the language is French or Portuguese
  When a date is shown in history or alerts
  Then it follows the format of fr-FR or pt-BR
```

| Field | Value |
|-------|-------|
| Story Points | 2 |
| Priority | Should Have |
| Service(s) | frontend |
| Dependencies | HU-077 |

---

### HU-081 — French

> **As** a French speaking user
> **I want** the whole app in French
> **so that** I can use it in my language

```gherkin
Scenario: choose French
  Given I am on the Profile screen
  When I choose Français
  Then every translated text changes to French without restarting the app

Scenario: French device
  Given the device language is French and I never chose a language
  When I open the app
  Then the app opens in French

Scenario: complete dictionary
  Given a key exists in Spanish but not in French
  When the tests run
  Then the test fails and names the missing key
```

| Field | Value |
|-------|-------|
| Story Points | 8 |
| Priority | Could Have |
| Service(s) | frontend |
| Dependencies | HU-070, HU-080 |

---

### HU-082 — Portuguese (Brazil)

> **As** a Portuguese speaking user
> **I want** the whole app in Portuguese
> **so that** I can use it in my language

```gherkin
Scenario: choose Portuguese
  Given I am on the Profile screen
  When I choose Português
  Then every translated text changes to Portuguese without restarting the app

Scenario: Portuguese device
  Given the device language is Portuguese (Brazil or Portugal) and I never chose a language
  When I open the app
  Then the app opens in Portuguese

Scenario: complete dictionary
  Given a key exists in Spanish but not in Portuguese
  When the tests run
  Then the test fails and names the missing key
```

| Field | Value |
|-------|-------|
| Story Points | 8 |
| Priority | Could Have |
| Service(s) | frontend |
| Dependencies | HU-070, HU-080 |

---

## Summary

| Story | SP | Priority |
|-------|----|----------|
| HU-070 i18n infrastructure | 5 | Must |
| HU-071 Language selector | 3 | Must |
| HU-072 Account and access | 3 | Must |
| HU-073 Places, dashboard, tariffs | 5 | Must |
| HU-074 Devices and valve | 3 | Must |
| HU-075 Profile, notifications, tips | 3 | Should |
| HU-076 Service error messages | 5 | Should |
| HU-077 Numbers, dates, currency | 3 | Should |
| HU-078 Admin screens | 5 | Could |
| HU-079 Completeness check | 2 | Should |
| HU-080 Formats for French and Portuguese | 2 | Should |
| HU-081 French | 8 | Could |
| HU-082 Portuguese (Brazil) | 8 | Could |
| **Total** | **55** | |

Suggested order: HU-070, HU-079, HU-071, HU-072, HU-073, HU-074, HU-075, HU-077, HU-076, HU-078.

## Status

All stories are implemented in branch `traduccion`. Two tests guard the result:

- `src/i18n/tests/dictionaries.test.ts` compares both dictionaries key by key (HU-079).
- `src/i18n/tests/noHardcodedSpanish.test.ts` scans the source and fails if a text with Spanish
  letters is written outside the dictionary.

Known limits: the text of server notifications, the tariff disclaimer and the content of the tips
are produced by the services or by the administrator, so they are shown as they were written.
