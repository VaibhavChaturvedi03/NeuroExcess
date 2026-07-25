"""
Image Captioning Service
========================
Strategy (two-tier):

1. **HuggingFace Inference API** (primary) — calls the configured
   BLIP / ViT-GPT2 model and returns its generated caption.

2. **Local heuristic** (fallback) — if the HF API is unavailable
   (e.g. model loading, rate limit, network error) we fall back to a
   fast Pillow-based analysis that describes the image by its dominant
   colour and coarse structure.  This is intentionally lightweight and
   requires *no* additional model download.

The route layer receives a `(caption: str, source: str)` tuple.
"""

import io
import logging
from typing import Tuple

import httpx
from PIL import Image

from src.core.config import settings
from src.services.ai.client import HuggingFaceClient
from src.services.ai.exceptions import HuggingFaceException, ImageProcessingException

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────
# Heuristic helpers
# ──────────────────────────────────────────────────────────────

# Basic colour name lookup (RGB bucket → name)
_COLOUR_BUCKETS: list[Tuple[Tuple[int, int, int], str]] = [
    ((0, 0, 0), "black"),
    ((255, 255, 255), "white"),
    ((128, 128, 128), "grey"),
    ((255, 0, 0), "red"),
    ((0, 128, 0), "green"),
    ((0, 0, 255), "blue"),
    ((255, 255, 0), "yellow"),
    ((255, 165, 0), "orange"),
    ((128, 0, 128), "purple"),
    ((165, 42, 42), "brown"),
    ((0, 128, 128), "teal"),
    ((255, 192, 203), "pink"),
]


def _nearest_colour(r: int, g: int, b: int) -> str:
    """Return the closest colour name for an RGB triplet."""
    best_name = "unknown"
    best_dist = float("inf")
    for (cr, cg, cb), name in _COLOUR_BUCKETS:
        dist = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2
        if dist < best_dist:
            best_dist = dist
            best_name = name
    return best_name


def _heuristic_caption(image_bytes: bytes) -> str:
    """
    Generate a rough description of an image using only Pillow.

    Analyses:
    - Image dimensions and aspect ratio (landscape / portrait / square)
    - Dominant colour (from a 50×50 thumbnail for speed)
    - Colour variance (colourful vs. monochrome)
    - Brightness (dark / medium / bright)

    Returns a human-readable sentence.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    w, h = img.size

    # Aspect ratio
    ratio = w / h
    if ratio > 1.3:
        orientation = "landscape"
    elif ratio < 0.77:
        orientation = "portrait"
    else:
        orientation = "square"

    # Dominant colour from thumbnail
    thumb = img.resize((50, 50), Image.LANCZOS)
    pixels = list(thumb.getdata())
    r_avg = sum(p[0] for p in pixels) // len(pixels)
    g_avg = sum(p[1] for p in pixels) // len(pixels)
    b_avg = sum(p[2] for p in pixels) // len(pixels)
    dominant = _nearest_colour(r_avg, g_avg, b_avg)

    # Brightness
    brightness = (r_avg * 299 + g_avg * 587 + b_avg * 114) // 1000
    if brightness < 64:
        bright_desc = "dark"
    elif brightness < 180:
        bright_desc = "medium-brightness"
    else:
        bright_desc = "bright"

    # Colour variance (colourful vs. greyscale)
    variance = max(abs(r_avg - g_avg), abs(g_avg - b_avg), abs(r_avg - b_avg))
    if variance < 20:
        colour_desc = "monochromatic"
    elif variance < 60:
        colour_desc = "muted"
    else:
        colour_desc = "colourful"

def _heuristic_caption(image_bytes: bytes) -> str:
    """
    Generate a visual accessibility description of an image using Pillow.

    Analyses:
    - Dimensions and orientation (landscape / portrait / square)
    - Image format / aspect ratio
    - Scene lighting / brightness
    - Color complexity

    Returns meaningful accessibility alt-text.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    w, h = img.size

    # Aspect ratio & orientation
    ratio = w / h
    if ratio > 1.3:
        orientation = "landscape orientation"
    elif ratio < 0.77:
        orientation = "portrait orientation"
    else:
        orientation = "square framing"

    # Brightness
    thumb = img.resize((50, 50), Image.LANCZOS)
    pixels = list(thumb.getdata())
    r_avg = sum(p[0] for p in pixels) // len(pixels)
    g_avg = sum(p[1] for p in pixels) // len(pixels)
    b_avg = sum(p[2] for p in pixels) // len(pixels)

    brightness = (r_avg * 299 + g_avg * 587 + b_avg * 114) // 1000
    if brightness < 64:
        lighting = "low-light background"
    elif brightness < 180:
        lighting = "balanced natural lighting"
    else:
        lighting = "high-brightness background"

    # Color complexity
    variance = max(abs(r_avg - g_avg), abs(g_avg - b_avg), abs(r_avg - b_avg))
    if variance < 20:
        visual_style = "grayscale visual graphic"
    elif variance < 60:
        visual_style = "soft-toned image content"
    else:
        visual_style = "full-color visual image"

    return (
        f"Visual graphic: {visual_style} in {orientation} with {lighting} "
        f"({w}×{h} pixels resolution)."
    )


# ──────────────────────────────────────────────────────────────
# Local Transformers Engine (Lazy Loaded)
# ──────────────────────────────────────────────────────────────

_LOCAL_MODEL = None
_LOCAL_FEATURE_EXTRACTOR = None
_LOCAL_TOKENIZER = None
_LOCAL_MODEL_INIT_FAILED = False


def _get_local_model():
    """Lazy load local VisionEncoderDecoderModel for ViT-GPT2 captioning."""
    global _LOCAL_MODEL, _LOCAL_FEATURE_EXTRACTOR, _LOCAL_TOKENIZER, _LOCAL_MODEL_INIT_FAILED
    if _LOCAL_MODEL_INIT_FAILED:
        return None, None, None

    if _LOCAL_MODEL is None:
        try:
            from transformers import VisionEncoderDecoderModel, ViTImageProcessor, AutoTokenizer
            logger.info("Loading local ViT-GPT2 vision-language model into memory...")
            model_name = "nlpconnect/vit-gpt2-image-captioning"
            _LOCAL_MODEL = VisionEncoderDecoderModel.from_pretrained(model_name)
            _LOCAL_FEATURE_EXTRACTOR = ViTImageProcessor.from_pretrained(model_name)
            _LOCAL_TOKENIZER = AutoTokenizer.from_pretrained(model_name)
            logger.info("Local ViT-GPT2 vision model loaded successfully.")
        except Exception as exc:
            logger.warning("Could not load local transformers model: %s", exc)
            _LOCAL_MODEL_INIT_FAILED = True
            return None, None, None

    return _LOCAL_MODEL, _LOCAL_FEATURE_EXTRACTOR, _LOCAL_TOKENIZER


def _generate_local_caption(image_bytes: bytes) -> str | None:
    """Generate image caption locally using PyTorch & HuggingFace Transformers."""
    model, feature_extractor, tokenizer = _get_local_model()
    if model is None or feature_extractor is None or tokenizer is None:
        return None

    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        pixel_values = feature_extractor(images=img, return_tensors="pt").pixel_values
        output_ids = model.generate(pixel_values, max_length=24, num_beams=4)
        caption = tokenizer.decode(output_ids[0], skip_special_tokens=True).strip()
        if caption:
            return caption
    except Exception as exc:
        logger.warning("Local transformers caption generation failed: %s", exc)
    return None


class ImageCaptionService:
    """
    Generates alt-text captions for images describing image content.

    1. Local Engine:  Transformers ViT-GPT2 model (runs in-memory on CPU/GPU).
    2. Primary HF:   HuggingFace BLIP-base Inference API.
    3. Secondary HF: HuggingFace ViT-GPT2 Inference API.
    4. Fallback:     Local structural accessibility analyzer.
    """

    def __init__(self) -> None:
        self.client = HuggingFaceClient(settings.HF_API_KEY)
        self.primary_model = settings.HF_CAPTION_MODEL
        self.fallback_model = settings.HF_CAPTION_FALLBACK_MODEL
        self.timeout = settings.HF_TIMEOUT

    def _get_model_urls(self, model_id: str) -> list[str]:
        return [
            f"https://api-inference.huggingface.co/models/{model_id}",
            f"https://router.huggingface.co/hf-inference/models/{model_id}",
        ]

    async def _try_hf_model(self, model_id: str, image_bytes: bytes) -> str | None:
        """Attempt to fetch caption from a specific HuggingFace model endpoint."""
        urls = self._get_model_urls(model_id)
        for url in urls:
            try:
                response = await self.client.post(
                    url, image_bytes, timeout=self.timeout
                )
                if response.status_code == 200:
                    result = response.json()
                    if isinstance(result, list) and result:
                        caption = result[0].get("generated_text", "").strip()
                        if caption:
                            logger.info("HF model %s caption OK: %r", model_id, caption)
                            return caption
                    elif isinstance(result, dict) and "generated_text" in result:
                        caption = result["generated_text"].strip()
                        if caption:
                            logger.info("HF model %s caption OK: %r", model_id, caption)
                            return caption
                elif response.status_code == 503:
                    logger.warning("HF model %s loading (503).", model_id)
                else:
                    logger.warning(
                        "HF model %s returned status %d", model_id, response.status_code
                    )
            except (httpx.TimeoutException, httpx.RequestError) as exc:
                logger.warning("HF request to %s failed: %s", url, exc)
        return None

    async def generate_caption(
        self,
        image_bytes: bytes,
    ) -> Tuple[str, str]:
        """
        Return ``(caption, source)`` where *source* is one of
        ``"local_model"``, ``"huggingface"``, or ``"heuristic"``.

        Raises:
            ImageProcessingException: if the bytes cannot be decoded at all.
        """
        # Validate bytes are a real image before we do anything
        try:
            Image.open(io.BytesIO(image_bytes)).verify()
        except Exception as exc:
            raise ImageProcessingException(
                f"Cannot decode image bytes: {exc}"
            ) from exc

        # ── 1. Local Transformers Vision Engine ────────────────
        caption = _generate_local_caption(image_bytes)
        if caption:
            logger.info("Local transformers caption OK: %r", caption)
            return caption, "local_model"

        # ── 2. Primary HuggingFace API (BLIP) ───────────────────
        caption = await self._try_hf_model(self.primary_model, image_bytes)
        if caption:
            return caption, "huggingface"

        # ── 3. Secondary HuggingFace API (ViT-GPT2) ────────────
        if self.fallback_model and self.fallback_model != self.primary_model:
            caption = await self._try_hf_model(self.fallback_model, image_bytes)
            if caption:
                return caption, "huggingface"

        # ── 4. Fallback: Structural Accessibility Analyzer ────
        try:
            caption = _heuristic_caption(image_bytes)
            logger.info("Heuristic caption: %r", caption)
            return caption, "heuristic"
        except Exception as exc:
            raise ImageProcessingException(
                f"Both HuggingFace and heuristic captioning failed: {exc}"
            ) from exc


image_caption_service = ImageCaptionService()