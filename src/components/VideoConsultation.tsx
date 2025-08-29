import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Monitor,
  MessageCircle,
  FileText
} from 'lucide-react';

interface VideoConsultationProps {
  appointmentId: string;
}

const VideoConsultation = ({ appointmentId }: VideoConsultationProps) => {
  const { user, profile } = useAuth();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [appointment, setAppointment] = useState<any>(null);
  const [callStarted, setCallStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    fetchAppointment();
    initializeMedia();
    setupRealtimeSubscription();
    updateAppointmentStatus();

    return () => {
      cleanup();
    };
  }, [appointmentId]);

  const updateAppointmentStatus = async () => {
    try {
      await supabase
        .from('appointments')
        .update({ 
          status: 'in_progress',
          actual_start_time: new Date().toISOString()
        })
        .eq('id', appointmentId);
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const fetchAppointment = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(first_name, last_name),
          doctor:profiles!appointments_doctor_id_fkey(first_name, last_name, specialization)
        `)
        .eq('id', appointmentId)
        .single();

      if (error) throw error;
      setAppointment(data);
    } catch (error: any) {
      console.error('Error fetching appointment:', error);
      toast({
        title: "Error",
        description: "Failed to load appointment details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        title: "Media Access Error",
        description: "Please allow camera and microphone access",
        variant: "destructive"
      });
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase.channel(`consultation_${appointmentId}`)
      .on('presence', { event: 'sync' }, () => {
        console.log('Presence synced');
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
        if (newPresences.length > 0 && !callStarted) {
          handleUserJoined();
        }
      })
      .on('broadcast', { event: 'offer' }, ({ payload }) => {
        handleOffer(payload);
      })
      .on('broadcast', { event: 'answer' }, ({ payload }) => {
        handleAnswer(payload);
      })
      .on('broadcast', { event: 'ice-candidate' }, ({ payload }) => {
        handleIceCandidate(payload);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user?.id, role: profile?.role });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(configuration);
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        supabase.channel(`consultation_${appointmentId}`)
          .send({
            type: 'broadcast',
            event: 'ice-candidate',
            payload: { candidate: event.candidate }
          });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setIsConnected(true);
    };

    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    setPeerConnection(pc);
    return pc;
  };

  const handleUserJoined = async () => {
    if (profile?.role === 'doctor' && !callStarted) {
      // Doctor initiates the call
      const pc = createPeerConnection();
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      supabase.channel(`consultation_${appointmentId}`)
        .send({
          type: 'broadcast',
          event: 'offer',
          payload: { offer }
        });
      
      setCallStarted(true);
    }
  };

  const handleOffer = async (payload: any) => {
    if (profile?.role === 'patient') {
      const pc = createPeerConnection();
      await pc.setRemoteDescription(payload.offer);
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      supabase.channel(`consultation_${appointmentId}`)
        .send({
          type: 'broadcast',
          event: 'answer',
          payload: { answer }
        });
    }
  };

  const handleAnswer = async (payload: any) => {
    if (peerConnection) {
      await peerConnection.setRemoteDescription(payload.answer);
    }
  };

  const handleIceCandidate = async (payload: any) => {
    if (peerConnection) {
      await peerConnection.addIceCandidate(payload.candidate);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const endCall = async () => {
    try {
      // Update appointment status
      await supabase
        .from('appointments')
        .update({ 
          status: 'completed',
          actual_end_time: new Date().toISOString()
        })
        .eq('id', appointmentId);

      cleanup();
      navigate('/dashboard');
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection) {
      peerConnection.close();
    }
    setLocalStream(null);
    setRemoteStream(null);
    setPeerConnection(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading consultation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">
              {profile?.role === 'doctor' 
                ? `Consultation with ${appointment?.patient?.first_name} ${appointment?.patient?.last_name}`
                : `Consultation with Dr. ${appointment?.doctor?.first_name} ${appointment?.doctor?.last_name}`
              }
            </h1>
            <p className="text-sm text-gray-300">
              {appointment?.chief_complaint}
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative">
        {/* Remote Video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover bg-gray-800"
        />
        
        {/* Local Video - Picture in Picture */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <VideoOff className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* No Remote Video Placeholder */}
        {!remoteStream && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            <div className="text-center text-white">
              <Video className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-semibold">Waiting for other participant...</p>
              <p className="text-gray-400">Make sure both parties have joined the consultation</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4">
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant={isAudioEnabled ? "secondary" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full w-12 h-12"
          >
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          
          <Button
            variant={isVideoEnabled ? "secondary" : "destructive"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full w-12 h-12"
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="destructive"
            size="lg"
            onClick={endCall}
            className="rounded-full w-12 h-12"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
          
          <Button
            variant="secondary"
            size="lg"
            className="rounded-full w-12 h-12"
          >
            <Monitor className="h-5 w-5" />
          </Button>
          
          <Button
            variant="secondary"
            size="lg"
            className="rounded-full w-12 h-12"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          
          {profile?.role === 'doctor' && (
            <Button
              variant="secondary"
              size="lg"
              className="rounded-full w-12 h-12"
            >
              <FileText className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoConsultation;