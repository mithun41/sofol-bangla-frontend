"use client";

export default function PriceRangeSlider({
  min,
  max,
  minVal,
  maxVal,
  onMinChange,
  onMaxChange,
}) {
  const minPercent = Math.round((minVal / max) * 100);
  const maxPercent = Math.round((maxVal / max) * 100);

  return (
    <div className="px-1">
      {/* Price Labels */}
      <div className="flex justify-between items-center mb-3">
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700">
          ৳{minVal.toLocaleString()}
        </div>

        <div className="h-px flex-1 bg-slate-200 mx-3" />

        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700">
          ৳{maxVal.toLocaleString()}
        </div>
      </div>

      {/* Slider */}
      <div className="relative h-5 flex items-center mt-4">
        <div className="absolute w-full h-1.5 bg-slate-200 rounded-full" />

        <div
          className="absolute h-1.5 bg-[#FF620A] rounded-full"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
          }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={500}
          value={minVal}
          onChange={(e) =>
            onMinChange(Math.min(Number(e.target.value), maxVal - 1000))
          }
          className="absolute w-full appearance-none bg-transparent cursor-pointer z-10"
        />

        <input
          type="range"
          min={min}
          max={max}
          step={500}
          value={maxVal}
          onChange={(e) =>
            onMaxChange(Math.max(Number(e.target.value), minVal + 1000))
          }
          className="absolute w-full appearance-none bg-transparent cursor-pointer z-20"
        />
      </div>

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          border: 3px solid #ff620a;
          box-shadow: 0 2px 8px rgba(255, 98, 10, 0.3);
          cursor: pointer;
        }

        input[type="range"]::-webkit-slider-runnable-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
