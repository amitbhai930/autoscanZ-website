// ===================== CONFIG =====================
const BACKEND_URL = "https://autoscanz-backend.onrender.com";

// Utility: sleep for ms
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===================== MAIN =====================
document.addEventListener("DOMContentLoaded", () => {

  console.log("AutoScanZ JS loaded");

  /* =====================================================
     SCAN PAGE LOGIC
  ===================================================== */
  const form = document.getElementById("scanForm");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const targetInput = document.getElementById("target");
      const status = document.getElementById("status");
      const target = targetInput.value.trim();

      if (!target) {
        status.innerText = "Please enter a valid target.";
        return;
      }

      status.innerText = "Waking backend… please wait (first time may take ~30s)";

      const payload = { target };
      let response;

      try {
        response = await fetch(`${BACKEND_URL}/api/scans`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } catch {}

      if (!response || !response.ok) {
        status.innerText = "Backend waking up… retrying scan";
        await sleep(20000);

        try {
          response = await fetch(`${BACKEND_URL}/api/scans`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        } catch {
          status.innerText =
            "Backend still not reachable. Please wait 1 minute and try again.";
          return;
        }
      }

      const data = await response.json();

      if (!response.ok || !data.scan_id) {
        status.innerText = data.error || "Scan failed.";
        return;
      }

      status.innerText = "Scan completed. Redirecting to results…";
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
        resultsDiv.innerHTML = `
          <p><strong>Target:</strong> ${data.target}</p>
          <p><strong>Total Open Ports:</strong> ${data.total_open_ports}</p>
          <pre>${JSON.stringify(data.open_ports, null, 2)}</pre>
        `;
      })
      .catch(() => {
        resultsDiv.innerText = "Failed to load scan results.";
      });
  }

  /* =====================================================
     HISTORY PAGE LOGIC
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

        let html = `
          <table border="1" cellpadding="8">
            <tr>
              <th>Target</th>
              <th>Open Ports</th>
              <th>Date</th>
            </tr>
        `;

        data.forEach(scan => {
          html += `
            <tr>
              <td>${scan.target}</td>
              <td>${scan.total_open_ports}</td>
              <td>${new Date(scan.created_at).toLocaleString()}</td>
            </tr>
          `;
        });

        html += "</table>";
        historyDiv.innerHTML = html;
      })
      .catch(() => {
        historyDiv.innerText = "Failed to load scan history.";
      });
  }

});

