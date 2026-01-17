const content = document.getElementById("content");
let currentTab = "leads";

document.getElementById("extract").onclick = () => {
  chrome.runtime.sendMessage({ action: "START_EXTRACTION" });
};

document.querySelectorAll("#tabs button").forEach(btn => {
  btn.onclick = () => {
    currentTab = btn.dataset.tab;
    render();
  };
});

document.getElementById("search").oninput = render;

chrome.storage.onChanged.addListener(() => render());

function render() {
  chrome.storage.local.get("salesforce_data", (res) => {
    content.innerHTML = "";

    if (!res.salesforce_data) {
      content.innerHTML = "<small>No data yet</small>";
      return;
    }

    const data = res.salesforce_data;
    const items = data[currentTab] || [];
    const query = document.getElementById("search").value.toLowerCase();

    //  GLOBAL SEARCH (ALL OBJECTS)
    let searchableItems = items;
    if (query) {
      searchableItems = Object.values(data)
        .flat()
        .filter(v => typeof v === "object")
        .filter(item =>
          JSON.stringify(item).toLowerCase().includes(query)
        );
    }

    // 🕒 LAST SYNC
    if (data.lastSync && data.lastSync[currentTab]) {
      const sync = document.createElement("div");
      sync.innerHTML = `<small>Last Sync: ${data.lastSync[currentTab]}</small><hr>`;
      content.appendChild(sync);
    }

    if (searchableItems.length === 0) {
      content.innerHTML += "<small>No records found</small>";
      return;
    }

    searchableItems.forEach(item => {
      const div = document.createElement("div");
      div.style.border = "1px solid #ccc";
      div.style.margin = "5px 0";
      div.style.padding = "5px";

      div.innerHTML = `
        <b>${item.name || item.subject}</b><br>
        ${
          currentTab === "opportunities"
            ? `<small>Stage: ${item.stage} | Probability: ${item.probability}%</small><br>`
            : ""
        }
        <button class="delete-btn">Delete</button>
      `;

      div.querySelector("button").onclick = () => deleteItem(item.id);
      content.appendChild(div);
    });
  });
}

function deleteItem(id) {
  chrome.storage.local.get("salesforce_data", (res) => {
    res.salesforce_data[currentTab] =
      res.salesforce_data[currentTab].filter(i => i.id !== id);
    chrome.storage.local.set({ salesforce_data: res.salesforce_data });
  });
}

render();
