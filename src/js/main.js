/* === RESET & BASE === */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu;
  background: #f7f9fc;
  color: #1e293b;
  line-height: 1.5;
}

/* === NAVIGATION === */
.navbar {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 14px 0;
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #2563eb;
}

.nav-links {
  display: flex;
  gap: 18px;
}

.nav-links a {
  font-size: 15px;
  font-weight: 500;
  color: #475569;
  transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.active {
  color: #2563eb;
}

/* === HERO SECTION === */
.hero {
  background: linear-gradient(90deg, #2563eb 0%, #1e40af 100%);
  color: #ffffff;
  text-align: center;
  padding: 80px 20px;
}

.hero h1 {
  font-size: 38px;
  margin-bottom: 12px;
}

.hero p {
  font-size: 17px;
  opacity: 0.9;
  max-width: 650px;
  margin: 0 auto 20px;
}

/* === BUTTONS === */
.btn {
  display: inline-block;
  padding: 12px 22px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
}

.btn-primary {
  background: #2563eb;
  color: #fff;
}

.btn-primary:hover {
  background: #1e40af;
}

.btn-secondary {
  background: transparent;
  border: 1px solid #2563eb;
  color: #2563eb;
}

.btn-secondary:hover {
  background: #2563eb;
  color: #fff;
}

/* === SECTION WRAPPERS === */
.section {
  padding: 60px 20px;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
}

/* === FORM === */
.scan-form input {
  width: 100%;
  max-width: 350px;
  height: 44px;
  padding: 0 14px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 16px;
  margin-bottom: 14px;
}

.scan-form {
  text-align: center;
}

/* === STATUS FEEDBACK === */
#status {
  margin-top: 16px;
  font-weight: 500;
  color: #2563eb;
}

/* === RESULTS SUMMARY CARDS === */
.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 18px;
  margin-top: 30px;
}

.result-card {
  background: #fff;
  border-radius: 8px;
  padding: 18px;
  box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.result-card h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #475569;
}

.result-card p {
  font-size: 26px;
  font-weight: 700;
  color: #1e293b;
}

/* === DETAILED RESULTS VIEW === */
.card {
  background: #fff;
  border-radius: 8px;
  padding: 18px;
  box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.05);
  margin-top: 24px;
}

.card h3 {
  margin-bottom: 10px;
}

/* === HISTORY TABLE === */
.history-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.history-table th {
  background: #2563eb;
  color: #fff;
  text-align: left;
  padding: 12px;
  font-size: 15px;
}

.history-table td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.history-row {
  cursor: pointer;
}

.history-row:hover {
  background: #f1f5f9;
}

/* === FOOTER === */
footer {
  text-align: center;
  padding: 20px 0;
  color: #64748b;
  font-size: 14px;
}
