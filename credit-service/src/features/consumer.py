"""Background SQS consumer: appends every TRANSACTION_COMPLETED event to
transaction_event (raw log, idempotent on tx_id+user_id) so feature_store can
compute windowed aggregates on demand. Training is fully decoupled from this
— it only reads from MLflow/S3 — matching the perfil's RNF that retraining
must never affect inference availability.
"""
import json
import threading

import boto3

from .. import config
from ..db import repository

_sqs = boto3.client("sqs", region_name=config.AWS_REGION)


def _handle_event(body: dict) -> None:
    if body.get("type") != "TRANSACTION_COMPLETED":
        return
    tx_id = body["txId"]
    sender_id = body["senderId"]
    receiver_id = body["receiverId"]
    amount = float(body["amount"])
    currency = body["currency"]
    transaction_type = body.get("transactionType", "P2P_TRANSFER")

    repository.insert_transaction_event(tx_id, sender_id, receiver_id, amount, currency, "OUT", transaction_type)
    repository.insert_transaction_event(tx_id, receiver_id, sender_id, amount, currency, "IN", transaction_type)


def _poll_loop(stop_event: threading.Event) -> None:
    if not config.SQS_QUEUE_URL:
        print("[SQS] SQS_QUEUE_URL not set — feature consumer disabled")
        return
    print(f"[SQS] Polling {config.SQS_QUEUE_URL} for TRANSACTION_COMPLETED events...")
    while not stop_event.is_set():
        response = _sqs.receive_message(
            QueueUrl=config.SQS_QUEUE_URL,
            MaxNumberOfMessages=10,
            WaitTimeSeconds=20,
        )
        for message in response.get("Messages", []):
            try:
                _handle_event(json.loads(message["Body"]))
                _sqs.delete_message(QueueUrl=config.SQS_QUEUE_URL, ReceiptHandle=message["ReceiptHandle"])
            except Exception as exc:  # noqa: BLE001 — keep polling regardless of a single bad message
                print(f"[SQS] Failed to process message: {exc}")


def start_consumer_thread() -> threading.Event:
    stop_event = threading.Event()
    thread = threading.Thread(target=_poll_loop, args=(stop_event,), daemon=True)
    thread.start()
    return stop_event
