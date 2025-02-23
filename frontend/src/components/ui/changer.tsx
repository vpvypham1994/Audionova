import { useState, useRef } from 'react'
import { CircleChevronRight, Play, Download, Mic, Loader2 } from "lucide-react"
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useReactMediaRecorder } from 'react-media-recorder';

function Changer() {
  const [uploadStatus, setUploadStatus] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast()

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
  } = useReactMediaRecorder({ audio: true, video: false });    
  
  const handleStartRecording = () => {
    setIsRecording(true);
    startRecording();
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    stopRecording();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setAudioFile(event.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      toast({
        description: "Send Request",
      })
      const formData = new FormData();

      // Use recorded audio if available, otherwise use uploaded file
      if (mediaBlobUrl) {
        const response = await fetch(mediaBlobUrl);
        const blob = await response.blob();
        formData.append('file', blob, 'recording.wav');
      } else if (audioFile) {
        formData.append('file', audioFile);
      } else {
        toast({
          variant: "destructive",
          description: "Please provide an audio file or recording.",
        })
        setIsGenerating(false);
        return;
      }
      
      formData.append('name', selectedVoice || 'barbara');

      const response = await fetch('http://localhost:8000/change-voice/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      setGeneratedAudio(audioUrl);
        toast({
          variant: "success",
          description: "Generation successful!",
        })
      
    } catch (error) {
      console.error('Error generating audio:', error);
      toast({
        variant: "destructive",
        description: "Error generating audio.",
      })
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlay = () => {
    if (generatedAudio && audioRef.current) {
      audioRef.current.play();
    }
  };

  const handleDownload = () => {
    if (generatedAudio) {
      const link = document.createElement('a');
      link.href = generatedAudio;
      link.download = 'generated-audio.wav';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="w-full place-self-center">
      <CardHeader>
        <CardTitle>Voice Changer</CardTitle>
        <CardDescription>Upload an audio file or start a recording.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <Label htmlFor="voice">Default Voice</Label>
          <div className="flex flex-col space-y-1.5">
            <Select onValueChange={setSelectedVoice}>
              <SelectTrigger id="voice">
                <SelectValue placeholder="Select Voice" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="alan">Alan</SelectItem>
                <SelectItem value="bronya">Babara</SelectItem>
                <SelectItem value="babara">Bronya</SelectItem>
                <SelectItem value="dingzhen">Dingzhen</SelectItem>
                <SelectItem value="cafe">Babara</SelectItem>
                <SelectItem value="rosalia">Rosalia</SelectItem>

              </SelectContent>
            </Select>
          </div>
          <Label htmlFor="audio-input">Input Voice File</Label>
          <div className="flex gap-3">
            <Input 
              className='w-2/4' 
              id="audio-input" 
              type="file" 
              accept="audio/*"
              onChange={handleFileChange}
            />
            {!isRecording ? (
              <Button onClick={handleStartRecording} className="w-2/4">
                <Mic className="mr-2" /> Start Recording
              </Button>
            ) : (
              <Button variant="destructive" onClick={handleStopRecording} className="w-2/4">
                <Mic className="mr-2" /> Stop Recording
              </Button>
            )}
          </div>
          {uploadStatus && (
            <div className="text-sm text-gray-500">{uploadStatus}</div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-3">
        <Button 
          className="w-1/3" 
          onClick={handleGenerate} 
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating
              
            </>
          ) : (
            <>
              <CircleChevronRight className="mr-2"  />
              Generate
            </>
          )}
        </Button>
        <Button 
          className="w-1/3" 
          onClick={handleDownload}
          disabled={!generatedAudio}
        >
          <Download className="mr-2" />Download
        </Button>
        <Button 
          className="w-1/3" 
          onClick={handlePlay}
          disabled={!generatedAudio}
        >
          <Play className="mr-2" />Play
        </Button>
      </CardFooter>
      <audio ref={audioRef} src={generatedAudio || ''} />
    </Card>
  )
}

export { Changer }
