// ===================== CONFIG =====================
const BACKEND_URL = "https://autoscanz-backend.onrender.com";

// Utility: sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===================== MAIN =====================
document.addEventListener("DOMContentLoaded", () => {

  /* =====================================================
     THEME (DARK / LIGHT MODE)
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
     SCAN PAGE LOGIC
  ===================================================== */
  const scanBtn = document.getElementById("scanBtn");
  const status = document.getElementById("status");

  if (scanBtn) {
    scanBtn.addEventListener("click", async () => {
      const targetInput = document.getElementById("target");
      const target = targetInput.value.trim();

      if (!target) {
        status.innerText = "Please enter a valid domain or IP.";
        return;
      }

      status.innerText = "Waking backend… please wait";

      let response;

      // First attempt (wake backend)
      try {
        response = await fetch(`${BACKEND_URL}/api/scans`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target })
        });
      } catch {}

      // Retry after delay (Render free tier)
      if (!response || !response.ok) {
        status.innerText = "Backend waking up… retrying";
        await sleep(20000);

        try {
          response = await fetch(`${BACKEND_URL}/api/scans`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ target })
          });
        } catch {
          status.innerText =
            "Backend not reachable. Please try again later.";
          return;
        }
      }

      const data = await response.json();

      if (!data.scan_id) {
        status.innerText = data.error || "Scan failed.";
        return;
      }

      status.innerText = "Scan completed. Redirecting…";
      window.location.href = `results.html?scan_id=${data.scan_id}`;
    });
  }

  /* =====================================================
     RESULTS PAGE LOGIC (VISUAL DASHBOARD)
  ===================================================== */
  const resultsDiv = document.getElementById("results");

  if (resultsDiv) {
    const params = new URLSearchParams(window.location.search);
    const scanId = params.get("scan_id");

    if (!scanId) {
      resultsDiv.innerHTML = "<p>No scan ID provided.</p>";
      return;
    }

    resultsDiv.innerHTML = "<p>Loading scan results…</p>";

    fetch(`${BACKEND_URL}/api/scans/${scanId}`)
      .then(res => res.json())
      .then(data => {
        if (!data || !data.target) {
          resultsDiv.innerHTML = "<p>Invalid scan data.</p>";
          return;
        }

        resultsDiv.innerHTML = `
          <div class="result-grid">
            <div class="result-box">
              <h3>Target</h3>
              <p>${data.target}</p>
            </div>

            <div class="result-box">
              <h3>Open Ports</h3>
              <p>${data.total_open_ports}</p>
            </div>
          </div>

          <div class="card">
            <h3>Port Status</h3>
            ${
              data.open_ports.length === 0
                ? "<p>No open ports detected.</p>"
                : data.open_ports.map(port => `
                    <div class="port-row">
                      <span>Port ${port.port} (${port.service})</span>
                      <span class="badge open">OPEN</span>
                    </div>
                  `).join("")
            }
          </div>
        `;
      })
      .catch(() => {
        resultsDiv.innerHTML =
          "<p>Unable to load scan results. Please refresh.</p>";
      });
  }

  /* =====================================================
     HISTORY PAGE LOGIC (CLICKABLE TABLE)
  ===================================================== */
  const historyDiv = document.getElementById("history");

  if (historyDiv) {
    historyDiv.innerHTML = "<p>Loading scan history…</p>";

    fetch(`${BACKEND_URL}/api/scans`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) {
          historyDiv.innerHTML = "<p>No scans found.</p>";
