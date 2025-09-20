import { createFileRoute } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import patternImage from '../pattern.png'
import { LoginSheet } from '../components/LoginSheet'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="bg-[#1d1d1d] relative h-screen w-full overflow-hidden">
      {/* Background pattern overlay */}
      <div 
        className="absolute inset-0 bg-center bg-cover bg-no-repeat mix-blend-screen opacity-5"
        style={{ backgroundImage: `url('${patternImage}')` }}
      />
      
      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Spacer to push content down */}
        <div className="flex-1" />
        
        {/* Main Content Area - positioned 5% from bottom */}
        <div className="pb-[5vh] pl-[73px]">
          {/* Fraternity name */}
          <div className="mb-[61px]">
            <div className="relative inline-block">
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#7350ff]" />
              <h2 className="font-['coolvetica',sans-serif] font-light text-2xl text-white leading-none pb-2.5 px-2.5">
                ALPHA KAPPA PSI CHI SIGMA
              </h2>
            </div>
          </div>
          
          {/* Dashboard title and login button */}
          <div className="flex items-end gap-16">
            {/* Dashboard title */}
            <h1 className="font-['coolvetica',sans-serif] font-normal text-[96px] text-white leading-none">
              delibs dashboard
            </h1>
            
            {/* Login button */}
            <LoginSheet>
              <button className="flex items-center gap-3 text-white hover:text-[#7350ff] transition-colors group mb-2 cursor-pointer">
                <span className="font-['coolvetica',sans-serif] font-normal text-base leading-none">
                  login
                </span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </LoginSheet>
          </div>
        </div>
      </div>
    </div>
  )
}
