const API_URL = "http://localhost:3000/api";

const testDay6 = async () => {
  console.log("🔍 DAY 6: PROFILES & PROGRAMS TEST SUITE");

  try {
    // 1. Login Researcher
    console.log("\n1. Logging in Researcher...");
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "researcher5@debugr.io", password: "Password123" })
    });
    const loginData = await loginRes.json();
    if (!loginData.success) throw new Error("Login failed");
    const token = loginData.token;

    // 2. Update Profile
    console.log("2. Updating Professional Profile...");
    const updateRes = await fetch(`${API_URL}/users/profile`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({ 
        name: "Security Expert X",
        bio: "Specializing in Zero-Day research and cloud infrastructure.",
        github_url: "https://github.com/sec-expert-x",
        skills: ["Web", "Cloud", "Reverse Engineering"]
      })
    });
    const updateData = await updateRes.json();
    if (updateData.success) {
      console.log("✅ Profile updated successfully.");
    } else {
      throw new Error(`Profile update failed: ${JSON.stringify(updateData)}`);
    }

    // 3. Verify Profile (GET /profile/me)
    console.log("3. Verifying Profile persistence...");
    const verifyRes = await fetch(`${API_URL}/users/profile/me`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const verifyData = await verifyRes.json();
    console.log("   Observed Name:", verifyData.user.name);
    console.log("   Observed Skills:", JSON.stringify(verifyData.user.skills));

    if (verifyData.user.name === "Security Expert X" && verifyData.user.skills && verifyData.user.skills.includes("Cloud")) {
      console.log("✅ Verification successful. Skills and Name match.");
    } else {
      throw new Error("Verification failed. Data mismatch.");
    }

    // 4. Test Programs Detail
    console.log("4. Testing Program Detail retrieval...");
    const programsRes = await fetch(`${API_URL}/programs`);
    const programsData = await programsRes.json();
    const testProgramId = programsData.programs[0].id;

    const detailRes = await fetch(`${API_URL}/programs/${testProgramId}`);
    const detailData = await detailRes.json();
    if (detailData.success && detailData.program.name) {
      console.log(`✅ Retrieved details for program: ${detailData.program.name}`);
    } else {
      throw new Error("Program detail retrieval failed.");
    }

    console.log("\n🚀 DAY 6 PROFILES & PROGRAMS TESTS PASSED!");

  } catch (err) {
    console.error("\n❌ TEST FAILED:");
    console.error(err.message);
    process.exit(1);
  }
};

testDay6();
