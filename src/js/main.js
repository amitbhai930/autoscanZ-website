const BACKEND_URL = "https://autoscanz-backend.onrender.com";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

document.addEventListener("DOMContentLoaded", () => {

  /* -------------------- SCAN PAGE -------------------- */
  const scanBtn = document.getElementById("scanBtn");
  const status = document.getElementById("status");

  if (scanBtn) {
    scanBtn.addEventListener("click", async () => {
      const targetInput = document.getElementById("target");
      const target = targetInput.value.trim();

      if (!target) {
        status.innerText = "Please enter a valid target.";
        return;
      }

      status.innerText = "Waking backend… please wait";

      let response;
      try {
        response = await fetch(`${BACKEND_URL}/api/scans`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target })
        });
      } catch {}

      if (!response || !response.ok) {
        status.innerText = "Retrying…";
        await sleep(20000);
        try {
          response = await fetch(`${BACKEND_URL}/api/scans`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ target })
          });
        } catch {
          status.innerText = "Backend unreachable. Try again later.";
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

  /* -------------------- RESULTS PAGE -------------------- */
  const resultsDiv = document.getElementById("results");
  if (resultsDiv) {
    const params = new URLSearchParams(window.location.search);
    const scanId = params.get("scan_id");
    if (!scanId) {
      resultsDiv.innerHTML = `<p>No scan ID provided</p>`;
      return;
    }

    resultsDiv.innerHTML = `<p>Loading results…</p>`;

    fetch(`${BACKEND_URL}/api/scans/${scanId}`)
      .then(res => res.json())
      .then(data => {
        resultsDiv.innerHTML = `
          <div class="result-grid">
            <div class="result-card">
              <h3>Target</h3>
              <p>${data.target}</p>
            </div>
            <div class="result-card">
              <h3>Total Open Ports</h3>
              <p>${data.total_open_ports}</p>
            </div>
          </div>

          <div class="card">
            <h3>Open Ports Details</h3>
            <pre>${JSON.stringify(data.open_ports, null, 2)}</pre>
          </div>`;
      })
      .catch(() => {
        resultsDiv.innerHTML = `<p>Unable to load results.</p>`;
      });
  }

  /* -------------------- HISTORY PAGE -------------------- */
  const historyDiv = document.getElementById("history");
  if (historyDiv) {
    historyDiv.innerHTML = `<p>Loading history…</p>`;

    fetch(`${BACKEND_URL}/api/scans`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) {
          historyDiv.innerHTML = `<p>No scans found.</p>`;
          return;
        }

        let html = `<table class="history-table">
          <tr><th>Target</th><th>Open Ports</th><th>Date</th></tr>`;

        data.forEach(scan => {
          html += `
            <tr class="history-row" data-id="${scan.scan_id}">
              <td>${scan.target}</td>
              <td>${scan.total_open_ports}</td>
              <td>${new Date(scan.created_at).toLocaleString()}</td>
            </tr>`;
        });

        html += `</table>`;
        historyDiv.innerHTML = html;

        document.querySelectorAll(".history-row").forEach(row => {
          row.addEventListener("click", () => {
            const id = row.getAttribute("data-id");
            window.location.href = `results.html?scan_id=${id}`;
          });
        });
      })
      .catch(() => {
        historyDiv.innerHTML = `<p>Unable to load history.</p>`;
      });
  }

});
