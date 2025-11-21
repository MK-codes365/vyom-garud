'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Zap, Map, Radio, Eye, Rocket, Send, ChevronRight, Smartphone, Cloud, Shield, Cpu, GitBranch, Users, BarChart3, Lock, Zap as Lightning } from 'lucide-react';

export default function HomePage(): JSX.Element {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleGetStarted = () => {
    console.log('Get Started clicked, navigating to /dashboard');
    router.push('/dashboard');
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/vyomgarud-logo.svg" alt="VyomGarud" className="h-8 w-auto" />
            <span className="font-bold text-lg text-white">VyomGarud</span>
          </div>
        </div>
      </nav>

      {/* Hero Section with Video Background */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectFit: 'cover', zIndex: 0 }}
        >
          <source src="/background.mp4" type="video/mp4" />
        </video>

        {/* Dark Overlay with Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" style={{ zIndex: 1 }}></div>

        {/* Animated Glow Background */}
        <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 2 }}>
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-glow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-glow" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 text-center space-y-8 max-w-4xl px-6">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/50 rounded-full text-blue-200 text-sm font-semibold backdrop-blur-sm hover:border-cyan-400/70 transition-colors duration-300 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            🚁 Next-Gen Drone Control Platform
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold text-white leading-tight animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            Command the Skies with
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent animate-pulse"> Precision & Power</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
            Enterprise-grade drone control with real-time telemetry, AI-powered flight optimization, 
            and advanced safety features. Trusted by professionals.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-10 py-7 text-lg h-auto font-semibold shadow-lg shadow-blue-500/50 hover:shadow-blue-600/70 transition-all duration-300 transform hover:scale-105"
              asChild
            >
              <a href="/dashboard">Launch Dashboard <ArrowRight className="ml-2 w-5 h-5" /></a>
            </Button>
            <Button 
              className="bg-slate-800/80 border-2 border-slate-600 hover:border-cyan-400 text-slate-100 px-10 py-7 text-lg h-auto font-semibold transition-all duration-300"
              asChild
            >
              <a href="#features">Learn More</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-8">
        {[
          { label: '10Hz', desc: 'Telemetry Rate', icon: '⚡' },
          { label: '±0.1m', desc: 'Position Accuracy', icon: '🎯' },
          { label: '360°', desc: 'Flight Control', icon: '🚁' },
          { label: '99.9%', desc: 'Uptime', icon: '✓' },
        ].map((stat, i) => (
          <div key={i} className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/60 rounded-xl p-6 text-center hover:border-cyan-500/50 transition-all duration-300 hover:bg-slate-800/80">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-1">{stat.label}</div>
            <p className="text-sm text-slate-400">{stat.desc}</p>
          </div>
        ))}
      </section>

      {/* Dashboard Preview */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">Dashboard Preview</h2>
          <p className="text-slate-400">See the live dashboard in action</p>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-30 blur-3xl rounded-3xl"></div>
          <div className="relative bg-slate-950 rounded-2xl border border-slate-600/50 overflow-hidden backdrop-blur-sm hover:border-cyan-500/50 transition-colors duration-300 shadow-2xl" style={{ aspectRatio: '16/9', minHeight: '400px' }}>
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              style={{ backgroundColor: '#000' }}
            >
              <source src="/dashboard.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">Powerful Features</h2>
          <p className="text-xl text-slate-400">Enterprise-grade capabilities for professional drone operations</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700 rounded-xl p-8 hover:border-blue-500/80 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500/30 to-blue-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:from-blue-500/50 group-hover:to-blue-600/40 transition-all duration-300">
              <Radio className="w-7 h-7 text-blue-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors">Real-Time Telemetry</h3>
            <p className="text-slate-300 leading-relaxed">
              Stream live drone data with 10Hz refresh rate. Monitor altitude, speed, battery, GPS coordinates, and attitude angles with precision.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700 rounded-xl p-8 hover:border-cyan-500/80 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/30 to-cyan-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:from-cyan-500/50 group-hover:to-cyan-600/40 transition-all duration-300">
              <Map className="w-7 h-7 text-cyan-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-200 transition-colors">Flight Path Planning</h3>
            <p className="text-slate-300 leading-relaxed">
              Define waypoints, set altitude targets, and plan complex missions. Execute with precision and get real-time updates.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700 rounded-xl p-8 hover:border-purple-500/80 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500/30 to-purple-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:from-purple-500/50 group-hover:to-purple-600/40 transition-all duration-300">
              <Eye className="w-7 h-7 text-purple-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors">AI-Powered Insights</h3>
            <p className="text-slate-300 leading-relaxed">
              Get intelligent suggestions for flight adjustments, battery management, and optimal flight paths powered by advanced AI.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700 rounded-xl p-8 hover:border-green-500/80 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500/30 to-green-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:from-green-500/50 group-hover:to-green-600/40 transition-all duration-300">
              <Zap className="w-7 h-7 text-green-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-green-200 transition-colors">Manual Control</h3>
            <p className="text-slate-300 leading-relaxed">
              Take instant control with joystick-like interface. Override auto-flight with confidence and precision whenever needed.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700 rounded-xl p-8 hover:border-orange-500/80 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500/30 to-orange-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:from-orange-500/50 group-hover:to-orange-600/40 transition-all duration-300">
              <Rocket className="w-7 h-7 text-orange-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-200 transition-colors">Geofencing</h3>
            <p className="text-slate-300 leading-relaxed">
              Set virtual boundaries to keep your drone safe. Automatic boundary enforcement with customizable zones and breach alerts.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700 rounded-xl p-8 hover:border-pink-500/80 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20 hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-500/30 to-pink-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:from-pink-500/50 group-hover:to-pink-600/40 transition-all duration-300">
              <Radio className="w-7 h-7 text-pink-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-pink-200 transition-colors">MAVLink Protocol</h3>
            <p className="text-slate-300 leading-relaxed">
              Native MAVLink support. Compatible with PX4 SITL, ArduPilot, and professional drone platforms worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works - Circular Flow */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">How It Works</h2>
          <p className="text-xl text-slate-400">Simple 4-step process to mission readiness</p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 flex-wrap">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/30 to-blue-600/20 border-2 border-blue-400 flex items-center justify-center mb-4 relative group hover:from-blue-500/50 hover:to-blue-600/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30">
              <div className="text-center">
                <Smartphone className="w-12 h-12 text-blue-300 mx-auto mb-1" />
                <p className="text-xs font-bold text-blue-200">Connect</p>
              </div>
            </div>
            <p className="text-slate-300 text-center max-w-xs text-sm">Link your drone and simulator</p>
          </div>

          {/* Arrow 1 */}
          <div className="hidden md:flex items-center justify-center px-4">
            <div className="flex items-center gap-2 text-cyan-400 animate-pulse">
              <ChevronRight className="w-8 h-8" />
              <ChevronRight className="w-8 h-8" />
              <ChevronRight className="w-8 h-8" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500/30 to-cyan-600/20 border-2 border-cyan-400 flex items-center justify-center mb-4 relative group hover:from-cyan-500/50 hover:to-cyan-600/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30">
              <div className="text-center">
                <Map className="w-12 h-12 text-cyan-300 mx-auto mb-1" />
                <p className="text-xs font-bold text-cyan-200">Plan</p>
              </div>
            </div>
            <p className="text-slate-300 text-center max-w-xs text-sm">Design flight path & waypoints</p>
          </div>

          {/* Arrow 2 */}
          <div className="hidden md:flex items-center justify-center px-4">
            <div className="flex items-center gap-2 text-emerald-400 animate-pulse">
              <ChevronRight className="w-8 h-8" />
              <ChevronRight className="w-8 h-8" />
              <ChevronRight className="w-8 h-8" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border-2 border-emerald-400 flex items-center justify-center mb-4 relative group hover:from-emerald-500/50 hover:to-emerald-600/40 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/30">
              <div className="text-center">
                <Zap className="w-12 h-12 text-emerald-300 mx-auto mb-1" />
                <p className="text-xs font-bold text-emerald-200">Execute</p>
              </div>
            </div>
            <p className="text-slate-300 text-center max-w-xs text-sm">Launch flight with real-time telemetry</p>
          </div>

          {/* Arrow 3 */}
          <div className="hidden md:flex items-center justify-center px-4">
            <div className="flex items-center gap-2 text-purple-400 animate-pulse">
              <ChevronRight className="w-8 h-8" />
              <ChevronRight className="w-8 h-8" />
              <ChevronRight className="w-8 h-8" />
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/30 to-purple-600/20 border-2 border-purple-400 flex items-center justify-center mb-4 relative group hover:from-purple-500/50 hover:to-purple-600/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-purple-300 mx-auto mb-1" />
                <p className="text-xs font-bold text-purple-200">Analyze</p>
              </div>
            </div>
            <p className="text-slate-300 text-center max-w-xs text-sm">Review AI insights & logs</p>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-slate-400 text-lg">From setup to mission complete in minutes</p>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">Real-World Applications</h2>
          <p className="text-xl text-slate-400">Proven use cases across industries</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Agricultural Monitoring */}
          <div className="group bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/30 rounded-xl p-8 hover:border-green-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500/40 to-emerald-500/30 rounded-lg flex items-center justify-center mb-4 group-hover:from-green-500/60 group-hover:to-emerald-500/50 transition-all duration-300">
              <Users className="w-7 h-7 text-green-300" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-green-200 transition-colors">Agricultural Monitoring</h3>
            <p className="text-slate-300 leading-relaxed">
              Real-time crop health surveillance, precision irrigation planning, and yield optimization. Monitor vast areas with 10Hz accuracy.
            </p>
            <div className="mt-4 pt-4 border-t border-green-500/20">
              <span className="text-xs font-semibold text-green-300 bg-green-500/10 px-3 py-1 rounded-full">100+ Farms</span>
            </div>
          </div>

          {/* Search & Rescue */}
          <div className="group bg-gradient-to-br from-red-500/10 to-orange-500/5 border border-red-500/30 rounded-xl p-8 hover:border-red-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20">
            <div className="w-14 h-14 bg-gradient-to-br from-red-500/40 to-orange-500/30 rounded-lg flex items-center justify-center mb-4 group-hover:from-red-500/60 group-hover:to-orange-500/50 transition-all duration-300">
              <Radio className="w-7 h-7 text-red-300" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-red-200 transition-colors">Search & Rescue</h3>
            <p className="text-slate-300 leading-relaxed">
              Rapid deployment for emergency response. Real-time GPS tracking, geofencing for safety zones, and instant decision support.
            </p>
            <div className="mt-4 pt-4 border-t border-red-500/20">
              <span className="text-xs font-semibold text-red-300 bg-red-500/10 px-3 py-1 rounded-full">Emergency Ready</span>
            </div>
          </div>

          {/* Infrastructure Inspection */}
          <div className="group bg-gradient-to-br from-orange-500/10 to-yellow-500/5 border border-orange-500/30 rounded-xl p-8 hover:border-orange-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500/40 to-yellow-500/30 rounded-lg flex items-center justify-center mb-4 group-hover:from-orange-500/60 group-hover:to-yellow-500/50 transition-all duration-300">
              <Cpu className="w-7 h-7 text-orange-300" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-orange-200 transition-colors">Infrastructure Inspection</h3>
            <p className="text-slate-300 leading-relaxed">
              Bridge, tower, and pipeline inspections with precision positioning. Safe geofenced operations around critical infrastructure.
            </p>
            <div className="mt-4 pt-4 border-t border-orange-500/20">
              <span className="text-xs font-semibold text-orange-300 bg-orange-500/10 px-3 py-1 rounded-full">Safety Certified</span>
            </div>
          </div>

          {/* Surveying & Mapping */}
          <div className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/30 rounded-xl p-8 hover:border-blue-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500/40 to-cyan-500/30 rounded-lg flex items-center justify-center mb-4 group-hover:from-blue-500/60 group-hover:to-cyan-500/50 transition-all duration-300">
              <Map className="w-7 h-7 text-blue-300" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors">Surveying & Mapping</h3>
            <p className="text-slate-300 leading-relaxed">
              Professional-grade cartography and land surveying. Autonomous flight paths for consistent coverage and high-precision positioning.
            </p>
            <div className="mt-4 pt-4 border-t border-blue-500/20">
              <span className="text-xs font-semibold text-blue-300 bg-blue-500/10 px-3 py-1 rounded-full">±0.1m Accuracy</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">Built with Modern Tech</h2>
          <p className="text-xl text-slate-400">Production-ready architecture with industry standards</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Frontend */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/60 rounded-xl p-8 hover:border-blue-500/50 transition-all duration-300">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Cloud className="w-6 h-6 text-blue-400" />
              Frontend
            </h3>
            <div className="space-y-3">
              {['Next.js 15.3', 'React 18.3', 'TypeScript', 'Tailwind CSS', 'Shadcn/UI'].map((tech, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-300">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  {tech}
                </div>
              ))}
            </div>
          </div>

          {/* Backend & Real-Time */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/60 rounded-xl p-8 hover:border-cyan-500/50 transition-all duration-300">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Cpu className="w-6 h-6 text-cyan-400" />
              Backend & Streaming
            </h3>
            <div className="space-y-3">
              {['Node.js API Routes', 'Server-Sent Events (SSE)', 'MAVLink Protocol', 'WebSocket Support', 'REST APIs'].map((tech, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-300">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                  {tech}
                </div>
              ))}
            </div>
          </div>

          {/* Drone & AI */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/60 rounded-xl p-8 hover:border-emerald-500/50 transition-all duration-300">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Rocket className="w-6 h-6 text-emerald-400" />
              Drone & AI
            </h3>
            <div className="space-y-3">
              {['MAVSDK Integration', 'PX4 SITL Simulator', 'ArduPilot Support', 'Google Gemini API', 'Python Backend'].map((tech, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-300">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 p-8 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl text-center">
          <p className="text-slate-300 text-lg">
            <span className="font-semibold text-blue-300">100% Open Architecture</span> - Designed for scalability and extensibility with modern DevOps practices
          </p>
        </div>
      </section>

      {/* Trust & Security Badges */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-xl p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Shield, label: 'Production Ready', color: 'text-green-400' },
              { icon: Lock, label: 'Enterprise Security', color: 'text-blue-400' },
              { icon: GitBranch, label: 'Open Source', color: 'text-purple-400' },
              { icon: Zap, label: '99.9% Uptime', color: 'text-yellow-400' },
            ].map((badge, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <badge.icon className={`w-8 h-8 ${badge.color}`} />
                <p className="text-sm font-semibold text-slate-300">{badge.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">Frequently Asked</h2>
          <p className="text-xl text-slate-400">Everything you need to know</p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'What drones are supported?',
              a: 'VyomGarud supports any drone with MAVLink protocol support, including PX4, ArduPilot, and most commercial drones. Our simulator allows testing with any configuration.',
            },
            {
              q: 'Can I use this with my existing drone?',
              a: 'Yes! As long as your drone supports MAVLink protocol, you can integrate it. We provide detailed setup guides for popular platforms.',
            },
            {
              q: 'Is internet connection required?',
              a: 'No. All local operations work offline. Cloud features and AI analysis are optional and only used when needed.',
            },
            {
              q: 'How accurate is the real-time telemetry?',
              a: 'We provide 10Hz streaming with ±0.1m position accuracy and millisecond-level timing for mission-critical operations.',
            },
            {
              q: 'Can I deploy this on my own servers?',
              a: 'Yes! Enterprise plan includes private deployment options and full API access for custom integrations.',
            },
            {
              q: 'What about safety and geofencing?',
              a: 'Safety is built-in. Geofencing, boundary checks, and real-time breach detection prevent unauthorized flight operations.',
            },
          ].map((item, idx) => (
            <details key={idx} className="group bg-gradient-to-r from-slate-800/60 to-slate-900/60 border border-slate-700/60 rounded-xl p-6 hover:border-cyan-500/40 transition-colors cursor-pointer">
              <summary className="flex items-center justify-between font-semibold text-white cursor-pointer">
                {item.q}
                <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform text-cyan-400" />
              </summary>
              <p className="mt-4 text-slate-300 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="max-w-2xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-emerald-500/10 border border-blue-500/30 rounded-xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Stay Updated</h2>
          <p className="text-slate-300 mb-8">Get the latest features, updates, and drone operation tips delivered to your inbox</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input 
              type="email"
              placeholder="your@email.com"
              className="bg-slate-900/60 border border-slate-700/60 text-white placeholder:text-slate-500 flex-1"
            />
            <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white h-11 px-8 font-semibold">Subscribe</Button>
          </div>
          <p className="text-xs text-slate-400 mt-4">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* Future Roadmap Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Coming Soon</h2>
          <p className="text-xl text-slate-400">Exciting features in development</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {[
            { title: 'Swarm Control', desc: 'Command multiple drones as a unified fleet with synchronized movements' },
            { title: 'Video Streaming', desc: 'Real-time FPV feed with low-latency video from drone cameras' },
            { title: 'Cloud Logging', desc: 'Automatic flight data backup and analysis in the cloud' },
            { title: 'Mobile App', desc: 'Native iOS and Android apps for on-the-go drone control' },
            { title: 'Advanced Analytics', desc: 'Machine learning insights on flight patterns and optimization' },
            { title: 'Hardware Integration', desc: 'Direct support for popular drone and radio transmitter brands' },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section Before Contact */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 opacity-20 blur-3xl rounded-2xl"></div>
          <div className="relative bg-gradient-to-r from-slate-800/70 to-slate-900/70 border border-slate-700/70 rounded-2xl p-12 backdrop-blur-sm">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready to Take Flight?</h2>
            <p className="text-slate-300 text-lg mb-8">Join professionals who trust VyomGarud for mission-critical drone operations</p>
            <Button 
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-12 py-7 text-lg h-auto font-semibold shadow-lg shadow-emerald-500/50 hover:shadow-emerald-600/70 transition-all duration-300 transform hover:scale-105"
              asChild
            >
              <a href="/dashboard">Start Flying Now <Rocket className="ml-2 w-5 h-5" /></a>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-2xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-b from-slate-800/60 to-slate-900/60 border border-slate-700/60 rounded-2xl p-8 md:p-12 backdrop-blur-sm hover:border-cyan-500/40 transition-colors duration-300">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Get in Touch</h2>
            <p className="text-slate-400">Questions? Let's talk about your drone operations needs.</p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
              <Input 
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Your name"
                className="bg-slate-900/60 border border-slate-700/60 text-white placeholder:text-slate-500 focus:border-cyan-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <Input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                placeholder="your@email.com"
                className="bg-slate-900/60 border border-slate-700/60 text-white placeholder:text-slate-500 focus:border-cyan-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleFormChange}
                placeholder="Tell us about your drone operations..."
                rows={5}
                className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg text-white placeholder:text-slate-500 px-4 py-2 focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white h-12 text-base font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 transition-all duration-300"
              >
                {submitted ? '✓ Message Sent!' : 'Send Message'} <Send className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-slate-400">
          <p>© 2025 VyomGarud. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
