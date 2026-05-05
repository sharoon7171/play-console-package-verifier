import Footer from "./components/Footer";
import Header from "./components/Header";
import HelpInfo from "./components/HelpInfo";
import SignerForm from "./components/SignerForm";

export default function App() {
  return (
    <>
      <Header />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl space-y-3 px-4 py-4 sm:py-5">
          <SignerForm />
          <HelpInfo />
        </div>
      </main>
      <Footer />
    </>
  );
}
