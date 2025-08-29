import { useParams } from 'react-router-dom';
import VideoConsultationComponent from '@/components/VideoConsultation';

const VideoConsultationPage = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();

  if (!appointmentId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Invalid Consultation</h1>
          <p className="text-muted-foreground">No appointment ID provided</p>
        </div>
      </div>
    );
  }

  return <VideoConsultationComponent appointmentId={appointmentId} />;
};

export default VideoConsultationPage;