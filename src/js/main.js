const BACKEND_URL = "https://autoscanz-backend.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("scanForm");

  if (!form) return;

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
      const response = await fetch(`${BACKEND_URL}/api/scans`, {
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
});
