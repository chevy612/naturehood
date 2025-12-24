
import Clock from "./components/clock.js";
import EmailSubscribe from "./components/email.js";
import StickyBar from "./navigation/sticky";


export default function Page() {
  return (
      <div className="min-h-screen flex flex-col justify-start gap-6">
        <StickyBar />
        <EmailSubscribe />
        <Clock />
      </div>
  );
}

{/* hero section */}
{/* about section */}