import sys

file_path = "frontend/src/app/page.tsx"

replacements = [
    # Hero Title
    ("Coordinated", "Precision"),
    
    # Activity Bar
    ("VALIDATION_XP", "VERIFICATION_XP"),
    ("Principal_Researcher", "Expert_Researcher"),
    ("+2,400_CR", "+2,400 CR"),
    
    # Philosophy Headings
    ("Provision Identity", "Secure Onboarding"),
    ("Analyze Assets", "Expert Analysis"),
    ("Scale Reputation", "Career Growth"),
    
    # Philosophy Descriptions
    ("Secure your secure handle within minutes. We prioritize privacy-preserving authentication layers to keep your research activity confidential.",
     "Claim your handle and build your profile in minutes. We prioritize privacy and security to keep your research activity professional."),
    ("Access exclusive attack surfaces across high-stakes financial and technical infrastructure. Submit reports via our unified triage bridge.",
     "Access exclusive review surfaces across high-stakes infrastructure. Submit findings via our simplified technical gateway."),
    ("Earn credit based on the verified impact of your findings. Unlock private programs and higher bounty tiers as your technical authority grows.",
     "Build your reputation based on verified impact. Unlock specialized programs and higher earnings as your technical expertise is proven."),
    
    # Stats Title
    ("Operational \n                    Authority.", "Verified \n                    Expertise."),
    
    # Stats Labels (with more context to avoid partial matches)
    ("Network Integrity", "Network Quality"),
    ("Protocol Grade", "Pro Grade"),
    ("Triage Latency", "Impact Response"),
    ("Avg Response", "Avg Review"),
    ("Validated Flow", "Impact Verified"),
    ("Global Capacity", "Global Network"),
    ("Asset Owners", "Impact Partners"),
    
    # Status/Gateway
    ("System Active", "Researcher Network Active"),
    ("Validation Bridge", "Secure Gateway"),
    ("Binary Analysis", "Technical Review")
]

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    for old, new in replacements:
        content = content.replace(old, new)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully humanized Homepage.")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
