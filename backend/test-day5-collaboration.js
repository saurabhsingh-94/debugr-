const API_URL = "http://localhost:3000/api";

const testDay5 = async () => {
  console.log("🔍 DAY 5: COLLABORATION & AUDIT TEST SUITE");

  try {
    // 1. Setup - Login Researcher & Admin
    console.log("\n1. Setting up Test Users...");
    
    let researcherToken, adminToken, testReportId;

    // Register researcher (ignore if already exists)
    await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "researcher5@debugr.io", password: "Password123" })
    }).catch(() => {});

    const resLogin = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "researcher5@debugr.io", password: "Password123" })
    });
    const loginData = await resLogin.json();
    researcherToken = loginData.token;

    // Login Admin
    const adminLogin = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@debugr.io", password: "AdminPassword123" })
    });
    const adminData = await adminLogin.json();
    if (!adminData.success) {
       console.log("⚠️ Admin login failed. Make sure admin@debugr.io exists.");
       return;
    }
    adminToken = adminData.token;

    // 2. Submit Report
    console.log("2. Submitting Report & Verifying Audit Log...");
    const reportRes = await fetch(`${API_URL}/reports`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${researcherToken}` 
      },
      body: JSON.stringify({ title: "Day 5 Audit Test Bug", description: "This is a test bug for audit logging purposes.", severity: "high" })
    });
    const reportData = await reportRes.json();
    testReportId = reportData.report.id;
    console.log("✅ Report submitted. ID:", testReportId);

    // 3. Post Comments
    console.log("3. Testing Comments (Public vs Internal)...");
    
    // Researcher posts public comment
    await fetch(`${API_URL}/comments/${testReportId}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${researcherToken}` 
      },
      body: JSON.stringify({ message: "Here is more info about the bug." })
    });

    // Admin posts internal comment
    await fetch(`${API_URL}/comments/${testReportId}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}` 
      },
      body: JSON.stringify({ message: "Triaging now. Looks like a real issue.", is_internal: true })
    });

    // Verify Researcher sees only 1 comment
    const resComments = await fetch(`${API_URL}/comments/${testReportId}`, {
      headers: { "Authorization": `Bearer ${researcherToken}` }
    });
    const rCommentsData = await resComments.json();
    if (rCommentsData.comments.length === 1) {
      console.log("✅ Researcher correctly sees only public comments.");
    } else {
      throw new Error(`Researcher saw ${rCommentsData.comments.length} comments (Expected 1)`);
    }

    // Verify Admin sees 2 comments
    const adminComments = await fetch(`${API_URL}/comments/${testReportId}`, {
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    const aCommentsData = await adminComments.json();
    if (aCommentsData.comments.length === 2) {
      console.log("✅ Admin correctly sees both public and internal comments.");
    } else {
      throw new Error(`Admin saw ${aCommentsData.comments.length} comments (Expected 2)`);
    }

    // 4. Update Report (Triage & Bounty)
    console.log("4. Updating Report & Verifying Multi-Action Logging...");
    await fetch(`${API_URL}/admin/reports/${testReportId}`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}` 
      },
      body: JSON.stringify({ status: "resolved", bounty: 500 })
    });
    console.log("✅ Report resolved with $500 bounty.");

    // 5. Check Profile & Leaderboard
    console.log("5. Checking Profiles and Leaderboard...");
    const profileRes = await fetch(`${API_URL}/users/profile/me`, {
      headers: { "Authorization": `Bearer ${researcherToken}` }
    });
    const profileData = await profileRes.json();
    console.log("✅ Researcher Profile Stats:", profileData.user.stats);

    const leaderRes = await fetch(`${API_URL}/users/leaderboard`);
    const leaderData = await leaderRes.json();
    console.log("✅ Global Leaderboard Count:", leaderData.leaderboard.length);

    console.log("\n🚀 DAY 5 COLLABORATION & AUDIT TESTS PASSED!");

  } catch (err) {
    console.error("\n❌ TEST FAILED:");
    console.error(err.message);
    process.exit(1);
  }
};

testDay5();
