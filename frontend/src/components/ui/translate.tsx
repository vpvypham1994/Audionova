import { useState } from "react"
import { CircleChevronRight, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"

function Translate() {
  const { toast } = useToast()
  const [audioFile, setAudioFile] = useState(null)
  const [translatedText, setTranslatedText] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setAudioFile(file)
    }
  }

  const handleTranslate = async () => {
    if (!audioFile) {
      toast({
        variant: "destructive",
        description: "Please select an audio file before translating.",
      })
      return
    }

    try {
      setIsTranslating(true)
      toast({ description: "Translating your audio..." })

      // Prepare the form data with the audio file
      const formData = new FormData()
      formData.append("audio", audioFile)

      const response = await fetch("http://localhost:8000/translate", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      // Assuming the server returns something like { translatedText: "..." }
      setTranslatedText(data.translatedText || "")

      toast({
        variant: "success",
        description: "Translation successful!",
      })
    } catch (error) {
      console.error("Error translating audio:", error)
      toast({
        variant: "destructive",
        description: "Error translating audio.",
      })
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <Card className="w-full place-self-center">
      <CardHeader>
        <CardTitle>Translate</CardTitle>
        <CardDescription>Upload an audio file to translate to English.</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid w-full items-center gap-4">
          <Label htmlFor="audio-file">Audio File</Label>
          <Input
            id="audio-file"
            type="file"
            accept=".wav"
            onChange={handleFileChange}
          />

          <Label htmlFor="output-text">Translation</Label>
          <Textarea
            id="output-text"
            placeholder="Translated text will appear here."
            value={translatedText}
            readOnly
          />
        </div>
      </CardContent>

      <CardFooter className="flex justify-between gap-3">
        <Button
          className="w-full"
          onClick={handleTranslate}
          disabled={isTranslating}
        >
          {isTranslating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Translating
            </>
          ) : (
            <>
              <CircleChevronRight className="mr-2" />
              Translate
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

export { Translate }
