import Bar from "./navigation/navigation.js";
import naturehoodLogo from '../public/naturehood.svg';

import Link from "next/link";

const founder = {
  name: "Chevy Cheung",
  role: "Co-Founder & CEO"
}

export default function Page() {
  return (
  
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <img src='/naturehood.svg'
      alt="NATUREHOOD Logo" 
      width={350} 
      height={200} 
      />

      <h1>Sport.  Nature.  Lifestyle.</h1>
      <Bar />
    </div>

    


  )
}
    