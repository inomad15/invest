# Investment Dashboard Blueprint

## Overview
A modern investment dashboard providing real-time market indicators, crypto fear & greed index, and daily AI-generated briefings.

## Features
- **Morning Briefing:** AI-generated summary of market conditions.
- **Market Indicators:** Real-time tracking of Bitcoin, Ethereum, Palantir, Tesla, S&P 500, Nasdaq, and **USD/KRW Exchange Rate**.
- **Crypto Fear & Greed Index:** Visual gauge of market sentiment.
- **Latest Market News:** Curated list of relevant news.
- **Editor's Letter:** Featured analysis and opinion pieces.
- **Google AdSense:** Integrated for monetization.
- **Legal Compliance:** Privacy Policy and Terms of Service pages.

## Design
- **Modern UI:** Clean, dark-themed interface with card-based layout.
- **Responsive:** Optimized for both desktop and mobile viewing.
- **Interactive:** Visual gauges and hover effects for better engagement.
- **Branding:** Integrated `theinvestai_logo.jpg` in the navigation bar for a professional identity.
- **Navigation:** Consistent header and footer with essential links.

## Current Task: AdSense Policy Compliance Remediation
Resolve "Google-served ads on screens without publisher content" policy violation.

### Steps
1. Remove AdSense script tags from `privacy.html`, `terms.html`, and `about.html` to avoid "low value content" flags.
2. Remove auto-loading AdSense script from `index.html` head.
3. Implement dynamic AdSense loading in `main.js` to ensure ads only appear after the main briefing content is successfully rendered.

## Previous Tasks
### KST Date Synchronization
### Upgrade to Gemini 3 Model
### Fix Morning Briefing Model
Address the 404 error in Gemini API by updating the model name and library version.

## Previous Tasks
### Dashboard Enhancement
Add real-time USD/KRW exchange rate information to the dashboard for broader market insights.

## Previous Tasks
### Logo Replacement & Background Matching
Update the site with the newly uploaded logo and ensure it blends perfectly with the background.

### Steps
1. Replace the existing logo with the new `theinvestai_logo.jpg`.
2. Adjust CSS to ensure the logo background matches the site's dark theme.
3. Verify the logo size and positioning.

## Previous Tasks
### Google AdSense Integration
Add the Google AdSense script to the `<head>` of all HTML files and create `ads.txt` for crawler verification.

### Steps
1. Add the AdSense script to `index.html`.
2. Add the AdSense script to `editors-letter.html`.
3. Add the AdSense account verification meta tag to all HTML files.
4. Create `ads.txt` with publisher information.


## Previous Tasks
### Branding Update
Update the application title and main header to "The Invest AI: AI Briefing & Insights" to create a more professional and modern identity.

Move the "Editor's Letter" button to a position above the "Market Indicator Dashboard" header to improve its visibility and prominence.
The goal is to update the `.idx/dev.nix` file to enable a preview server using `npm run start` as requested, ensuring the development environment is correctly set up.
