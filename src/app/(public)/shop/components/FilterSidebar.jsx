import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import PriceRangeSlider from "./PriceRangeSlider";

export default function FilterSidebar({
  categories,
  selectedCategory,
  setSelectedCategory,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  closeDrawer,
}) {
  const [openCategory, setOpenCategory] = useState(null);

  const selectCategory = (id) => {
    setSelectedCategory(id);
    if (closeDrawer) closeDrawer(); // only close on actual filter select
  };

  const toggleCategory = (id) => {
    setOpenCategory(openCategory === id ? null : id);
  };

  // if selected subcategory belongs to a parent, keep that parent opened
  useEffect(() => {
    categories?.forEach((cat) => {
      if (cat.subcategories?.some((sub) => sub.id === selectedCategory)) {
        setOpenCategory(cat.id);
      }
    });
  }, [selectedCategory, categories]);

  return (
    <aside className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-8">
      {/* CATEGORY */}
      <div>
        <h3 className="font-bold mb-4 text-sm uppercase tracking-wide text-[#007A55]">
          Categories
        </h3>

        {/* ALL PRODUCTS */}
        <button
          onClick={() => selectCategory("All")}
          className={`w-full flex items-center justify-between rounded-xl px-3 py-3 text-sm transition
          ${
            selectedCategory === "All"
              ? "bg-orange-50 text-[#FF620A] font-semibold"
              : "hover:bg-slate-50"
          }`}
        >
          <span>All Products</span>
          {selectedCategory === "All" && <Check size={16} />}
        </button>

        <div className="mt-2 space-y-1">
          {categories?.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const isOpen = openCategory === cat.id;
            const hasSubs = cat.subcategories && cat.subcategories.length > 0;

            return (
              <div
                key={cat.id}
                className="rounded-xl border border-transparent hover:border-slate-200"
              >
                {/* Main row */}
                <div className="flex items-center">
                  {/* category select */}
                  <button
                    onClick={() => selectCategory(cat.id)}
                    className={`flex-1 text-left rounded-l-xl px-3 py-3 text-sm transition
                    ${
                      isActive
                        ? "bg-orange-50 text-[#FF620A] font-semibold"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    {cat.name}
                  </button>

                  {/* accordion toggle separate */}
                  {hasSubs && (
                    <button
                      onClick={() => toggleCategory(cat.id)}
                      className="px-3 py-3 rounded-r-xl hover:bg-slate-50"
                      aria-label="Toggle subcategories"
                    >
                      {isOpen ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                  )}
                </div>

                {/* SUBCATEGORIES */}
                {hasSubs && isOpen && (
                  <div className="ml-3 mt-1 mb-2 pl-3 border-l border-slate-200 space-y-1">
                    {cat.subcategories.map((sub) => {
                      const subActive = selectedCategory === sub.id;

                      return (
                        <button
                          key={sub.id}
                          onClick={() => selectCategory(sub.id)}
                          className={`w-full flex items-center justify-between rounded-lg px-3 py-3 text-sm transition
                          ${
                            subActive
                              ? "bg-orange-50 text-[#FF620A] font-semibold"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <span>{sub.name}</span>
                          {subActive && <Check size={15} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* PRICE */}
      <div>
        <h3 className="font-bold mb-4 text-sm uppercase tracking-wide text-[#007A55]">
          Price Range
        </h3>

        <PriceRangeSlider
          min={0}
          max={10000}
          minVal={minPrice}
          maxVal={maxPrice}
          onMinChange={setMinPrice}
          onMaxChange={setMaxPrice}
        />
      </div>
    </aside>
  );
}
