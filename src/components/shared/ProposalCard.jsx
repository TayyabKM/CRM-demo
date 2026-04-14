import { useState, useEffect } from 'react';

const BrandlineLogo = ({ height = 36 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 258.53 52.47" style={{ height }}>
    <defs>
      <style>{`.cls-1{fill:#fbfcfb}.cls-5{fill:#038d46}.cls-7{fill:#0b914c}.cls-9{fill:#0b904c}.cls-10{fill:#fbfcfc}.cls-12{fill:#1c9859}`}</style>
    </defs>
    <g>
      <path className="cls-5" d="M69.9,52.47H8.3c-1.4-.1-2.79-.34-4.14-.73-2.46-.55-5-4.86-3.89-7.44,2-4.64,3.79-9.35,5.77-14,2.69-6.27,5.34-12.57,8.27-18.72C17.75,4.36,23.44.26,31.66.24c28.87-.06,57.75-.11,86.63-.15,11.83,0,23.66-.12,35.5-.09,1.51.04,3,.33,4.41.86,2.63.96,4.22,3.64,3.81,6.41-.14,1.35-.48,2.68-1,3.93-4.36,10.06-8.59,20.19-13.26,30.1-3.3,7-9,10.93-17,10.94h-60.84v.23Z"/>
      <rect className="cls-5" x="14.56" y="6.2" width="134.36" height="39.5" rx="8.98" ry="8.98"/>
    </g>
    <g>
      <path className="cls-7" d="M224.92,36.24c.63,2.96,3.28,5.06,6.31,5h8.65c1,0,2.1.1,2.13,1.36s-1,1.5-2.15,1.49h-8.19c-5.21.2-9.62-3.8-9.92-9-.14-1.71-.14-3.44,0-5.15.43-4.91,4.52-8.69,9.45-8.73h3.94c4.7.03,8.67,3.48,9.36,8.13.19,1.66.24,3.33.13,5,0,1.3-1,1.94-2.56,1.94h-15.48l-1.67-.04ZM241.84,33.33v-2.37c.1-3.77-2.88-6.9-6.66-7-.11,0-.23,0-.34,0h-2.58c-5.55,0-8.53,3.66-7.52,9.34l17.1.03Z"/>
      <path className="cls-7" d="M217.69,36.14v6.06c0,1.06-.36,1.88-1.5,1.85s-1.36-.85-1.36-1.83v-11.07c.21-3.74-2.65-6.94-6.39-7.15-.25-.01-.49-.01-.74,0h-2.58c-4.84,0-7.57,2.75-7.57,7.64v10.32c0,1.05-.11,2.07-1.39,2.09s-1.48-1-1.47-2v-11.23c0-5.31,4.31-9.62,9.62-9.62.02,0,.05,0,.07,0h3.64c5.31,0,9.62,4.3,9.63,9.61,0,.02,0,.03,0,.05.05,1.74.04,3.51.04,5.28Z"/>
      <path className="cls-7" d="M165.33,25.58v-9.11c0-1.11.13-2.19,1.47-2.16s1.39,1,1.38,2.11v17.6c0,4.56,2.7,7.23,7.28,7.24h7.13c1,0,1.92.3,1.92,1.43s-.89,1.43-1.92,1.42h-8c-5.05-.1-9.12-4.19-9.19-9.24-.12-3.12-.07-6.17-.07-9.29Z"/>
      <path className="cls-9" d="M189.59,32.93v9.09c0,1.06-.18,2.05-1.45,2s-1.41-1-1.41-2.07v-18.47c0-1.08.22-2.05,1.45-2s1.42,1,1.41,2.08c-.06,3.14,0,6.24,0,9.37Z"/>
    </g>
    <g>
      <path className="cls-10" d="M38.59,43.2c-3.08.07-6.15.17-9.22.19s-6.16,0-9.23-.07c0-.55-.06-1.11-.06-1.66,0-9.24.05-18.47,0-27.71,0-2.17.59-3.83,2.49-4.94,5.6.06,11.21-.18,16.78.24,5.94.44,8.93,5.09,7.54,10.87-.46,1.91-1.12,2.77-3.59,4.65,0,.08.07.21.14.24,4,1.69,5.18,4.95,4.88,9-.08,3.81-2.56,7.17-6.18,8.36-1.05.34-2.12.61-3.21.81l-.34.02Z"/>
      <path className="cls-1" d="M129.65,16.47c2.69-.41,5.43.32,7.57,2l1.47,1.66.39-.2v-10.71c1.11,0,2.22-.08,3.33,0,1.76.03,3.18,1.43,3.23,3.19,0,7.07.17,14.14-.1,21.21-.24,6.21-3.8,9.71-10,10.29-2.07.08-4.14.05-6.2-.11-.24-.16-.5-.29-.77-.4-3.7-.85-6.55-3.81-7.26-7.54-.59-2.49-.81-5.06-.64-7.61.3-2.54,1.02-5.01,2.12-7.32,1.29-2.8,4.04-3.8,6.86-4.46Z"/>
      <path className="cls-1" d="M78.06,27.01l1.51-.21,1-.15.52-.13c.99-.11,1.97-.35,2.91-.7.93-.41,1.35-1.49.94-2.41-.18-.42-.52-.75-.94-.94-.93-.31-1.89-.51-2.87-.59-1.69-.13-3.34-.16-4.48,1.47-.15.22-.62.29-.94.29-1.92,0-3.83,0-5.75-.05.31-3.08,2.46-5.67,5.43-6.54l1.52-.58c2.77-.04,5.54.07,8.29.35,4.55.71,6.48,3.28,6.47,7.88v7.58c0,6.94-3,10.5-9.88,11.48-2.21.18-4.42.2-6.63.06-.58-.29-1.14-.59-1.72-.87-5.06-2.49-6.09-9.8-1.68-13.27,1.58-1.24,3.81-1.65,5.75-2.44l.55-.23Z"/>
      <path className="cls-10" d="M105.92,22.25c-3,.24-4.17,1.51-4.19,4.43,0,5.49,0,11-.06,16.47,0,.05,0,.09-.15.32h-6.47c0-5.9-.16-11.8,0-17.68-.07-3.71,2.17-7.06,5.62-8.42.91-.38,1.89-.61,2.84-.9,2-.07,4.01,0,6,.19,4.78.79,7.61,3.38,7.92,8.18.4,6.16.09,12.36.09,18.64h-4.33c-1.7-.73-2.24-2-2.2-3.85.11-4.18.05-8.36,0-12.54.1-3.5-1.54-5.02-5.07-4.84Z"/>
      <path className="cls-1" d="M61.7,16.84l.88-.08h3.8v6.91h-2.59c-3.34.11-5.2,1.93-5.26,5.35-.08,4.54,0,9.08-.06,13.63,0,.19,0,.39-.06.59h-6.94c.19-5.8.18-11.35.61-16.87.16-3,1.8-5.73,4.39-7.27,1.69-.87,3.44-1.62,5.23-2.26Z"/>
    </g>
  </svg>
);

const NumberCounter = ({ value }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const end = parseInt(value);
    if (isNaN(end)) return;
    
    let startTimestamp = null;
    const duration = 800;
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [value]);
  
  return <span>{count.toLocaleString()}</span>;
};

export default function ProposalCard({ 
  mode, 
  productName, 
  lineItems, 
  totals, 
  projectName, 
  clientName, 
  timeline 
}) {
  const dateStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const quoteId = `PQ-2026-${Math.floor(Math.random() * 900) + 100}`;

  return (
    <div className="bg-white text-slate-800 rounded-3xl overflow-hidden shadow-2xl relative border border-slate-200">
      <div className="p-12 space-y-12">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-12">
          <div>
            <div className="h-10 w-40 flex items-center mb-6">
              <BrandlineLogo height={32} />
            </div>
            <div className="space-y-1 text-xs text-slate-400 font-medium">
              <p className="text-slate-900 font-bold uppercase tracking-wider">Manufacturing & Production</p>
              <p>Lahore, Pakistan • Office 402, Business Hub</p>
              <p>Ph: +92 42 111-BRAND (27263)</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-5xl font-black text-slate-200 mb-4 select-none uppercase">
              {mode === 'single' ? 'OFFER' : 'QUOTATION'}
            </h2>
            <div className="text-sm font-bold text-slate-700">
              <p>ID: <span className="font-mono text-brand-primary">#{quoteId}</span></p>
              <p>{dateStr}</p>
            </div>
          </div>
        </div>

        {/* Intro */}
        <div className="flex gap-12">
          <div className="w-1/2">
            <p className="text-[10px] uppercase font-black text-slate-300 tracking-[0.2em] mb-4">Customer Details</p>
            <h3 className="text-xl font-black text-slate-800 mb-1">{clientName || 'Valued Customer'}</h3>
            <p className="text-sm text-slate-500">Proposal for Commercial Execution</p>
          </div>
          <div className="w-1/2 text-right">
            <p className="text-[10px] uppercase font-black text-slate-300 tracking-[0.2em] mb-4">Project Overview</p>
            <h3 className="text-xl font-black text-slate-800 mb-1">
              {projectName || (mode === 'single' ? productName : 'Branding & Advertising Project')}
            </h3>
            <p className="text-sm font-black text-brand-primary">
              {mode === 'single' ? timeline : timeline} Days Delivery
            </p>
          </div>
        </div>

        {/* Line Items */}
        <div>
          {mode === 'single' ? (
            <table className="w-full">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50/50">
                  <th className="p-4 text-[10px] font-black text-slate-400 text-left tracking-widest uppercase">Service Description</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 text-right tracking-widest uppercase">Total PKR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-6">
                    <h4 className="font-black text-slate-800">Production & Execution</h4>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      End-to-end manufacturing of {productName} including structural work, premium surface finishing, and quality assurance protocols.
                    </p>
                  </td>
                  <td className="p-6 text-right">
                    <p className="text-2xl font-black text-slate-800">PKR {totals.totalProposal.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Inclusive of all services</p>
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50/50">
                  <th className="p-4 text-[10px] font-black text-slate-400 tracking-widest uppercase">#</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 tracking-widest uppercase">Product</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 text-center tracking-widest uppercase">Qty</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 text-center tracking-widest uppercase">Timeline</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 text-right tracking-widest uppercase">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lineItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-4 text-sm font-medium text-slate-400">{idx + 1}</td>
                    <td className="p-4 text-sm font-bold text-slate-800">{item.name}</td>
                    <td className="p-4 text-sm text-center font-medium">{item.quantity}</td>
                    <td className="p-4 text-sm text-center font-medium">{item.timeline} days</td>
                    <td className="p-4 text-sm font-black text-slate-800 text-right">
                      {item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Summaries */}
        <div className="flex justify-between items-center bg-slate-900 p-8 rounded-3xl text-white shadow-2xl">
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Grand Total</h4>
            <p className="text-sm text-slate-300 font-medium">Valid for 07 Working Days</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black">PKR <NumberCounter value={totals.totalProposal} /></p>
          </div>
        </div>

        {/* Note (Project specific) */}
        {mode === 'project' && (
          <p className="text-[10px] text-slate-400 font-medium px-4">
            * Prices include all materials, labour, and finishing. Installation and delivery quoted separately if required.<br />
            * Estimated project completion: {timeline} working days from order confirmation and advance payment.
          </p>
        )}

        {/* T&C */}
        <div className="grid grid-cols-2 gap-8 text-[10px] border-t border-slate-100 pt-12">
          <div className="space-y-4">
            <p className="font-black text-slate-400 uppercase tracking-widest">General Terms</p>
            <ul className="space-y-2 text-slate-500 font-medium list-disc list-inside">
              <li>Payment structure: 50% non-refundable advance, 50% on delivery.</li>
              <li>Warranty: 1 Year structural integrity (Standard usage only).</li>
              <li>Any variation in size/design will affect final pricing.</li>
            </ul>
          </div>
          <div className="space-y-4">
            <p className="font-black text-slate-400 uppercase tracking-widest">Approvals</p>
            <div className="mt-8 border-t border-slate-200 pt-4 flex justify-between px-4">
              <span className="text-slate-300 italic font-medium">Customer Signature</span>
              <span className="text-slate-300 italic font-medium">Brandline Representative</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-slate-100">
          <p className="text-[10px] text-slate-300 uppercase tracking-[0.2em] mb-2 font-bold">This is a system-generated quotation from Brandline AI</p>
          <div className="flex justify-center gap-4 text-[10px] text-slate-400 font-bold">
            <span>brandline-advertising.com</span>
            <span className="text-brand-primary">•</span>
            <span>info@brandline.com</span>
            <span className="text-brand-primary">•</span>
            <span>+92 42 111-BRAND</span>
          </div>
        </div>
      </div>
    </div>
  );
}
