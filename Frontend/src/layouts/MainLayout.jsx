import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import { ScrollToTop } from "./ScrollToTop";

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <ScrollToTop/>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
