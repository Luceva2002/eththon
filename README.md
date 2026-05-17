# 🏆 Eththon — ETH Rome 2025 (Arbitrum & 1inch Bounty Winners!)

> *Splitwise meets Farcaster, but in Web3. The winning project for the Arbitrum and 1inch bounties at the Rome hackathon.*

## 🍕 The Experience: 48 Hours of Code, Caffeine, and Web3

This project is not just a repository; it's the result of an intense weekend at **ETH Rome**. The goal was ambitious: take the convenience of a bill-splitting app (like Splitwise), combine it with decentralized social dynamics (like Farcaster), and run it all on a Web3 architecture—without sacrificing a smooth, modern user experience.

After 48 sleepless hours spent debugging components, integrating smart contracts, and polishing the UI, we presented **Eththon**. Our focus on optimization paid off: we conquered the **official Arbitrum and 1inch bounties**! 🚀 

For an app designed to split bills and manage micro-transactions, integrating a Layer 2 like Arbitrum (to drastically reduce gas fees) and an aggregator like 1inch (to handle token swaps efficiently) was the winning move. This repository contains the scaffold of the project that led us to win these prizes.

---

## 💻 The Project

A modern web platform for splitting expenses among groups of friends, built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui. 

### 🚀 Key Features
* ✅ **Hybrid Authentication**: Traditional login system alongside crypto wallet connection support.
* 📊 **Smart Dashboard**: A comprehensive overview of all groups with aggregated statistics and balances.
* 👥 **Group Management**: Create and manage groups to split expenses fairly.
* 💰 **Expense Tracking**: Real-time monitoring of who owes what and who is owed funds.
* 🔗 **Wallet Integration**: Direct connection of crypto wallets (currently mocked for the demo UI).
* 📱 **Responsive Design**: Adaptive mobile-first UI, perfect for splitting the bill right from your smartphone after a dinner.
* ♿ **Accessibility**: Focus on keyboard navigation and screen reader support through accessible ARIA labels.

---

## 🛠️ Tech Stack

* **Framework:** Next.js 15 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS 4
* **UI Components:** shadcn/ui (Radix UI)
* **Icons:** Lucide React
* **State Management:** React hooks + localStorage (Mock state management)
* **Web3 Integration (Hackathon Focus):** Arbitrum (L2 Scaling), 1inch (DEX Aggregator)

---

## 🚀 Installation and Setup

### Prerequisites
* Node.js 18+ 
* npm or yarn

### Setup
```bash
# Clone the project and navigate to the directory
cd ethton

# Install dependencies
npm install

# Start the development server
npm run dev
