// This script runs INSIDE Salesforce web pages
// It reads the page DOM and extracts data
// 
// 
// 
// 
console.log("Salesforce Content Script Loaded");

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "EXTRACT_DATA") {
    startExtraction();
  }
});

/* =========================
   MAIN CONTROLLER
========================= */
function startExtraction() {
  showStatus("Detecting Salesforce object...");

  const type = detectObjectType();
  if (!type) {
    showStatus("Unsupported Salesforce page ");
    return;
  }

  showStatus(`Extracting ${type}...`);

  let record;
  if (type === "leads") record = extractLead();
  if (type === "contacts") record = extractContact();
  if (type === "accounts") record = extractAccount();
  if (type === "opportunities") record = extractOpportunity();
  if (type === "tasks") record = extractTask();

  saveRecord(type, record);
  showStatus(`${type} saved `);
}

/* =========================
   OBJECT DETECTION
========================= */
function detectObjectType() {
  const url = location.href.toLowerCase();
  if (url.includes("/lead")) return "leads";
  if (url.includes("/contact")) return "contacts";
  if (url.includes("/account")) return "accounts";
  if (url.includes("/opportunity")) return "opportunities";
  if (url.includes("/task")) return "tasks";
  return null;
}

/* =========================
   SAFE TEXT READER
========================= */
function getTextByLabel(label) {
  const spans = Array.from(document.querySelectorAll("span"));
  const labelSpan = spans.find(s => s.innerText.trim() === label);
  if (!labelSpan) return "";

  const valueSpan = labelSpan.closest("div")?.querySelector("a, span");
  return valueSpan ? valueSpan.innerText.trim() : "";
}

/* ====================================≠≠=======================
   EXTRACTION Functions - Lead,Contact,Account,Opportunity,Task
================================================================ */

function extractLead() {
  return {
    id: Date.now(),
    name: getTextByLabel("Name") || document.title,
    email: getTextByLabel("Email"),
    phone: getTextByLabel("Phone"),
    status: getTextByLabel("Lead Status"),
    owner: getTextByLabel("Lead Owner")
  };
}

function extractContact() {
  return {
    id: Date.now(),
    name: getTextByLabel("Name") || document.title,
    email: getTextByLabel("Email"),
    phone: getTextByLabel("Phone"),
    account: getTextByLabel("Account Name"),
    owner: getTextByLabel("Contact Owner")
  };
}

function extractAccount() {
  return {
    id: Date.now(),
    name: getTextByLabel("Account Name") || document.title,
    industry: getTextByLabel("Industry"),
    revenue: getTextByLabel("Annual Revenue"),
    owner: getTextByLabel("Account Owner")
  };
}

function extractOpportunity() {
  return {
    id: Date.now(),
    name: getTextByLabel("Opportunity Name") || document.title,
    stage: getTextByLabel("Stage"),
    probability: getTextByLabel("Probability") || "0",
    amount: getTextByLabel("Amount"),
    closeDate: getTextByLabel("Close Date"),
    account: getTextByLabel("Account Name")
  };
}

function extractTask() {
  return {
    id: Date.now(),
    subject: getTextByLabel("Subject") || document.title,
    status: getTextByLabel("Status"),
    priority: getTextByLabel("Priority"),
    relatedTo: getTextByLabel("Related To"),
    assignee: getTextByLabel("Assigned To")
  };
}

/* =========================
   STORAGE 
========================= */
function saveRecord(type, record) {
  chrome.storage.local.get("salesforce_data", (res) => {

    const data = res.salesforce_data || {
      leads: [],
      contacts: [],
      accounts: [],
      opportunities: [],
      tasks: [],
      lastSync: {}
    };

    const list = data[type];
    const index = list.findIndex(r => r.id === record.id);

    if (index === -1) list.push(record);
    else list[index] = record;

    data.lastSync[type] = new Date().toLocaleString();
    chrome.storage.local.set({ salesforce_data: data });
  });
}

/* =========================
   SHADOW DOM STATUS
========================= */
function showStatus(text) {
  let box = document.getElementById("sf-status");

  if (!box) {
    box = document.createElement("div");
    box.id = "sf-status";
    const shadow = box.attachShadow({ mode: "open" });

    const el = document.createElement("div");
    el.style.cssText =
      "position:fixed;bottom:20px;right:20px;background:black;color:white;padding:10px;border-radius:6px;z-index:99999;";
    shadow.appendChild(el);
    document.body.appendChild(box);
  }

  box.shadowRoot.firstChild.textContent = text;
}
