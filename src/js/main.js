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

      const payload = {
        target: target
      };

      let response;

      // -------- First attempt (wake backend) --------
      try {
        response = await fetch(`${BACKEND_URL}/api/scans`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.warn("First attempt failed, retrying after delay...");
      }

      // -------- Retry after wait (actual scan) --------
      if (!response || !response.ok) {
        status.innerText = "Backend waking up… retrying scan";
        await sleep(20000); // wait 20 seconds

        try {
          response = await fetch(`${BACKEND_URL}/api/scans`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          });
        } catch (err) {
          status.innerText =
            "Backend still not reachable. Please wait 1 minute and try again.";
          return;
        }
      }

      let data;
      try {
        data = await response.json();
      } catch {
        status.innerText = "Invalid response from backend.";
        return;
      }

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

    resultsDiv.innerText = "Loading scan results… (backend may wake up)";

    async function loadResults() {
      try {
        const response = await fetch(`${BACKEND_URL}/api/scans/${scanId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch results");
        }

        resultsDiv.innerHTML = `
          <p><strong>Target:</strong> ${data.target}</p>
          <p><strong>Total Open Ports:</strong> ${data.total_open_ports}</p>
          <h4>Open Ports</h4>
          <pre>${JSON.stringify(data.open_ports, null, 2)}</pre>
        `;
      } catch (err) {
        console.warn("Retrying results fetch…");
        await sleep(15000);
        try {
          const response = await fetch(`${BACKEND_URL}/api/scans/${scanId}`);
          const data = await response.json();

          resultsDiv.innerHTML = `
            <p><strong>Target:</strong> ${data.target}</p>
            <p><strong>Total Open Ports:</strong> ${data.total_open_ports}</p>
            <h4>Open Ports</h4>
            <pre>${JSON.stringify(data.open_ports, null, 2)}</pre>
          `;
        } catch {
          resultsDiv.innerText =
            "Unable to load results. Please refresh the page.";
        }
      }
    }

    loadResults();
  }

});
