import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
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
    if (closeDrawer) closeDrawer();
  };

  const handleCategoryClick = (cat) => {
    // filter apply
    selectCategory(cat.id);

    // accordion toggle যদি subcategory থাকে
    if (cat.subcategories && cat.subcategories.length > 0) {
      setOpenCategory(openCategory === cat.id ? null : cat.id);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-6">
      <div>
        <h3 className="font-bold mb-3 text-sm text-[#007A55]">Categories</h3>

        {/* All Products */}
        <button
          onClick={() => selectCategory("All")}
          className={`flex justify-between w-full text-sm py-1 ${
            selectedCategory === "All" ? "text-[#FF620A] font-semibold" : ""
          }`}
        >
          All Products
          {selectedCategory === "All" && <Check size={14} />}
        </button>

        {categories.map((c) => (
          <div key={c.id} className="mt-1">
            {/* Main Category */}
            <button
              onClick={() => handleCategoryClick(c)}
              className={`flex items-center justify-between w-full text-sm py-1 ${
                selectedCategory === c.id ? "text-[#FF620A] font-semibold" : ""
              }`}
            >
              <span>{c.name}</span>

              {c.subcategories &&
                c.subcategories.length > 0 &&
                (openCategory === c.id ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                ))}

              {selectedCategory === c.id && <Check size={14} />}
            </button>

            {/* Subcategories */}
            {openCategory === c.id &&
              c.subcategories &&
              c.subcategories.length > 0 && (
                <div className="ml-4 mt-1 space-y-1">
                  {c.subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => selectCategory(sub.id)}
                      className={`flex justify-between w-full text-sm py-1 ${
                        selectedCategory === sub.id
                          ? "text-[#FF620A] font-semibold"
                          : ""
                      }`}
                    >
                      {sub.name}
                      {selectedCategory === sub.id && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-bold mb-3 text-sm text-[#007A55]">Price Range</h3>

        <PriceRangeSlider
          min={0}
          max={50000}
          minVal={minPrice}
          maxVal={maxPrice}
          onMinChange={setMinPrice}
          onMaxChange={setMaxPrice}
        />
      </div>
    </div>
  );
}
