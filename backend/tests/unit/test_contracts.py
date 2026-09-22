import unittest
from datetime import datetime
from uuid import uuid4

from pydantic import ValidationError

from ccvie.contracts.insight import InsightResponse


def sample() -> dict:
    return {
        "id": uuid4(),
        "title": "Seal",
        "summary": "Bags open",
        "clusterSize": 2,
        "confidence": 0.7,
        "affectedProduct": "Harbor Crisp",
        "detectedAt": datetime(2026, 9, 16, 15, 0),
        "verbatimIds": [uuid4(), uuid4()],
    }


class InsightResponseTests(unittest.TestCase):
    def test_accepts_the_ui_shape(self) -> None:
        self.assertEqual(InsightResponse(**sample()).clusterSize, 2)

    def test_rejects_confidence_above_one(self) -> None:
        payload = sample()
        payload["confidence"] = 1.1
        with self.assertRaises(ValidationError):
            InsightResponse(**payload)

    def test_rejects_empty_cluster(self) -> None:
        payload = sample()
        payload["clusterSize"] = 0
        with self.assertRaises(ValidationError):
            InsightResponse(**payload)


if __name__ == "__main__":
    unittest.main()
