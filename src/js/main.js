const BACKEND_URL = "https://autoscanz-backend.onrender.com";

document.addEventListener("DOMContentLoaded", () => {

  /* ===================== SCAN PAGE LOGIC ===================== */
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

      status.innerText = "Starting scan… (backend may wake up)";

      try {
        async function postScan(target) {
  return fetch(`${BACKEND_URL}/api/scans`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ target })
  });
}

let response;

try {
  response = await postScan(target);
} catch {
  status.innerText = "Waking backend… retrying scan";
  await new Promise(r => setTimeout(r, 15000)); // wait 15s
  response = await postScan(target);
}
const data = await response.json();

          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ target })
        });

        const data = await response.json();

        if (!response.ok) {
          status.innerText = data.error || "Scan failed.";
          return;
        }

        status.innerText = "Scan completed. Redirecting to results…";
        window.location.href = `results.html?scan_id=${data.scan_id}`;

      } catch (error) {
        status.innerText =
          "Backend not reachable. Wait 30 seconds and try again.";
      }
    });
  }

  /* ===================== RESULTS PAGE LOGIC ===================== */
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
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          resultsDiv.innerText = data.error;
          return;
        }

        resultsDiv.innerHTML = `
          <p><strong>Target:</strong> ${data.target}</p>
          <p><strong>Total Open Ports:</strong> ${data.total_open_ports}</p>
          <pre>${JSON.stringify(data.open_ports, null, 2)}</pre>
        `;
      })
      .catch(() => {
        resultsDiv.innerText =
          "Error connecting to backend. Try refreshing.";
      });
  }

});
