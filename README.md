# 🏦 Unity Capital Bank - Next-Generation Digital Banking Platform

A modern, responsive, institutional-grade online banking web application built with a high-fidelity fintech design system.

---

## ✨ Features & Architecture

### 1. 💼 Multi-Profile Financial Command Center
- **Personal Wealth Elite**: Elena Rostova (`$70,560.75` across Checking, High-Yield Vault, and Global Travel).
- **Commercial Corporate**: TechFlow Dynamics LLC (`$342,180.00` across Operating Checking, Payroll Escrow, and Treasury Vault).
- **Privacy Mode**: One-click balance masking (`••••••••`) for secure viewing in public.
- **Full State Persistence**: Real-time `localStorage` synchronization for deposits, transfers, card freezes, bills, and goals.

### 2. 💸 Transfers & Payments Suite
- **Unity Pay (Instant P2P)**: Send instant funds to contacts or handles (`@alex.r`, `@emily.w`, etc.).
- **Account-to-Account (Internal)**: Shift funds seamlessly between Checking and the 4.85% APY Vault.
- **Domestic ACH & Wire**: Complete Routing & Account number settlement with fee breakdown.
- **SWIFT & International FX**: Real-time mid-market currency exchange rates (USD, EUR, GBP, JPY, CAD, CHF, AUD).
- **Frequent Beneficiaries**: Quick-select contacts carousel with "+ Add Payee" modal.
- **Digital Electronic Advice / Receipts**: Generated printable receipts with official reference IDs for every transaction.

### 3. 📸 Optical Mobile Check Deposit
- Interactive simulated check scanner for check front and endorsed back.
- Real-time optical verification and immediate balance credit.

### 4. 💳 Interactive 3D Cards Hub & Virtual Card Generator
- **3D Card Flip**: Click cards or flip button to inspect back face, CVV security codes, and magnetic strip.
- **Instant Freeze / Unfreeze**: Real-time frosted ice security lockout.
- **Interactive Limit Sliders**: Live adjustable daily ATM withdrawal and online spending limits.
- **Virtual Card Engine**: One-click generation of disposable digital cards for safe web checkouts.

### 5. 🎯 High-Yield Vaults & Savings Goals
- **4.85% APY Daily Compound Yield**: Automated yield calculations and monthly projection previews.
- **Visual Progress Trackers**: Dedicated goals for travel, emergency safety nets, and automotive purchases.
- **One-Click Deposits**: Quick funds allocation directly from checking into vaults.

### 6. 🧾 Bill Pay & Automated Subscriptions
- Track recurring monthly bills (AWS Cloud, Fiber Telecom, Anthem Health Insurance, Electric).
- One-click instant payment execution with real-time checking account deduction.

### 7. 🏛️ Financing & Mortgage Calculator
- Dynamic sliders for Loan Principal, Interest APR (2.0% - 18.0%), and Term (1 - 30 Years).
- Instant breakdown of monthly payment, total interest paid, and total repayment amount.

### 8. 📊 Spend Analytics & Cash Flow Visuals
- High-DPI canvas charts tracking monthly inflow vs. outflow.
- Category breakdowns (Travel, Hardware, Groceries, Dining, Wellness).

### 9. 🤖 Unity AI Banker (In-App Assistant)
- Context-aware virtual banker analyzing current balance, spending patterns, card controls, and vault growth.
- Floating drawer with quick-prompt chips.

---

## 🚀 How to Run the Website

### Option 1: One-Click PowerShell Web Server (Recommended)
Open PowerShell in this folder and run:
```powershell
.\serve.ps1
```
This starts a local development server at `http://localhost:8080` (or `8081`) and automatically launches your browser.

### Option 2: Open Directly in Any Browser
Double-click `index.html` or right-click `index.html` -> **Open with Google Chrome / Microsoft Edge / Firefox**. No build steps, Node.js, or external tools required!

---

## 📁 Project Structure

```
unity-capital-banking/
├── index.html         # Master single-page banking application
├── serve.ps1          # Zero-dependency local web server
├── README.md          # Project documentation
├── css/
│   └── styles.css     # Design system, glassmorphism, 3D card flips, responsive styles
└── js/
    ├── store.js       # Central reactive state management & localStorage persistence
    ├── cards.js       # 3D cards engine, flip animation, limit sliders, virtual card creator
    ├── transfers.js   # Money movement engine, P2P, SWIFT, mobile check deposit
    ├── assistant.js   # Unity AI Banker intelligent chat agent
    ├── ui.js          # DOM rendering, modals, toast system, loan calculator, chart
    └── app.js         # Application bootstrap & reactive event listeners
```
