import { useState, useEffect } from 'react';

const BrandlineLogo = ({ height = 36 }) => (
  <img src="/Logo.svg" alt="Brandline AI Logo" style={{ height }} className="w-auto block" />
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
