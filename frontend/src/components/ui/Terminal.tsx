'use client';
import { useEffect, useRef, useState } from 'react';

const terminalLines = [
  { type: 'cmd', text: '$ nmap -sV --script vuln target.debugr.io' },
  { type: 'out', text: 'Starting Nmap 7.94 ( https://nmap.org )' },
  { type: 'out', text: 'Scanning target.debugr.io [1000 ports]' },
  { type: 'warn', text: '| CVE-2024-1337 CRITICAL: Auth bypass via JWT confusion' },
  { type: 'out', text: 'PORT   STATE SERVICE  VERSION' },
  { type: 'out', text: '443/tcp  open  ssl/http  nginx 1.24.0' },
  { type: 'cmd', text: '$ sqlmap -u "https://api.target.io/user?id=1" --dbs' },
  { type: 'warn', text: '[CRITICAL] Parameter "id" is vulnerable (boolean-based blind)' },
  { type: 'out', text: 'available databases: [admin_db, users_db, secrets]' },
  { type: 'success', text: '[+] Bounty eligible: $5,000 — Critical SQL Injection' },
  { type: 'cmd', text: '$ python3 exploit.py --target https://api.target.io/v2' },
  { type: 'out', text: 'Testing IDOR vulnerability on /api/v2/orders/{id}...' },
  { type: 'warn', text: '[HIGH] IDOR confirmed — Unauthorized order data access' },
  { type: 'success', text: '[+] Report submitted to Debugr dashboard' },
  { type: 'cmd', text: '$ debugr submit --severity critical --reward auto' },
  { type: 'out', text: 'Encrypting report payload...' },
  { type: 'out', text: 'Uploading to secure vault...' },
  { type: 'success', text: '[+] Report DB-2847 accepted. Payout: $8,500 USDC' },
];

export default function Terminal() {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      if (current < terminalLines.length) {
        setVisibleLines(current + 1);
        current++;
        // Auto-scroll
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      } else {
        // Reset after pause
        setTimeout(() => { setVisibleLines(0); current = 0; }, 2000);
      }
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const getColor = (type: string) => {
    switch (type) {
      case 'cmd': return 'text-[#f0f0f0]';
      case 'warn': return 'text-[#cc0000]';
      case 'success': return 'text-[#22c55e]';
      default: return 'text-[#6b6b6b]';
    }
  };

  return (
    <div className="relative h-full w-full rounded-none bg-[#0d0d0d] border border-[#2a2a2a] overflow-hidden">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2a2a2a] bg-[#141414]">
        <div className="w-3 h-3 rounded-full bg-[#cc0000]" />
        <div className="w-3 h-3 rounded-full bg-[#3a3a3a]" />
        <div className="w-3 h-3 rounded-full bg-[#3a3a3a]" />
        <span className="ml-3 font-mono text-xs text-[#6b6b6b] tracking-wider">
          debugr-terminal — bash
        </span>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="font-mono text-[10px] text-[#22c55e]">LIVE</span>
        </div>
      </div>

      {/* Terminal body */}
      <div
        ref={containerRef}
        className="p-4 h-[calc(100%-40px)] overflow-hidden font-mono text-xs leading-relaxed space-y-1"
        style={{ scrollBehavior: 'smooth' }}
      >
        {terminalLines.slice(0, visibleLines).map((line, i) => (
          <div
            key={i}
            className={`${getColor(line.type)} opacity-0`}
            style={{ animation: `float-up 0.3s ease forwards` }}
          >
            {line.type === 'cmd' ? (
              <span>{line.text}</span>
            ) : (
              <span className="pl-2">{line.text}</span>
            )}
          </div>
        ))}
        {/* Blinking cursor */}
        <div className="flex items-center gap-1 text-[#f0f0f0]">
          <span>$</span>
          <span className="w-2 h-4 bg-[#cc0000] animate-blink" />
        </div>
      </div>

      {/* Scan line effect */}
      <div
        className="absolute left-0 right-0 h-20 pointer-events-none"
        style={{
          background: 'linear-gradient(transparent, rgba(220,38,38,0.03), transparent)',
          animation: 'scan-line 4s linear infinite',
        }}
      />
    </div>
  );
}
