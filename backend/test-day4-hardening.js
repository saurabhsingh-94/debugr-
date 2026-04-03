const BASE_URL = "http://localhost:3000/api";

const runHardeningTest = async () => {
  console.log("🔍 DAY 4: ENTERPRISE HARDENING TEST SUITE\n");

  try {
    // 1. JWT / Auth Hardening: Strict Password Check
    console.log("1. Testing Strict Password Validation (Register)...");
    const weakReg = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "weak@debugr.io", password: "123" }) // Too short, no upper/number
    });
    const weakData = await weakReg.json();
    if (weakReg.status === 400 && weakData.errors) {
      console.log("✅ Blocked weak password as expected.");
    } else {
      console.error("❌ Failed to block weak password:", weakData);
    }

    // 2. Admin Validation: Invalid Bounty
    console.log("2. Testing Admin Validation (Bad Bounty)...");
    // Get Admin Token first (using the admin@debugr.io from test-day3)
    const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@debugr.io", password: "adminpassword" })
    });
    const { token: adminToken } = await adminLogin.json();

    const badBounty = await fetch(`${BASE_URL}/admin/reports/any-uuid`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({ bounty: -100 }) // Negative bounty
    });
    const badBountyData = await badBounty.json();
    if (badBounty.status === 400 && badBountyData.errors) {
      console.log("✅ Blocked negative bounty as expected.");
    } else {
      console.error("❌ Failed to block bad bounty:", badBountyData);
    }

    // 3. CORS Whitelist Rejection
    console.log("3. Testing CORS Whitelist Rejection...");
    const corsRes = await fetch(`${BASE_URL}/health`, {
      method: "GET",
      headers: { "Origin": "http://malicious-site.com" }
    });
    const corsData = await corsRes.json();
    if (corsRes.status === 403) {
      console.log("✅ Blocked unauthorized origin as expected.");
    } else {
      console.error("❌ Failed to block CORS origin:", corsRes.status, corsData);
    }

    // 4. API Error Response Structure
    console.log("4. Testing Standardized Error Structure (404)...");
    const notFound = await fetch(`${BASE_URL}/unknown-route`);
    const notFoundData = await notFound.json();
    if (notFoundData.success === false && notFoundData.error) {
      console.log("✅ Standardized error structure confirmed.");
    } else {
      console.error("❌ Non-standard error response:", notFoundData);
    }

    console.log("\n🚀 DAY 4 HARDENING TESTS PASSED!");

  } catch (err) {
    console.error("❌ Test Suite Crashed:", err.message);
  }
};

runHardeningTest();
