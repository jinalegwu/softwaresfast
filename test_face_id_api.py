import asyncio
import unittest

import face_id_api


class FakeUpload:
    def __init__(self, content_type, payload):
        self.content_type = content_type
        self._payload = payload
        self.closed = False

    async def read(self):
        return self._payload

    async def close(self):
        self.closed = True


class FaceIdApiTests(unittest.TestCase):
    def test_invalid_content_type_is_rejected_and_closed(self):
        upload = FakeUpload("text/plain", b"not-an-image")

        with self.assertRaises(face_id_api.HTTPException) as ctx:
            asyncio.run(face_id_api.validate_face_snapshot(upload))

        self.assertEqual(ctx.exception.status_code, 400)
        self.assertTrue(upload.closed)

    def test_empty_upload_is_rejected_and_closed(self):
        upload = FakeUpload("image/jpeg", b"")

        with self.assertRaises(face_id_api.HTTPException) as ctx:
            asyncio.run(face_id_api.validate_face_snapshot(upload))

        self.assertEqual(ctx.exception.status_code, 400)
        self.assertTrue(upload.closed)

    def test_missing_opencv_stack_returns_service_unavailable(self):
        upload = FakeUpload("image/jpeg", b"image-bytes")
        original_cv2, original_np = face_id_api.cv2, face_id_api.np
        face_id_api.cv2, face_id_api.np = None, None

        try:
            with self.assertRaises(face_id_api.HTTPException) as ctx:
                asyncio.run(face_id_api.validate_face_snapshot(upload))
        finally:
            face_id_api.cv2, face_id_api.np = original_cv2, original_np

        self.assertEqual(ctx.exception.status_code, 503)
        self.assertTrue(upload.closed)

    def test_valid_decodable_snapshot_returns_starter_response(self):
        upload = FakeUpload("image/jpeg", b"image-bytes")
        original_cv2, original_np = face_id_api.cv2, face_id_api.np

        class FakeNumpy:
            @staticmethod
            def frombuffer(payload, dtype):
                return payload

            uint8 = "uint8"

        class FakeCv2:
            IMREAD_COLOR = 1

            @staticmethod
            def imdecode(payload, flag):
                return object()

        face_id_api.cv2, face_id_api.np = FakeCv2(), FakeNumpy()

        try:
            result = asyncio.run(face_id_api.validate_face_snapshot(upload))
        finally:
            face_id_api.cv2, face_id_api.np = original_cv2, original_np
        self.assertEqual(result["status"], "validated")
        self.assertTrue(result["snapshot_validated"])
        self.assertTrue(upload.closed)
