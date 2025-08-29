import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Shield, Clock, Users, Brain, Zap } from 'lucide-react';
import heroImage from '@/assets/hero-doctor.jpg';

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-hero flex items-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-medical/5 to-accent/10" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-medical-light text-medical border-medical/20">
                <Brain className="h-3 w-3 mr-1" />
                AI-Powered Healthcare Platform
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                Secure Telemedicine
                <span className="block text-accent">for India</span>
              </h1>
              
              <p className="text-lg md:text-xl text-white/90 max-w-2xl">
                Connect patients with doctors through secure video consultations, AI-powered intake, 
                smart SOAP notes, and automated triage - all in one HIPAA-compliant platform.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="text-lg px-8 py-4" onClick={() => window.location.href = '/auth'}>
                Start Free Trial
                <Zap className="h-5 w-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Play className="h-5 w-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">10K+</div>
                <div className="text-white/80 text-sm">Consultations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">500+</div>
                <div className="text-white/80 text-sm">Doctors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">99.9%</div>
                <div className="text-white/80 text-sm">Uptime</div>
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image & Features */}
          <div className="relative animate-fade-in">
            {/* Main Hero Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-elevated">
              <img 
                src={heroImage} 
                alt="Professional doctor using telemedicine platform"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>

            {/* Floating Feature Cards */}
            <Card className="absolute -top-4 -left-4 p-4 bg-card/95 backdrop-blur-sm border-0 shadow-medical">
              <div className="flex items-center space-x-3">
                <div className="bg-success/10 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-success" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Secure & Compliant</div>
                  <div className="text-xs text-muted-foreground">End-to-end encryption</div>
                </div>
              </div>
            </Card>

            <Card className="absolute -bottom-4 -right-4 p-4 bg-card/95 backdrop-blur-sm border-0 shadow-medical">
              <div className="flex items-center space-x-3">
                <div className="bg-medical/10 p-2 rounded-lg">
                  <Brain className="h-5 w-5 text-medical" />
                </div>
                <div>
                  <div className="font-semibold text-sm">AI Assistant</div>
                  <div className="text-xs text-muted-foreground">Smart diagnosis support</div>
                </div>
              </div>
            </Card>

            <Card className="absolute top-1/2 -right-8 p-3 bg-card/95 backdrop-blur-sm border-0 shadow-medical">
              <div className="flex items-center space-x-2">
                <div className="bg-accent/10 p-1.5 rounded">
                  <Clock className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <div className="font-semibold text-xs">24/7 Available</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 text-background fill-current">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;