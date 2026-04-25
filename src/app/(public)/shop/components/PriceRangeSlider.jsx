"use client";

export default function PriceRangeSlider({
  min = 0,
  max = 10000,
  minVal,
  maxVal,
  onMinChange,
  onMaxChange,
}) {
  const minPercent = ((minVal - min) / (max - min)) * 100;
  const maxPercent = ((maxVal - min) / (max - min)) * 100;

  return (
    <div className="px-1 space-y-4">
      {/* Manual Input */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">
            Min Price
          </label>

          <input
            type="number"
            min={0}
            max={maxVal - 10}
            value={minVal}
            onChange={(e) =>
              onMinChange(Math.min(Number(e.target.value || 0), maxVal - 10))
            }
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">
            Max Price
          </label>

          <input
            type="number"
            min={minVal + 10}
            max={max}
            value={maxVal}
            onChange={(e) =>
              onMaxChange(Math.max(Number(e.target.value || 0), minVal + 10))
            }
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Slider */}
      <div className="relative h-8 flex items-center">
        <div className="absolute w-full h-2 bg-slate-200 rounded-full" />

        <div
          className="absolute h-2 bg-[#FF620A] rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={10}
          value={minVal}
          onChange={(e) =>
            onMinChange(Math.min(Number(e.target.value), maxVal - 10))
          }
          className="range-thumb z-20"
        />

        <input
          type="range"
          min={min}
          max={max}
          step={10}
          value={maxVal}
          onChange={(e) =>
            onMaxChange(Math.max(Number(e.target.value), minVal + 10))
          }
          className="range-thumb z-30"
        />
      </div>

      <style jsx>{`
        .range-thumb {
          position: absolute;
          width: 100%;
          appearance: none;
          background: transparent;
          pointer-events: none;
        }

        .range-thumb::-webkit-slider-thumb {
          appearance: none;
          pointer-events: auto;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #fff;
          border: 3px solid #ff620a;
          cursor: pointer;
        }

        .range-thumb::-webkit-slider-runnable-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
