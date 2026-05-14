# Invoicaty iOS App — Build Guide

## Overview
Invoicaty iOS app wraps the live website (invoicaty.com) inside a native iOS shell using Capacitor.
This means all features (auth, invoices, quotations, drafts) work exactly as the web version.

### Native Features Added:
- 🔔 Push Notifications (via APNs)
- 🔐 Face ID / Touch ID support (ready)
- 📱 Native Splash Screen
- 🎨 Custom Status Bar
- ⌨️ Keyboard handling

---

## Prerequisites
- **macOS** with **Xcode 15+** installed
- **Node.js 18+**
- **Apple Developer Account** (Organization — pending D-U-N-S)
- **CocoaPods** (usually pre-installed with Xcode)

---

## First Time Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Sync Capacitor with iOS
```bash
npm run cap:sync
```

### 3. Open in Xcode
```bash
npm run cap:open
```
This opens the iOS project in Xcode.

### 4. In Xcode:
1. Select your **Team** (your Apple Developer account) in:
   - Project → Signing & Capabilities → Team
2. Set **Bundle Identifier**: `com.invoicaty.app`
3. Set **Display Name**: `Invoicaty`
4. Select a **simulator** or your **physical iPhone**
5. Press **▶ Run** (Cmd+R)

---

## Building for App Store

### 1. Sync before building
```bash
npm run cap:sync
```

### 2. In Xcode:
1. Select **Product → Archive**
2. In Organizer, click **Distribute App**
3. Choose **App Store Connect**
4. Follow the upload wizard

### 3. In App Store Connect:
1. Create new app with Bundle ID `com.invoicaty.app`
2. Fill in app details, screenshots, description
3. Submit for review

---

## App Store Submission Checklist

### Required Assets:
- [ ] App Icon (1024×1024) — already in project
- [ ] Screenshots (6.7" iPhone, 6.5" iPhone, iPad — at least 2 sizes)
- [ ] App description (English + Arabic)
- [ ] Privacy Policy URL
- [ ] Support URL (invoicaty.com)

### App Store Info:
- **App Name**: Invoicaty
- **Subtitle**: Professional Invoices & Quotations
- **Category**: Business
- **Secondary Category**: Finance
- **Bundle ID**: com.invoicaty.app
- **Price**: Free

### Privacy:
- **Data collected**: Email address, name (for account creation)
- **Data linked to identity**: Yes (email, invoices)
- **Tracking**: No
- **Third-party SDKs**: Google Ads (analytics only)

---

## Updating the App
Since the app loads the live website, most updates happen automatically.
For native changes (splash screen, push config, etc.):
1. Make changes
2. Run `npm run cap:sync`
3. Archive and submit new version in Xcode

---

## Project Structure
```
ios/
├── App/
│   ├── App/
│   │   ├── AppDelegate.swift    # iOS entry point
│   │   ├── Info.plist           # App permissions & config
│   │   ├── Assets.xcassets/     # Icons & splash images
│   │   └── Base.lproj/         # Storyboards
│   ├── App.xcodeproj/          # Xcode project
│   └── CapApp-SPM/             # Capacitor Swift Package Manager
├── capacitor.config.json        # Capacitor config (root)
└── www/                         # Redirect page (loads live URL)
```
