import Bar from "./navigation/navigation.js";
import Clock from "./components/clock.js";
import EmailSubscribe from "./components/email.js";


import Link from "next/link";



export default function Page() {
  return (
  
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <img src='/naturehood.svg'
      alt="NATUREHOOD Logo" 
      width={350} 
      height={200} 
      />

      <h1>Athlete's Lifestyle.</h1>
      
      <Bar />
      <EmailSubscribe />
      <Clock />
    </div>

    


  )
}
    