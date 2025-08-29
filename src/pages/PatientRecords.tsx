import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Users, Search, FileText, Calendar, Stethoscope } from 'lucide-react';
import { format } from 'date-fns';

const PatientRecords = () => {
  const { user, profile } = useAuth();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile?.role === 'doctor') {
      fetchPatients();
    }
  }, [user, profile]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      
      // Get unique patients who have appointments with this doctor
      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select(`
          patient_id,
          patient:profiles!appointments_patient_id_fkey(
            user_id,
            first_name,
            last_name,
            date_of_birth,
            gender,
            phone
          ),
          created_at,
          status,
          chief_complaint
        `)
        .eq('doctor_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by patient and get latest appointment info
      const patientsMap = new Map();
      appointmentsData?.forEach((appointment: any) => {
        const patientId = appointment.patient_id;
        if (!patientsMap.has(patientId) || 
            new Date(appointment.created_at) > new Date(patientsMap.get(patientId).lastVisit)) {
          patientsMap.set(patientId, {
            ...appointment.patient,
            lastVisit: appointment.created_at,
            lastComplaint: appointment.chief_complaint,
            totalAppointments: appointmentsData.filter(a => a.patient_id === patientId).length
          });
        }
      });

      setPatients(Array.from(patientsMap.values()));
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      toast({
        title: "Error",
        description: "Failed to load patient records",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient: any) =>
    `${patient.first_name} ${patient.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const viewPatientHistory = (patientId: string) => {
    navigate(`/patient-history/${patientId}`);
  };

  if (profile?.role !== 'doctor') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Access denied. Doctor privileges required.</p>
            <Button className="mt-4" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading patient records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5">
      <header className="bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="bg-gradient-primary p-2 rounded-lg">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Patient Records</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Your Patients</h2>
            <p className="text-muted-foreground">
              Manage and view patient records and appointment history
            </p>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search patients by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredPatients.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-2">
                  {searchTerm ? 'No patients found' : 'No patients yet'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Patients will appear here after they book appointments with you'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPatients.map((patient: any) => (
                <Card key={patient.user_id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {patient.first_name} {patient.last_name}
                        </CardTitle>
                        <CardDescription>
                          {patient.gender && `${patient.gender} • `}
                          {patient.date_of_birth && 
                            `${new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} years old`
                          }
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {patient.totalAppointments} visits
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {patient.phone && (
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="text-sm font-medium">{patient.phone}</p>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Last Visit</p>
                        <p className="text-sm font-medium">
                          {format(new Date(patient.lastVisit), 'MMM dd, yyyy')}
                        </p>
                      </div>

                      {patient.lastComplaint && (
                        <div>
                          <p className="text-sm text-muted-foreground">Last Complaint</p>
                          <p className="text-sm">{patient.lastComplaint}</p>
                        </div>
                      )}

                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => viewPatientHistory(patient.user_id)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View History
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientRecords;