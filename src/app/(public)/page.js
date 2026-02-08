import Banner from "@/components/banner";
import BonusPromo from "@/components/BonusPromo";
import CategorySlider from "@/components/CategorySlider";
import FeaturedProducts from "@/components/FeaturedProducts";
import Features from "@/components/Features";
import NewArrivals from "@/components/NewArrivals";

export default function Home() {
  return (
    <main>
      <Banner />
      <NewArrivals />
      <CategorySlider />
      <FeaturedProducts />
      <BonusPromo />
    </main>
  );
}
