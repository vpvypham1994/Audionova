import { useState } from 'react'
import { ChevronRight,Play,Download,Mic,Speech    } from "lucide-react"

import './App.css'
import { Textarea } from "@/components/ui/textarea"
import { Button } from './components/ui/button'
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { Voice } from './components/ui/voice'
import { Changer } from './components/ui/changer'
import { Translate } from './components/ui/translate'
function App() {
  const [count, setCount] = useState(0)

  return (
<Tabs defaultValue="account" className='w-3/4  place-self-center'   >
  <TabsList className='w-full gap-2'>
    <TabsTrigger className='w-1/2' value="voice">Voice Generation</TabsTrigger>
    <TabsTrigger className='w-1/2' value="changer">Voice Changer</TabsTrigger>

  </TabsList>
  <TabsContent value="voice">
    <Voice></Voice>
    </TabsContent>
    <TabsContent value="changer">
    <Changer></Changer>
    </TabsContent>
    </Tabs>
   
 )
}

export default App
