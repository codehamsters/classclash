import { useEffect } from "react";

/** a plain notes screen to flip to when the teacher walks by; the game keeps running underneath */
export default function Stealth({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const prev = document.title;
    document.title = "Notes";
    return () => { document.title = prev; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1c1c1e] font-[system-ui,sans-serif] text-[#e5e5e7]">
      <div className="mx-auto max-w-xl px-4 pb-16">
        <div className="sticky top-0 flex items-center justify-between bg-[#1c1c1e] py-3 text-[#e0a83a]">
          <span className="text-[15px]">Notes</span>
          <button type="button" onClick={onDone} className="min-h-11 px-2 text-[15px] font-semibold">Done</button>
        </div>
        <h1 className="mt-2 text-[26px] font-bold">Lecture 7: Thermodynamics</h1>
        <p className="mt-1 text-[13px] text-[#8e8e93]">Today</p>
        <div className="mt-5 space-y-4 text-[17px] leading-relaxed">
          <p>First law: ΔU = Q − W. Energy in a closed system is conserved; heat added goes to internal energy or work done by the system.</p>
          <p>Isothermal process: ΔU = 0 for an ideal gas, so Q = W. Work = nRT ln(V₂/V₁).</p>
          <p>Adiabatic: Q = 0. PV^γ = constant, γ = Cp/Cv. Ask about the derivation in tutorial.</p>
          <p>Second law (Kelvin–Planck): no engine converts heat fully into work in a cycle. Carnot efficiency η = 1 − Tc/Th.</p>
          <p>Entropy: dS = δQ_rev / T. Total entropy of an isolated system never decreases.</p>
          <p className="text-[#8e8e93]">Assignment 4 due next Friday: problems 3, 5, 8, 11.</p>
        </div>
      </div>
    </div>
  );
}
