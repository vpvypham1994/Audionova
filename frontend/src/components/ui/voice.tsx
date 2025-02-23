import { useState, useRef } from 'react'
import { CircleChevronRight, Play, Download, Mic, Speech } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
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
import { LoadingButton } from '@/components/ui/loading-button'
import { useToast } from '@/hooks/use-toast'

function Voice() {
  const [text, setText] = useState("")
  const [voice, setVoice] = useState("")
  const [audioUrl, setAudioUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCloning, setIsCloning] = useState(false)
  const [cloneName, setCloneName] = useState("")
  const [voices, setVoices] = useState([
    { id: "alan", name: "Alan" },
    { id: "babara", name: "Babara" },
    { id: "bronya", name: "Bronya" },
    { id: "dingzhen", name: "Dingzhen" },
    { id: "cafe", name: "Cafe" },
    { id: "rosalia", name: "Rosalia" }

  ])
  const audioRef = useRef(null)
  const fileRef = useRef(null)
  const { toast } = useToast()

  const handleCloneVoice = async () => {
    if (!fileRef.current?.files?.[0] || !cloneName) {
      alert("Please select a file and enter a name")
      return
    }

    setIsCloning(true)
    const formData = new FormData()
    formData.append("file", fileRef.current.files[0])
    formData.append("name", cloneName)

    try {
      const response = await fetch("http://localhost:8000/clone-voice/", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      // Add the new voice to the list
      setVoices(prev => [...prev, { id: cloneName, name: cloneName }])
      
      // Reset the form
      setCloneName("")
      fileRef.current.value = ""
      
      //alert("Voice cloned successfully!")
      toast({
        variant: "success",
        description: "Voice cloned successfully!",
      })
    } catch (error) {
      console.error("Error cloning voice:", error)
      //alert("Error cloning voice. Please try again.")
      toast({
        variant: "destructive",
        description: "Error cloning voice. Please try again.",
      })
    } finally {
      setIsCloning(false)
    }
  }

  const generateAudio = async () => {
    if (!text || !voice) {
      //alert("Please enter text and select a voice")
      toast({
        variant: "destructive",
        description: "Please enter text and select a voice.",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:8000/generate-audio/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voice,
        }),
      })

      if (!response.ok) {
        toast({
          variant: "destructive",
          description: "HTTP Error.",
        })
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const audioBlob = await response.blob()
      const url = URL.createObjectURL(audioBlob)
      setAudioUrl(url)
      toast({
        variant: "success",
        description: "Generation successful!",
      })
    } catch (error) {
      console.error("Error generating audio:", error)
      //alert("Error generating audio. Please try again.")
      toast({
        variant: "destructive",
        description: "Error generating audio. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play()
    }
  }

  const downloadAudio = () => {
    if (audioUrl) {
      const a = document.createElement("a")
      a.href = audioUrl
      a.download = "generated_audio.wav"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  return (
    <Card className="w-full place-self-center">
      <CardHeader>
        <CardTitle>Voice Generation</CardTitle>
        <CardDescription>Generate speech in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-2.5">
            <div className="h-3/4">
              <Textarea 
                placeholder="Type your message here." 
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          </div>
          <Label htmlFor="voice-select">Available Voices</Label>
          <div className="flex flex-col space-y-1.5">
            <Select value={voice} onValueChange={setVoice}>
              <SelectTrigger id="voice-select">
                <SelectValue placeholder="Select Voice" />
              </SelectTrigger>
              <SelectContent position="popper">
                {voices.map(voice => (
                  <SelectItem key={voice.id} value={voice.id}>
                    {voice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Label>Clone New Voice</Label>
          <div className="flex gap-3">
            <Input 
              className="w-2/4" 
              type="text" 
              placeholder="Voice Name" 
              value={cloneName}
              onChange={(e) => setCloneName(e.target.value)}
            />
            <Input 
              className="w-1/4" 
              type="file" 
              ref={fileRef}
              accept=".wav"
              onChange={(e) => {
                if (e.target.files?.[0]?.type !== "audio/wav") {
                  alert("Please select a WAV file")
                  e.target.value = ""
                }
              }}
            />
            {!isCloning?(<Button className="w-1/4" onClick={handleCloneVoice} disabled={isCloning}> <Speech className="mr-2" />Clone</Button>):(<LoadingButton loading className="w-1/4">Cloning</LoadingButton>)}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-3">
      {!isLoading?(<Button className="w-1/3" onClick={generateAudio} disabled={isLoading} ><CircleChevronRight className="mr-2" />Generate</Button>):(<LoadingButton loading className="w-1/3">Generating</LoadingButton>)}

        <Button 
          className="w-1/3" 
          onClick={downloadAudio}
          disabled={!audioUrl}
        >
          <Download className="mr-2" />Download
        </Button>
        <Button 
          className="w-1/3" 
          onClick={playAudio}
          disabled={!audioUrl}
        >
          <Play className="mr-2" />Play
        </Button>
      </CardFooter>
      <audio ref={audioRef} src={audioUrl} />
    </Card>
  )
}

export { Voice }
