document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("scanForm");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const target = document.getElementById("target").value;
        const status = document.getElementById("status");

        status.innerText = "Starting scan...";

        try {
            const response = await fetch(
                "https://YOUR-BACKEND-URL.onrender.com/api/scans",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ target })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                status.innerText = data.error || "Scan failed";
                return;
            }

            status.innerText = `Scan started. Scan ID: ${data.scan_id}`;
        } catch (err) {
            status.innerText = "Backend not reachable";
        }
    });
});
