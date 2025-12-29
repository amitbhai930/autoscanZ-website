// ================= CONFIG =================
const BACKEND_URL = "https://autoscanz-backend.onrender.com";

// Simple delay helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ================= MAIN =================
document.addEventListener("DOMContentLoaded", function () {

  console.log("AutoScanZ main.js loaded");

  // =====================================================
  // SCAN PAGE
  // =====================================================
  const scanBtn = document.getElementById("scanBtn");
  const statusEl = document.getElementById("status");

  if (scanBtn && statusEl) {
    scanBtn.addEventListener("click", async function () {

      const targetInput = document.getElementById("target");
      const target = targetInput.value.trim();

      if (!target) {
        statusEl.innerText = "Please enter a domain or IP.";
        return;
      }

      statusEl.innerText = "Starting scan… backend may take 20–30 seconds.";

      let response;

      // First attempt
      try {
        response = await fetch(`${BACKEND_URL}/api/scans`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target })
        });
      } catch (e) {
        console.warn("First request failed, retrying...");
      }

      // Retry once after delay (Render cold start)
      if (!response || !response.ok) {
        statusEl.innerText = "Waking backend… retrying scan";
        await sleep(20000);

        try {
          response = await fetch(`${BACKEND_URL}/api/scans`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ target })
          });
        } catch (e) {
          statusEl.innerText = "Backend not reachable. Try again later.";
          return;
        }
      }

      let data;
      try {
        data = await response.json();
      } catch {
        statusEl.innerText = "Invalid backend response.";
        return;
      }

      if (!data.scan_id) {
        statusEl.innerText = data.error || "Scan failed.";
        return;
      }

      statusEl.innerText = "Scan complete. Redirecting…";
      window.location.href = `results.html?scan_id=${data.scan_id}`;
    });
  }

  // =====================================================
  // RESULTS PAGE
  // =====================================================
  const resultsDiv = document.getElementById("results");

  if (resultsDiv) {
    const params = new URLSearchParams(window.location.search);
    const scanId = params.get("scan_id");

    if (!scanId) {
      resultsDiv.innerText = "No scan ID provided.";
      return;
    }

    resultsDiv.innerText = "Loading scan results…";

    fetch(`${BACKEND_URL}/api/scans/${scanId}`)
      .then(res => res.json())
      .then(data => {
        if (!data || !data.target) {
          resultsDiv.innerText = "Scan not found.";
          return;
        }

        let html = `
          <h3>Target: ${data.target}</h3>
          <p>Total Open Ports: ${data.total_open_ports}</p>
          <hr />
        `;

        if (!data.open_ports || data.open_ports.length === 0) {
          html += "<p>No open ports detected.</p>";
        } else {
          data.open_ports.forEach(p => {
            html += `<p>Port ${p.port} (${p.service}) — OPEN</p>`;
          });
        }

        resultsDiv.innerHTML = html;
      })
      .catch(() => {
        resultsDiv.innerText = "Failed to load results.";
      });
  }

  // =====================================================
  // HISTORY PAGE
  // =====================================================
  const historyDiv = document.getElementById("history");

  if (historyDiv) {
    historyDiv.innerText = "Loading scan history…";

    fetch(`${BACKEND_URL}/api/scans`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) {
          historyDiv.innerText = "No scans found.";
          return;
        }

        let html = "<ul>";

        data.forEach(scan => {
          html += `
            <li style="cursor:pointer; margin-bottom:8px;"
                data-id="${scan.scan_id}">
              ${scan.target} — ${scan.total_open_ports} ports
            </li>
          `;
        });

        html += "</ul>";
        historyDiv.innerHTML = html;

        historyDiv.querySelectorAll("li").forEach(item => {
          item.addEventListener("click", function () {
            const id = this.getAttribute("data-id");
            window.location.href = `results.html?scan_id=${id}`;
          });
        });
      })
      .catch(() => {
        historyDiv.innerText = "Failed to load scan history.";
      });
  }

});
