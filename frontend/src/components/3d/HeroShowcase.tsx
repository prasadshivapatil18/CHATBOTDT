import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SupportOrb, type AssistantVisualState } from './SupportOrb';
import { Sparkles, ArrowDown, Package, ShieldCheck, Zap, Bot, ExternalLink } from 'lucide-react';
import { NeoButton } from '../ui/NeoButton';
import { NeoBadge } from '../ui/NeoBadge';

// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

interface HeroShowcaseProps {
  onStartChat: (samplePrompt?: string) => void;
  onOpenReturns: () => void;
  assistantState?: AssistantVisualState;
}

export const HeroShowcase: React.FC<HeroShowcaseProps> = ({
  onStartChat,
  onOpenReturns,
  assistantState = 'idle',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbWrapperRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Initial entrance animation for hero elements
      gsap.from(headlineRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.9,
        ease: 'power3.out',
      });

      // 2. ScrollTrigger for 3D Orb and features transition
      if (orbWrapperRef.current && containerRef.current) {
        gsap.to(orbWrapperRef.current, {
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom center',
            scrub: 1,
          },
          scale: 0.88,
          rotationY: 25,
          y: 40,
          ease: 'none',
        });
      }

      // 3. Stagger feature cards on scroll
      if (featuresRef.current) {
        const cards = featuresRef.current.querySelectorAll('.feature-card');
        gsap.from(cards, {
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          opacity: 0,
          y: 40,
          stagger: 0.15,
          duration: 0.7,
          ease: 'power2.out',
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full border-b-[4px] border-[#171717] bg-[#FFFDF5] overflow-hidden"
    >
      {/* Neo-brutalist background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#171717 1px, transparent 1px), linear-gradient(90deg, #171717 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16">
        {/* Top Hero Grid: Left Content, Right 3D Astra Assistant */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Content (7 cols) */}
          <div className="lg:col-span-7 space-y-6 z-10">
            {/* Top pill badge */}
            <div className="flex flex-wrap items-center gap-2">
              <NeoBadge variant="lime" className="px-3 py-1 font-mono uppercase tracking-widest text-xs">
                <span className="w-2 h-2 rounded-full bg-[#171717] inline-block mr-1.5 animate-ping"></span>
                ASTRA 3D NEURAL CORE • GLSL SHADER
              </NeoBadge>
              <span className="text-xs font-black uppercase tracking-wider text-stone-700 bg-[#FFE156] border-[2px] border-[#171717] px-2.5 py-0.5 rounded-[2px] shadow-[2px_2px_0_#171717]">
                13 DEMO ORDERS READY
              </span>
            </div>

            {/* Main Headline */}
            <h1
              ref={headlineRef}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#171717] leading-[1.08] tracking-tight"
            >
              CUSTOMER SUPPORT WITH A{' '}
              <span className="bg-[#FFE156] px-2 py-0.5 border-[3px] border-[#171717] inline-block shadow-[4px_4px_0_#171717] -rotate-1">
                LIQUID 3D
              </span>{' '}
              MIND.
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg font-bold text-stone-700 max-w-xl leading-relaxed">
              Inspired by the organic fluidity of the Astra visual identity. Move your cursor to deform the 
              intelligent support orb in real time. Backed by grounded database retrieval, instant returns, and 
              zero robotic platitudes.
            </p>

            {/* Quick Demo Order Actions */}
            <div className="p-4 bg-white border-[3px] border-[#171717] rounded-[4px] shadow-[5px_5px_0_#171717] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#171717] flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-[#4D7CFE]" />
                  Instant Scenario Starters:
                </span>
                <span className="text-[10px] font-mono font-bold text-stone-500 uppercase">
                  Click to Test
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onStartChat('Where is my order ORD-DEMO-1001?')}
                  className="text-xs font-black bg-[#FFFDF5] hover:bg-[#FFE156] border-[2px] border-[#171717] px-2.5 py-1 rounded-[2px] shadow-[2px_2px_0_#171717] transition-all hover:translate-x-[1px] hover:translate-y-[1px]"
                >
                  📦 ORD-1001 (Delivered)
                </button>
                <button
                  onClick={() => onStartChat('What is the status of ORD-DEMO-1002?')}
                  className="text-xs font-black bg-[#FFFDF5] hover:bg-[#FFE156] border-[2px] border-[#171717] px-2.5 py-1 rounded-[2px] shadow-[2px_2px_0_#171717] transition-all hover:translate-x-[1px] hover:translate-y-[1px]"
                >
                  🚚 ORD-1002 (Delayed)
                </button>
                <button
                  onClick={() => onStartChat('Can I return ORD-DEMO-1004?')}
                  className="text-xs font-black bg-[#FFFDF5] hover:bg-[#B8F56A] border-[2px] border-[#171717] px-2.5 py-1 rounded-[2px] shadow-[2px_2px_0_#171717] transition-all hover:translate-x-[1px] hover:translate-y-[1px]"
                >
                  🔄 ORD-1004 (Return Window)
                </button>
                <button
                  onClick={() => onStartChat('Cancel order ORD-DEMO-1003')}
                  className="text-xs font-black bg-[#FFFDF5] hover:bg-[#FF6B6B] hover:text-white border-[2px] border-[#171717] px-2.5 py-1 rounded-[2px] shadow-[2px_2px_0_#171717] transition-all hover:translate-x-[1px] hover:translate-y-[1px]"
                >
                  🛑 ORD-1003 (Cancellation)
                </button>
              </div>
            </div>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <NeoButton
                variant="yellow"
                size="lg"
                onClick={() => onStartChat()}
                className="shadow-[6px_6px_0_#171717] hover:shadow-[3px_3px_0_#171717] flex items-center gap-2 text-base font-black"
              >
                <Bot className="w-5 h-5" />
                <span>Launch Live Chat</span>
                <ArrowDown className="w-4 h-4 ml-1 animate-bounce" />
              </NeoButton>

              <NeoButton
                variant="white"
                size="lg"
                onClick={onOpenReturns}
                className="shadow-[6px_6px_0_#171717] hover:shadow-[3px_3px_0_#171717] flex items-center gap-2 text-base font-black"
              >
                <span>30-Day Return Portal</span>
                <ExternalLink className="w-4 h-4" />
              </NeoButton>
            </div>
          </div>

          {/* Right Hero Showcase: Interactive 3D Support Orb (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div
              ref={orbWrapperRef}
              className="relative w-full max-w-[460px] aspect-square rounded-[8px] bg-gradient-to-b from-[#FFFBEA] to-[#F7F3E8] border-[4px] border-[#171717] shadow-[10px_10px_0_#171717] p-2 flex flex-col items-center justify-center overflow-hidden group"
            >
              {/* Corner Tag */}
              <div className="absolute top-3 left-3 z-20">
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 bg-[#171717] text-white rounded-[2px] tracking-wider">
                  INTERACTIVE SHADER CANVAS
                </span>
              </div>

              {/* State Indicator */}
              <div className="absolute top-3 right-3 z-20">
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 bg-[#B8F56A] text-[#171717] border border-[#171717] rounded-[2px] shadow-[1px_1px_0_#171717]">
                  STATE: {assistantState.toUpperCase()}
                </span>
              </div>

              {/* The 3D Three.js Orb */}
              <div className="w-full h-full min-h-[340px]">
                <SupportOrb state={assistantState} size="hero" />
              </div>

              {/* Bottom Interactive Prompt */}
              <div className="absolute bottom-3 inset-x-3 z-20 bg-white/95 backdrop-blur-sm border-[2px] border-[#171717] rounded-[4px] px-3 py-1.5 flex items-center justify-between text-xs font-bold text-[#171717] shadow-[2px_2px_0_#171717]">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFE156] fill-[#FFE156]" />
                  Hover & move mouse to deform liquid core
                </span>
                <span className="text-[10px] font-mono uppercase text-stone-500">
                  Real-time GLSL
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div ref={featuresRef} className="mt-14 pt-10 border-t-[3px] border-[#171717] grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="feature-card bg-white border-[3px] border-[#171717] rounded-[6px] p-5 shadow-[5px_5px_0_#171717] space-y-2">
            <div className="w-10 h-10 bg-[#FFE156] border-[2px] border-[#171717] rounded-[4px] shadow-[2px_2px_0_#171717] flex items-center justify-center font-black">
              <Zap className="w-5 h-5 text-[#171717]" />
            </div>
            <h3 className="text-lg font-black text-[#171717]">GLSL Liquid Physics</h3>
            <p className="text-xs font-bold text-stone-600 leading-relaxed">
              Custom vertex shader calculates cursor proximity and velocity inertia to deform the orb surface smoothly with spring-back damping.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="feature-card bg-white border-[3px] border-[#171717] rounded-[6px] p-5 shadow-[5px_5px_0_#171717] space-y-2">
            <div className="w-10 h-10 bg-[#B8F56A] border-[2px] border-[#171717] rounded-[4px] shadow-[2px_2px_0_#171717] flex items-center justify-center font-black">
              <Sparkles className="w-5 h-5 text-[#171717]" />
            </div>
            <h3 className="text-lg font-black text-[#171717]">Chat-Synchronized States</h3>
            <p className="text-xs font-bold text-stone-600 leading-relaxed">
              Orb animation changes color, sound-wave frequency, and pulse rates reflecting real-time chat states: idle, processing, generating, and success.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="feature-card bg-white border-[3px] border-[#171717] rounded-[6px] p-5 shadow-[5px_5px_0_#171717] space-y-2">
            <div className="w-10 h-10 bg-[#4D7CFE] text-white border-[2px] border-[#171717] rounded-[4px] shadow-[2px_2px_0_#171717] flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-black text-[#171717]">Grounded Retail Workflows</h3>
            <p className="text-xs font-bold text-stone-600 leading-relaxed">
              Never hallucinates order numbers or fake refunds. Powered by PostgreSQL/SQLite tables and seamless Tier-2 human support escalation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
