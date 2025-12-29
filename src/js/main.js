// ================= CONFIG =================
const BACKEND_URL = "https://autoscanz-backend-1.onrender.com";

// Sleep helper (Render cold start)
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Domain / IP validation
function normalizeTarget(input) {
  let value = input.trim();

  // Remove protocol if present
  value = value.replace(/^https?:\/\//i, "");

  // Remove path, query, fragment
  value = value.split("/")[0];

  return value;
}

function isValidTarget(value) {
  const domainRegex =
    /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

  const ipRegex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/;

  return domainRegex.test(value) || ipRegex.test(value);
}
// ================= MAIN =================
document.addEventListener("DOMContentLoaded", function () {

  console.log("AutoScanZ main.js loaded");

  /* =====================================================
     DARK / LIGHT MODE (NIGHT MODE)
  ===================================================== */
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "light") {
    document.body.classList.add("light");
    if (themeToggle) themeToggle.textContent = "🌙";
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("light");
      const isLight = document.body.classList.contains("light");
      themeToggle.textContent = isLight ? "🌙" : "☀️";
      localStorage.setItem("theme", isLight ? "light" : "dark");
    });
  }

  /* =====================================================
     SCAN PAGE LOGIC + SPINNER
  ===================================================== */
  const scanBtn = document.getElementById("scanBtn");
  const statusEl = document.getElementById("status");
  const spinner = document.getElementById("spinner");

  if (scanBtn && statusEl) {
    scanBtn.addEventListener("click", async function () {

      const targetInput = document.getElementById("target");
     let rawInput = targetInput.value;

let target = normalizeTarget(rawInput);

if (!target || !isValidTarget(target)) {
  statusEl.innerText =
    "Please enter a valid domain or IP (example.com or 8.8.8.8)";
  return;
}

      statusEl.innerText =
        "Starting scan… backend may take ~30 seconds (free tier).";

     if (spinner) spinner.style.display = "block";

      let response = null;

      // First request (wake backend)
      try {
        response = await fetch(`${BACKEND_URL}/api/scans`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target })
        });
      } catch {
        console.warn("Initial request failed, retrying…");
      }

      // Retry once
      if (!response || !response.ok) {
        statusEl.innerText = "Backend waking up… retrying scan.";
        await sleep(20000);

        try {
          response = await fetch(`${BACKEND_URL}/api/scans`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ target })
          });
        } catch {
          if (spinner) spinner.style.display = "none";
          statusEl.innerText =
            "Backend not reachable. Please try again later.";
          return;
        }
      }

      let data;
      try {
        data = await response.json();
      } catch {
        if (spinner) spinner.style.display = "none";
        statusEl.innerText = "Invalid backend response.";
        return;
      }

      if (!data.scan_id) {
        if (spinner) spinner.style.display = "none";
        statusEl.innerText = data.error || "Scan failed.";
        return;
      }

      statusEl.innerText = "Scan completed. Redirecting…";
      window.location.href = `results.html?scan_id=${data.scan_id}`;
    });
  }

  /* =====================================================
     RESULTS PAGE LOGIC
  ===================================================== */
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
          <p><strong>Total Open Ports:</strong> ${data.total_open_ports}</p>
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
        resultsDiv.innerText =
          "Failed to load scan results. Please refresh.";
      });
  }

  /* =====================================================
     HISTORY PAGE LOGIC + DELETE
  ===================================================== */
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
            <li style="margin-bottom:10px;">
              <span style="cursor:pointer;"
                data-view="${scan.scan_id}">
                ${scan.target} — ${scan.total_open_ports} ports
              </span>
              <button class="delete-btn"
                data-del="${scan.scan_id}">
                Delete
              </button>
            </li>
          `;
        });

        html += "</ul>";
        historyDiv.innerHTML = html;

        // View scan
        historyDiv.querySelectorAll("[data-view]").forEach(el => {
          el.addEventListener("click", () => {
            const id = el.getAttribute("data-view");
            window.location.href = `results.html?scan_id=${id}`;
          });
        });

        // Delete scan
        historyDiv.querySelectorAll("[data-del]").forEach(btn => {
          btn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const id = btn.getAttribute("data-del");

            if (!confirm("Delete this scan?")) return;

            await fetch(`${BACKEND_URL}/api/scans/${id}`, {
              method: "DELETE"
            });

            location.reload();
          });
        });
      })
      .catch(() => {
        historyDiv.innerText = "Failed to load scan history.";
      });
  }

});
