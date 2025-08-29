import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, ArrowLeft, Stethoscope } from 'lucide-react';
import { format } from 'date-fns';

const BookAppointment = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30'
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      console.log('Fetching doctors...');
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, specialization, consultation_fee')
        .eq('role', 'doctor')
        .eq('is_active', true);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Fetched doctors:', data);
      setDoctors(data || []);
    } catch (error: any) {
      console.error('Error fetching doctors:', error);
      toast({
        title: "Error",
        description: "Failed to load doctors",
        variant: "destructive"
      });
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !chiefComplaint.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const scheduledAt = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const doctor = doctors.find((d: any) => d.user_id === selectedDoctor);
      
      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_id: user?.id,
          doctor_id: selectedDoctor,
          scheduled_at: scheduledAt.toISOString(),
          chief_complaint: chiefComplaint,
          consultation_fee: doctor?.consultation_fee || 500,
          status: 'scheduled'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment booked successfully!",
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Error",
        description: "Failed to book appointment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-xl font-bold text-foreground">Book Appointment</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Schedule Your Consultation</CardTitle>
            <CardDescription>
              Choose a doctor and preferred time for your appointment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="doctor">Select Doctor ({doctors.length} available)</Label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Choose a doctor" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  {doctors.length === 0 ? (
                    <div className="p-2 text-muted-foreground text-sm">
                      Loading doctors...
                    </div>
                  ) : (
                    doctors.map((doctor: any) => (
                      <SelectItem 
                        key={doctor.user_id} 
                        value={doctor.user_id}
                        className="cursor-pointer hover:bg-accent"
                      >
                        Dr. {doctor.first_name} {doctor.last_name} - {doctor.specialization}
                        {doctor.consultation_fee && ` (₹${doctor.consultation_fee})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date.getDay() === 0}
                className="rounded-md border"
              />
            </div>

            <div className="space-y-2">
              <Label>Select Time</Label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    type="button"
                    variant={selectedTime === time ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complaint">Chief Complaint *</Label>
              <Textarea
                id="complaint"
                placeholder="Describe your primary health concern..."
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                rows={4}
              />
            </div>

            <Button 
              onClick={handleBookAppointment} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Booking..." : "Book Appointment"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookAppointment;