# Epic E16 — Internationalization (Spanish / English)

> Branch: `traduccion`. All new text, keys and documentation are written in English.
> Spanish stays the default language; English is added as the second language.

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

> Needs checking before estimating: whether every service already returns a stable
> error code, or only a Spanish message. If only text, the services need codes first.

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
| **Total** | **37** | |

Suggested order: HU-070, HU-079, HU-071, HU-072, HU-073, HU-074, HU-075, HU-077, HU-076, HU-078.
