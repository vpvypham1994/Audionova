from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel
import tempfile
import uuid

import sys
import os
from pathlib import Path

from qai_hub_models.models.whisper_base_en.model import WhisperBaseEn
from qai_hub_models.models._shared.whisper.app import WhisperApp
from qai_hub_models.models._shared.whisper.app import WhisperApp
from qai_hub_models.models._shared.whisper.model import (
    MODEL_ASSET_VERSION,
    MODEL_ID,
    SAMPLE_RATE,
    Whisper,
)
import whisper

current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.append(project_root)
# Get the absolute path to the project root
project_root = os.path.dirname(os.path.abspath(__file__))

# Path to VALL-E-X directory
valle_x_path = os.path.join(project_root, "vall")

# Add to system path

sys.path.append(valle_x_path)

from vall.utils.generation import SAMPLE_RATE, generate_audio, preload_models
from vall.utils.prompt_making import make_prompt

from scipy.io.wavfile import write as write_wav
from scipy.io import wavfile
import shutil

app = FastAPI(title="Endpoint")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class TranscribeGenerator:
    def __init__(self):
        self.app = WhisperApp(Whisper.from_source_model(whisper.load_model("small.en")))

    def transcribe(self,audio_file):
        print(audio_file)
        audio_sample_rate, audio = wavfile.read(audio_file)
        print("transcribing")
        try:
            transcription = self.app.transcribe(audio, audio_sample_rate)
        except:
            model = whisper.load_model("base.en")
            result = model.transcribe(audio_file)
            print(result["text"])
            transcription = result["text"]

        print(transcription)
        return transcription

class VoiceCloneRequest(BaseModel):
    name: str

class TextToSpeechRequest(BaseModel):
    text: str
    voice: str = "babara"  # Default voice

class AudioGenerator:
    def __init__(self, preload=True):
        self.sample_rate = SAMPLE_RATE
        self.transcriber = TranscribeGenerator()
        if preload:
            self.preload_models()
    
    def preload_models(self):
        preload_models()
    
    def generate(self, text, prompt="babara"):
        return generate_audio(text, prompt=prompt)
    
    def save(self, audio_array, output_path):
        output_path = Path(output_path)
        write_wav(str(output_path), self.sample_rate, audio_array)
    
    def generate_and_save(self, text, output_path, prompt="babara"):
        audio_array = self.generate(text, prompt)
        self.save(audio_array, output_path)

    def cloning_voice(self,name,audio_file):
        print("-----Cloning------")
        transcription = self.transcriber.transcribe(audio_file)
        print(transcription)
        make_prompt(name=name, audio_prompt_path=audio_file,
                transcript=transcription)
    
    def get_transcription(self,name,audio_file):
        transcription = self.transcriber.transcribe(audio_file)
        return transcription


# Initialize the generator at startup
generator = AudioGenerator()

@app.post("/generate-audio/")
async def generate_audio_endpoint(request: TextToSpeechRequest):
    try:
        # Create a temporary file with a unique name
        temp_dir = tempfile.gettempdir()
        temp_file = os.path.join(temp_dir, f"audio_{uuid.uuid4()}.wav")
        
        # Generate and save the audio
        generator.generate_and_save(
            text=request.text,
            output_path=temp_file,
            prompt=request.voice
        )
        
        # Return the audio file
        return FileResponse(
            temp_file,
            media_type="audio/wav",
            filename="generated_audio.wav",
            background=None  # The file will be removed after the response is sent
        )
    
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/clone-voice/")
async def clone_voice_endpoint(
    file: UploadFile = File(...),
    name: str = Form(...)
):
    try:
        # Create a temporary directory for processing
        temp_dir = tempfile.mkdtemp()
        temp_audio_path = os.path.join(temp_dir, f"voice_{uuid.uuid4()}.wav")

        # Save the uploaded file
        with open(temp_audio_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Process the voice cloning
        try:
            generator.cloning_voice(name, temp_audio_path)
            return JSONResponse(
                content={
                    "message": f"Voice successfully cloned with name: {name}",
                    "status": "success"
                },
                status_code=200
            )
        except Exception as e:
            print(e)
            raise HTTPException(
                status_code=500,
                detail=f"Error during voice cloning: {str(e)}"
            )
        finally:
            # Clean up temporary files
            shutil.rmtree(temp_dir)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing voice clone request: {str(e)}"
        )

@app.post("/change-voice/")
async def change_voice_endpoint(
    file: UploadFile = File(...),
    name: str = Form(...)
):
    try:
        # Create a temporary directory for processing
        temp_dir = tempfile.mkdtemp()
        input_file = os.path.join(temp_dir, f"input_{uuid.uuid4()}.wav")
        output_file = os.path.join(temp_dir, f"output_{uuid.uuid4()}.wav")
        
        # Save the uploaded file
        with open(input_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Process the voice cloning
        try:
           
            
            transcription = generator.get_transcription(name, input_file)
            # Generate and save the audio
            generator.generate_and_save(
                text=transcription,
                output_path=output_file,
                prompt=name
            )
            print('done')
             # Return the audio file
            # Create a copy of the file in the system temp directory
            final_output = os.path.join(tempfile.gettempdir(), f"final_output_{uuid.uuid4()}.wav")
            shutil.copy2(output_file, final_output)

            return FileResponse(
                final_output,
                media_type="audio/wav",
                filename="generated_audio_change.wav",
                background=None  # The file will be removed after the response is sent
            )
    
        except Exception as e:
            print(e)
            raise HTTPException(
                status_code=500,
                detail=f"Error during voice change: {str(e)}"
            )
        finally:
            # Clean up temporary files
            shutil.rmtree(temp_dir)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing voice chain request: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)