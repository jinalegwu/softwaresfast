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


app = FastAPI(title="Softwaresfast Face ID Enrollment API")


@dataclass
class EnrollmentResponse:
    status: str
    message: str
    recommended_stack: dict[str, str]


def _validate_snapshot(content_type: str | None) -> None:
    if not content_type or not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload a single image snapshot for enrollment.")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/face-id/enroll")
async def enroll_face(snapshot: UploadFile = File(...)) -> dict[str, Any]:
    _validate_snapshot(snapshot.content_type)

    await snapshot.read()

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
