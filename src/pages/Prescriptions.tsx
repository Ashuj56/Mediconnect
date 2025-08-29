import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, FileText, Download, Calendar, Stethoscope } from 'lucide-react';
import { format } from 'date-fns';

const Prescriptions = () => {
  const { user, profile } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchPrescriptions();
    }
  }, [user]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      
      const query = profile?.role === 'doctor'
        ? supabase.from('prescriptions').select(`
            *,
            patient:profiles!prescriptions_patient_id_fkey(first_name, last_name),
            appointment:appointments(scheduled_at, chief_complaint)
          `).eq('doctor_id', user?.id)
        : supabase.from('prescriptions').select(`
            *,
            doctor:profiles!prescriptions_doctor_id_fkey(first_name, last_name),
            appointment:appointments(scheduled_at, chief_complaint)
          `).eq('patient_id', user?.id);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setPrescriptions(data || []);
    } catch (error: any) {
      console.error('Error fetching prescriptions:', error);
      toast({
        title: "Error",
        description: "Failed to load prescriptions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading prescriptions...</p>
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
            <h1 className="text-xl font-bold text-foreground">Prescriptions</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {profile?.role === 'doctor' ? 'Prescribed Medications' : 'Your Prescriptions'}
            </h2>
            <p className="text-muted-foreground">
              {profile?.role === 'doctor' 
                ? 'Manage and view prescriptions you have issued' 
                : 'View and download your prescription history'
              }
            </p>
          </div>

          {prescriptions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-2">No prescriptions found</p>
                <p className="text-sm text-muted-foreground">
                  {profile?.role === 'doctor' 
                    ? 'You haven\'t issued any prescriptions yet.' 
                    : 'No prescriptions have been issued for you yet.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((prescription: any) => (
                <Card key={prescription.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {profile?.role === 'doctor' 
                            ? `${prescription.patient?.first_name} ${prescription.patient?.last_name}`
                            : `Dr. ${prescription.doctor?.first_name} ${prescription.doctor?.last_name}`
                          }
                        </CardTitle>
                        <CardDescription className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {format(new Date(prescription.created_at), 'MMM dd, yyyy')}
                          </span>
                          {prescription.valid_until && (
                            <span>
                              Valid until: {format(new Date(prescription.valid_until), 'MMM dd, yyyy')}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {prescription.is_ai_assisted && (
                          <Badge variant="secondary">AI Assisted</Badge>
                        )}
                        <Badge variant={prescription.is_signed ? "default" : "outline"}>
                          {prescription.is_signed ? "Signed" : "Draft"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {prescription.appointment?.chief_complaint && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">Complaint</h4>
                          <p className="text-sm">{prescription.appointment.chief_complaint}</p>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Medications</h4>
                        <div className="space-y-2">
                          {prescription.medications?.map((med: any, index: number) => (
                            <div key={index} className="bg-muted/50 p-3 rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{med.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {med.dosage} - {med.frequency}
                                  </p>
                                  {med.duration && (
                                    <p className="text-sm text-muted-foreground">
                                      Duration: {med.duration}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {med.instructions && (
                                <p className="text-sm mt-2 text-muted-foreground">
                                  {med.instructions}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {prescription.instructions && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">Instructions</h4>
                          <p className="text-sm">{prescription.instructions}</p>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
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

export default Prescriptions;