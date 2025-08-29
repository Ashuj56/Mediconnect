import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, DollarSign, Calendar, Receipt, Stethoscope } from 'lucide-react';
import { format } from 'date-fns';

const PaymentHistory = () => {
  const { user, profile } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      const query = profile?.role === 'doctor'
        ? supabase.from('payments').select(`
            *,
            patient:profiles!payments_patient_id_fkey(first_name, last_name),
            appointment:appointments(scheduled_at, chief_complaint)
          `).eq('doctor_id', user?.id)
        : supabase.from('payments').select(`
            *,
            doctor:profiles!payments_doctor_id_fkey(first_name, last_name, specialization),
            appointment:appointments(scheduled_at, chief_complaint)
          `).eq('patient_id', user?.id);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Failed to load payment history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      case 'refunded': return 'outline';
      default: return 'outline';
    }
  };

  const getTotalAmount = () => {
    return payments
      .filter((payment: any) => payment.status === 'completed')
      .reduce((total, payment: any) => total + parseFloat(payment.amount), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading payment history...</p>
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
            <h1 className="text-xl font-bold text-foreground">Payment History</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Payment History</h2>
            <p className="text-muted-foreground">
              {profile?.role === 'doctor' 
                ? 'Track payments received from patients' 
                : 'View your consultation payment history'
              }
            </p>
          </div>

          {/* Summary Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">₹{getTotalAmount().toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Total {profile?.role === 'doctor' ? 'Earned' : 'Paid'}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{payments.length}</p>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {payments.filter((p: any) => p.status === 'completed').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Completed Payments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {payments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-2">No payments found</p>
                <p className="text-sm text-muted-foreground">
                  {profile?.role === 'doctor' 
                    ? 'Payments will appear here when patients pay for consultations.' 
                    : 'Your payment history will appear here after making payments for consultations.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {payments.map((payment: any) => (
                <Card key={payment.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {profile?.role === 'doctor' 
                            ? `${payment.patient?.first_name} ${payment.patient?.last_name}`
                            : `Dr. ${payment.doctor?.first_name} ${payment.doctor?.last_name}`
                          }
                        </CardTitle>
                        <CardDescription className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {format(new Date(payment.created_at), 'MMM dd, yyyy')}
                          </span>
                          {payment.appointment?.scheduled_at && (
                            <span>
                              Appointment: {format(new Date(payment.appointment.scheduled_at), 'MMM dd, yyyy')}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          ₹{parseFloat(payment.amount).toFixed(2)}
                        </p>
                        <Badge variant={getStatusBadgeVariant(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {payment.appointment?.chief_complaint && (
                        <div>
                          <p className="text-sm text-muted-foreground">Consultation for:</p>
                          <p className="text-sm">{payment.appointment.chief_complaint}</p>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Payment Method:</span>
                        <span>{payment.payment_method || 'Online'}</span>
                      </div>
                      
                      {payment.provider_payment_id && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Transaction ID:</span>
                          <span className="font-mono text-xs">{payment.provider_payment_id}</span>
                        </div>
                      )}
                      
                      {payment.paid_at && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Paid On:</span>
                          <span>{format(new Date(payment.paid_at), 'MMM dd, yyyy - hh:mm a')}</span>
                        </div>
                      )}
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

export default PaymentHistory;