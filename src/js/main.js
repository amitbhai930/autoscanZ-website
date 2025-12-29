// ================= CONFIG =================
const API_URL = "https://autoscanz-backend-1.onrender.com";

// Sleep helper
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ================= VALIDATION =================
function normalizeTarget(input) {
  return input
    .trim()
    .replace(/^https?:\/\//i, "")
    .split("/")[0];
}

function isValidTarget(value) {
  const domain =
    /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  const ip =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/;
  return domain.test(value) || ip.test(value);
}

// ================= MAIN =================
document.addEventListener("DOMContentLoaded", () => {

  const scanBtn = document.getElementById("scanBtn");
  const statusEl = document.getElementById("status");
  const spinner = document.getElementById("spinner");

  // ================= SCAN =================
  if (scanBtn) {
    scanBtn.onclick = async () => {
      const input = document.getElementById("target").value;
      const target = normalizeTarget(input);

      if (!isValidTarget(target)) {
        statusEl.innerText = "Invalid domain or IP.";
        return;
      }

      spinner.style.display = "block";
      statusEl.innerText = "Starting scan…";

      let res;
      try {
        res = await fetch(`${API_URL}/api/scans`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target })
        });
      } catch (err) {
        console.error(err);
        statusEl.innerText = "Backend unreachable.";
        spinner.style.display = "none";
        return;
      }

      const data = await res.json();
      if (!data.scan_id) {
        console.error(data);
        statusEl.innerText = "Scan failed.";
        spinner.style.display = "none";
        return;
      }

      pollScan(data.scan_id);
    };
  }

  // ================= POLLING =================
  async function pollScan(id) {
    while (true) {
      await sleep(3000);
      const res = await fetch(`${API_URL}/api/scans/${id}`);
      const data = await res.json();

      if (data.error) {
        console.error(data.error);
        statusEl.innerText = "Scan error.";
        spinner.style.display = "none";
        return;
      }

      statusEl.innerText =
        `Scanning… ${data.progress || 0}%`;

      if (data.status === "completed") {
        window.location.href =
          `results.html?scan_id=${id}`;
        return;
      }

      if (data.status === "error") {
        statusEl.innerText = "Scan failed.";
        spinner.style.display = "none";
        return;
      }
    }
  }

  // ================= RESULTS =================
  const resultsDiv = document.getElementById("results");
  if (resultsDiv) {
    const id =
      new URLSearchParams(location.search).get("scan_id");

    fetch(`${API_URL}/api/scans/${id}`)
      .then(r => r.json())
      .then(data => {
        if (!data.target) {
          resultsDiv.innerText = "Not found.";
          return;
        }

        let html = `<h3>${data.target}</h3>`;
        html += `<p>Status: ${data.status}</p><hr/>`;

        if (!data.open_ports.length) {
          html += "<p>No open ports.</p>";
        } else {
          data.open_ports.forEach(p => {
            html += `<p>Port ${p.port} (${p.service})</p>`;
          });
        }

        resultsDiv.innerHTML = html;
      })
      .catch(err => {
        console.error(err);
        resultsDiv.innerText = "Load failed.";
      });
  }

  // ================= HISTORY =================
  const historyDiv = document.getElementById("history");
  if (historyDiv) {
    fetch(`${API_URL}/api/scans`)
      .then(r => r.json())
      .then(scans => {
        if (!scans.length) {
          historyDiv.innerText = "No scans.";
          return;
        }

        historyDiv.innerHTML =
          scans.map(s => `
            <div>
              <b>${s.target}</b> (${s.status})
              <button data-id="${s.scan_id}">Delete</button>
            </div>
          `).join("");

        historyDiv.querySelectorAll("button")
          .forEach(btn => {
            btn.onclick = async () => {
              await fetch(
                `${API_URL}/api/scans/${btn.dataset.id}`,
                { method: "DELETE" }
              );
              location.reload();
            };
          });
      })
      .catch(err => {
        console.error(err);
        historyDiv.innerText = "History load failed.";
      });
  }
});
