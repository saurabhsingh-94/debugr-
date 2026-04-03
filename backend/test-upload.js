import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://debugr-backend-production.up.railway.app/api";

const runUploadTest = async () => {
  try {
    console.log("1. Logging in as Researcher...");
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@debugr.io", password: "adminpassword" }) // using existing user
    });
    const { token } = await loginRes.json();
    console.log("✅ Logged in.");

    console.log("2. Preparing File for Upload...");
    // Create a dummy text file for testing
    const testFilePath = path.join(__dirname, "evidence-test.txt");
    fs.writeFileSync(testFilePath, "This is test evidence for a bug report.");

    console.log("3. Submitting Bug Report with Evidence...");
    const formData = new FormData();
    formData.append("title", "File Upload Test Bug");
    formData.append("description", "Testing the new Day 4 Cloudinary integration.");
    formData.append("severity", "medium");
    
    // Attach the file
    const fileBlob = new Blob([fs.readFileSync(testFilePath)], { type: "text/plain" });
    formData.append("evidence", fileBlob, "evidence-test.txt");

    const reportRes = await fetch(`${BASE_URL}/reports`, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`
      },
      body: formData
    });

    const reportData = await reportRes.json();
    
    if (reportData.success && reportData.report.evidence_url) {
      console.log("✅ EVIDENT UPLOAD SUCCESSFUL!");
      console.log("Evidence URL:", reportData.report.evidence_url);
    } else {
      console.log("❌ Upload failed or URL missing.");
      console.log(reportData);
    }

    // Cleanup
    if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);

  } catch (err) {
    console.error("❌ Test Failed:", err);
  }
};

runUploadTest();
