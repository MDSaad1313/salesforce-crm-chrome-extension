# Salesforce CRM Data Extractor – Chrome Extension

## Overview

This Chrome Extension extracts data from Salesforce CRM objects (Leads, Contacts, Accounts, Opportunities, Tasks) using DOM scraping and stores it locally using Chrome Extension APIs.

The project focuses on:

- Chrome Extension Manifest V3 architecture
- Content scripts and service worker messaging
- Salesforce Lightning DOM handling
- Local storage design and data integrity
- Popup dashboard for viewing and managing extracted data

API/SOQL integration is intentionally avoided as per assessment instructions.

---

## Folder Structure

salesforce-crm-extractor/
│
├── manifest.json # Chrome Extension configuration (Manifest V3)
├── service_worker.js # Background service worker for message passing
├── content_script.js # Salesforce DOM extraction logic
│
├── popup/
│ ├── popup.html # Popup dashboard UI
│ ├── popup.css # Popup styling
│ └── popup.js # Popup logic (tabs, search, delete)
│
└── README.md # Project documentation

---

## Installation Steps

1. Clone the repository:

   ```bash
   git clone <your-github-repo-url>

   ```

2. Open Chrome and go to:

   chrome://extensions

3. Enable Developer Mode (top-right).

4. Click Load unpacked and select the project folder.

5. Open Salesforce (Lightning Experience or Classic).

6. Click the extension icon to open the popup dashboard.

### How Extraction Works

-User opens a Salesforce record (Lead, Contact, Account, Opportunity, or Task).
-User clicks "Extract Current Object" in the popup.
-The service worker sends a message to the content script.
-The content script:
-Detects the Salesforce object type
-Extracts field values from the DOM
-Extracts Salesforce Record ID from the URL
-Data is saved to chrome.storage.local.
-Popup dashboard updates automatically.

### DOM Selection Strategy

Salesforce Lightning uses a dynamic DOM that changes frequently.
To handle this safely:

Field values are extracted using field labels (e.g., "Name", "Email", "Stage").

The script searches for matching label text and reads the associated value element.

A fallback mechanism (page title) is used if a field is not found.

Salesforce Record ID is extracted from the URL and used as a stable unique identifier.

This approach balances reliability and simplicity without relying on internal Salesforce APIs.

# Storage Schema

All data is stored using **chrome.storage.local.**

{
"salesforce_data": {
"leads": [],
"contacts": [],
"accounts": [],
"opportunities": [],
"tasks": [],
"lastSync": {
"leads": "timestamp",
"contacts": "timestamp",
"accounts": "timestamp",
"opportunities": "timestamp",
"tasks": "timestamp"
}
}
}

#### Data Integrity

Salesforce Record ID (sfId) is used for deduplication.

Existing records are updated instead of duplicated.

Records can be deleted individually from the popup.

### Popup Dashboard Features

Tabs for Leads, Contacts, Accounts, Opportunities, Tasks

Global search across extracted data

Delete individual records

"Extract Current Object" action button

Last sync timestamp per object type

Opportunities display stage and probability

Real-time updates using chrome.storage.onChanged

#### Shadow DOM Visual Feedback

During extraction, a small status indicator is injected into the Salesforce page using Shadow DOM to:

Avoid CSS conflicts

Show progress, success, or failure

Indicate detected object type

#### Future Improvements

Automatic pagination handling

CSV / JSON export

Stronger selectors for complex Salesforce layouts

Kanban view extraction
