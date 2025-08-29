import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Video, 
  Calendar, 
  Shield, 
  CreditCard, 
  FileText, 
  MessageSquare, 
  Stethoscope,
  Users,
  ClipboardList,
  AlertTriangle,
  Pill
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Patient Intake",
      description: "Intelligent chatbot collects symptoms and generates structured JSON summaries for doctor review",
      color: "medical",
      badge: "AI-Powered"
    },
    {
      icon: FileText,
      title: "Smart SOAP Notes",
      description: "AI assists in drafting Subjective, Objective, Assessment, Plan notes from intake and consultation transcripts",
      color: "primary",
      badge: "AI Assistant"
    },
    {
      icon: AlertTriangle,
      title: "Intelligent Triage",
      description: "AI classifier labels cases as 'routine', 'urgent', or 'emergency' with detailed rationale",
      color: "warning",
      badge: "Smart Triage"
    },
    {
      icon: Pill,
      title: "AI Prescription Draft",
      description: "Generates structured prescription JSON for PDF export, requiring doctor's digital signature",
      color: "success",
      badge: "Prescription AI"
    },
    {
      icon: Video,
      title: "Secure Video Consultations",
      description: "High-quality WebRTC video calls with integrated chat and secure file sharing capabilities",
      color: "accent",
      badge: "WebRTC"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Doctor availability management, appointment booking, automated rescheduling, and SMS/email reminders",
      color: "primary",
      badge: "Automated"
    },
    {
      icon: Shield,
      title: "Security & Compliance",
      description: "End-to-end encryption, audit logs, role-based access control, and HIPAA compliance",
      color: "medical",
      badge: "HIPAA Ready"
    },
    {
      icon: CreditCard,
      title: "Integrated Payments",
      description: "Seamless payment processing with Razorpay and Stripe integration for consultation fees",
      color: "success",
      badge: "Multi-Gateway"
    },
    {
      icon: Users,
      title: "Role-Based Dashboards",
      description: "Dedicated patient and doctor dashboards with personalized views and analytics",
      color: "accent",
      badge: "Personalized"
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      medical: "bg-medical/10 text-medical",
      primary: "bg-primary/10 text-primary",
      accent: "bg-accent/10 text-accent",
      success: "bg-success/10 text-success",
      warning: "bg-warning/10 text-warning"
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.primary;
  };

  const getBadgeColor = (color: string) => {
    const badgeMap = {
      medical: "bg-medical-light text-medical border-medical/20",
      primary: "bg-primary/10 text-primary border-primary/20",
      accent: "bg-accent/10 text-accent border-accent/20",
      success: "bg-success/10 text-success border-success/20",
      warning: "bg-warning/10 text-warning border-warning/20"
    };
    return badgeMap[color as keyof typeof badgeMap] || badgeMap.primary;
  };

  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <Badge variant="secondary" className="bg-medical-light text-medical border-medical/20">
            <Stethoscope className="h-3 w-3 mr-1" />
            Platform Features
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Comprehensive Healthcare Platform
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Advanced AI integration, secure communications, and streamlined workflows 
            designed specifically for the Indian healthcare ecosystem.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 bg-gradient-card border-0 shadow-card hover:shadow-elevated transition-all duration-300 hover:transform hover:scale-105 group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${getColorClasses(feature.color)} group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className={getBadgeColor(feature.color)}>
                    {feature.badge}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-primary rounded-2xl p-8 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Transform Healthcare Delivery?
            </h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Join hundreds of healthcare providers already using our platform to deliver 
              better patient care with AI-powered insights and secure telemedicine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors">
                Start Free Trial
              </button>
              <button className="border border-white/30 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;