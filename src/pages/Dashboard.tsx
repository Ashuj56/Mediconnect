import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Users, 
  DollarSign, 
  Activity,
  MessageSquare,
  Video,
  LogOut,
  Stethoscope
} from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';

const Dashboard = () => {
  const { user, profile, signOut } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedConsultations: 0,
    pendingPayments: 0,
    aiAssistance: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile) {
      fetchDashboardData();
    }
  }, [user, profile]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch appointments based on user role
      const appointmentQuery = profile?.role === 'doctor' 
        ? supabase.from('appointments').select(`
            *,
            patient:profiles!appointments_patient_id_fkey(first_name, last_name),
            payments(status, amount)
          `).eq('doctor_id', user?.id)
        : supabase.from('appointments').select(`
            *,
            doctor:profiles!appointments_doctor_id_fkey(first_name, last_name, specialization),
            payments(status, amount)
          `).eq('patient_id', user?.id);

      const { data: appointmentsData, error: appointmentsError } = await appointmentQuery
        .order('scheduled_at', { ascending: false })
        .limit(10);

      if (appointmentsError) throw appointmentsError;

      setAppointments(appointmentsData || []);

      // Calculate stats
      const totalAppointments = appointmentsData?.length || 0;
      const completedConsultations = appointmentsData?.filter(apt => apt.status === 'completed').length || 0;
      const pendingPayments = appointmentsData?.filter(apt => 
        apt.payments?.some(payment => payment.status === 'pending')
      ).length || 0;

      setStats({
        totalAppointments,
        completedConsultations,
        pendingPayments,
        aiAssistance: completedConsultations // Placeholder
      });

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'scheduled': return 'secondary';
      case 'in_progress': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-primary p-2 rounded-lg">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">MediConnect</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome, {profile?.first_name} {profile?.last_name} ({profile?.role})
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Appointments</p>
                      <p className="text-2xl font-bold">{stats.totalAppointments}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Video className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Consultations</p>
                      <p className="text-2xl font-bold">{stats.completedConsultations}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium">Pending Payments</p>
                      <p className="text-2xl font-bold">{stats.pendingPayments}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">AI Assistance</p>
                      <p className="text-2xl font-bold">{stats.aiAssistance}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
                <CardDescription>
                  Your latest appointments and consultations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No appointments found. {profile?.role === 'patient' ? 'Book your first consultation!' : 'Your schedule is clear.'}
                    </p>
                  ) : (
                    appointments.map((appointment: any) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {profile?.role === 'doctor' 
                                ? `${appointment.patient?.first_name} ${appointment.patient?.last_name}`
                                : `Dr. ${appointment.doctor?.first_name} ${appointment.doctor?.last_name}`
                              }
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(appointment.scheduled_at).toLocaleDateString()} at{' '}
                              {new Date(appointment.scheduled_at).toLocaleTimeString()}
                            </p>
                            {appointment.chief_complaint && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {appointment.chief_complaint}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getStatusBadgeVariant(appointment.status)}>
                            {appointment.status}
                          </Badge>
                          {appointment.status === 'scheduled' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/consultation/${appointment.id}`)}
                            >
                              <Video className="h-4 w-4 mr-1" />
                              Join
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {profile?.role === 'patient' ? (
                  <>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => navigate('/book-appointment')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Appointment
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => navigate('/prescriptions')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Prescriptions
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => navigate('/payment-history')}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Payment History
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => navigate('/patient-records')}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Patient Records
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Clock className="h-4 w-4 mr-2" />
                      Set Availability
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      SOAP Notes
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* AI Intake Assistant - Only for patients */}
            {profile?.role === 'patient' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>AI Health Assistant</span>
                  </CardTitle>
                  <CardDescription>
                    Describe your symptoms and get preliminary assessment
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ChatInterface />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;