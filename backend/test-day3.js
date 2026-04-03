const BASE_URL = "https://debugr-backend-production.up.railway.app/api";

const runTest = async () => {
  try {
    const timestamp = Date.now();
    const researcherEmail = `researcher_${timestamp}@debugr.io`;

    console.log("1. Registering Researcher...");
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: researcherEmail, password: "password123" })
    });
    const regData = await regRes.json();
    console.log("✅ Researcher registered.");

    console.log("1b. Logging in as Researcher...");
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: researcherEmail, password: "password123" })
    });
    const loginData = await loginRes.json();
    const resToken = loginData.token;
    console.log("✅ Researcher logged in.");

    console.log("2. Submitting Bug Report...");
    const reportRes = await fetch(`${BASE_URL}/reports`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resToken}`
      },
      body: JSON.stringify({ 
        title: "Test Bug", 
        description: "This is a test bug", 
        severity: "high" 
      })
    });
    const reportData = await reportRes.json();
    if (!reportData.success) {
      console.error("❌ Report submission failed:", reportData);
      throw new Error("Report submission failed");
    }
    const reportId = reportData.report.id;
    console.log(`✅ Report submitted (ID: ${reportId})`);

    console.log("3. Login as Admin...");
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@debugr.io", password: "adminpassword" })
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.token;
    console.log("✅ Admin logged in.");

    console.log("4. Admin: Triaging Report...");
    const triageRes = await fetch(`${BASE_URL}/admin/reports/${reportId}`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({ 
        status: "triaged", 
        bounty: 1000, 
        admin_notes: "Great find!" 
      })
    });
    const triageData = await triageRes.json();
    console.log("✅ Triage complete. Bounty:", triageData.report.bounty);

    console.log("5. Researcher: Checking My Reports...");
    const myReportsRes = await fetch(`${BASE_URL}/reports/my-reports`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${resToken}` }
    });
    const myReportsData = await myReportsRes.json();
    const myReport = myReportsData.reports.find(r => r.id === reportId);
    console.log("✅ Bounty seen by researcher:", myReport.bounty);

    console.log("\n🚀 DAY 3 E2E TEST PASSED!");

  } catch (err) {
    console.error("❌ Test Failed:", err);
  }
};

runTest();
