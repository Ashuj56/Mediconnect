import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Stethoscope, Menu, X, Shield, Calendar, Users, Brain } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">MediConnect</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Healthcare</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              <a href="#features" className="text-foreground hover:text-primary transition-colors flex items-center space-x-1">
                <Brain className="h-4 w-4" />
                <span>AI Features</span>
              </a>
              <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>How it Works</span>
              </a>
              <a href="#security" className="text-foreground hover:text-primary transition-colors flex items-center space-x-1">
                <Shield className="h-4 w-4" />
                <span>Security</span>
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/auth'}>Login</Button>
              <Button variant="medical" size="sm" onClick={() => window.location.href = '/auth'}>Get Started</Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-border animate-slide-in">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-foreground hover:text-primary transition-colors flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span>AI Features</span>
              </a>
              <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>How it Works</span>
              </a>
              <a href="#security" className="text-foreground hover:text-primary transition-colors flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Security</span>
              </a>
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/auth'}>Login</Button>
                <Button variant="medical" size="sm" onClick={() => window.location.href = '/auth'}>Get Started</Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;