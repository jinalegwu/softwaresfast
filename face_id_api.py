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

try:
    from fastapi import FastAPI, File, HTTPException, UploadFile
except ImportError:  # pragma: no cover - allows lightweight local validation without backend deps
    class HTTPException(Exception):
        def __init__(self, status_code: int, detail: Any) -> None:
            super().__init__(detail)
            self.status_code = status_code
            self.detail = detail

    class UploadFile:  # pragma: no cover - fallback type for local tests
        content_type: str | None = None

        async def read(self) -> bytes:
            return b""

        async def close(self) -> None:
            return None

    class FastAPI:  # pragma: no cover - fallback for local imports/tests
        def __init__(self, *args: Any, **kwargs: Any) -> None:
            pass

        def get(self, *args: Any, **kwargs: Any):
            def decorator(func):
                return func

            return decorator

        def post(self, *args: Any, **kwargs: Any):
            def decorator(func):
                return func

            return decorator

    def File(*args: Any, **kwargs: Any) -> None:  # pragma: no cover - fallback marker
        return None

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
    snapshot_validated: bool


def _validate_snapshot(content_type: str | None) -> None:
    if not content_type or not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload a single image snapshot for enrollment.")


def _decode_snapshot(image_bytes: bytes) -> Any:
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
    return frame


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/face-id/validate-snapshot")
async def validate_face_snapshot(snapshot: UploadFile = File(...)) -> dict[str, Any]:
    _validate_snapshot(snapshot.content_type)
    image_bytes = await snapshot.read()
    frame = _decode_snapshot(image_bytes)

    response = EnrollmentResponse(
        status="validated",
        message=(
            "Snapshot validation succeeded. Connect this starter endpoint to face_recognition or insightface "
            "to generate the final enrollment template and persist it for attendance/access workflows."
        ),
        snapshot_validated=frame is not None,
    )
    return asdict(response)
