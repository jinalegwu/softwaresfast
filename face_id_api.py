"""
Starter backend for the institute Face ID enrollment flow.

Recommended Python stack for production use:
- FastAPI (or Flask) for the enrollment API
- OpenCV (`cv2`) for image decoding and capture utilities
- `face_recognition` or `insightface` for face detection and template creation
"""

from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile

try:
    import cv2
    import numpy as np
except ImportError:  # pragma: no cover - starter dependency guard
    cv2 = None
    np = None


app = FastAPI(title="Softwaresfast Face ID Enrollment API")


@dataclass
class EnrollmentResponse:
    status: str
    message: str
    recommended_stack: dict[str, str]


def _validate_snapshot(content_type: str | None) -> None:
    if not content_type or not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload a single image snapshot for enrollment.")


def _decode_snapshot(image_bytes: bytes) -> None:
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Please upload a non-empty enrollment snapshot.")
    if cv2 is None or np is None:
        raise HTTPException(
            status_code=503,
            detail="Install OpenCV and numpy to validate and process Face ID enrollment snapshots.",
        )

    frame = cv2.imdecode(np.frombuffer(image_bytes, dtype=np.uint8), cv2.IMREAD_COLOR)
    if frame is None:
        raise HTTPException(status_code=400, detail="Upload a clear image file that can be decoded for enrollment.")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/face-id/enroll")
async def enroll_face(snapshot: UploadFile = File(...)) -> dict[str, Any]:
    _validate_snapshot(snapshot.content_type)
    image_bytes = await snapshot.read()
    await snapshot.close()
    _decode_snapshot(image_bytes)

    response = EnrollmentResponse(
        status="starter-ready",
        message=(
            "Snapshot received. Next, process the image with OpenCV and generate a face embedding with "
            "face_recognition or insightface before saving the template for attendance/access."
        ),
        recommended_stack={
            "api": "FastAPI or Flask",
            "image_processing": "OpenCV",
            "face_embedding": "face_recognition or insightface",
        },
    )
    return asdict(response)
