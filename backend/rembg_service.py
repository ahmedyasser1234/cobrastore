# pip install rembg pillow fastapi uvicorn
# To run: uvicorn rembg_service:app --host 0.0.0.0 --port 5001
from rembg import remove
from fastapi import FastAPI
from pydantic import BaseModel
import base64, io
from PIL import Image

app = FastAPI()

class ImgRequest(BaseModel):
    image_base64: str

@app.post("/remove-bg")
def remove_bg(req: ImgRequest):
    raw = base64.b64decode(req.image_base64)
    output = remove(raw)
    img = Image.open(io.BytesIO(output)).convert("RGBA")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return {"result_base64": base64.b64encode(buf.getvalue()).decode()}
