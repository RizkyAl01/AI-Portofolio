import sys
import pathlib
import unittest.mock as mock

# Ensure current working directory / repo root is on sys.path
repo_root = str(pathlib.Path(__file__).resolve().parent.parent)
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

# Mock external modules before importing api.index
sys.modules["supabase"] = mock.MagicMock()
sys.modules["groq"] = mock.MagicMock()
sys.modules["gspread"] = mock.MagicMock()
sys.modules["google.oauth2.service_account"] = mock.MagicMock()

import os
os.environ["GROQ_API_KEY"] = "mock_groq_key"
os.environ["SUPABASE_URL"] = "https://mock.supabase.co"
os.environ["SUPABASE_KEY"] = "mock_supabase_key"
os.environ["TELEGRAM_BOT_TOKEN"] = "mock_telegram_token"

import pytest
from fastapi.testclient import TestClient
import api.index as api_module

@pytest.fixture
def client():
    mock_groq = mock.AsyncMock()
    mock_choice = mock.MagicMock()
    mock_choice.message.content = "Halo, saya asisten Rizky Alviando."
    mock_response = mock.MagicMock()
    mock_response.choices = [mock_choice]
    mock_groq.chat.completions.create = mock.AsyncMock(return_value=mock_response)
    api_module.groq_client = mock_groq

    mock_sb = mock.MagicMock()
    mock_table = mock.MagicMock()
    mock_table.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value.data = []
    mock_table.insert.return_value.execute.return_value = None
    mock_sb.table.return_value = mock_table
    api_module.supabase = mock_sb

    return TestClient(api_module.app)

def test_read_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert "Rizky Alviando" in response.text
    assert "<!DOCTYPE html>" in response.text or "<html" in response.text

def test_web_chat_success(client):
    payload = {
        "chat_id": "test-session-123",
        "username": "tester",
        "text": "Siapa itu Rizky?"
    }
    response = client.post("/api/web-chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "Halo, saya asisten Rizky Alviando." in data["reply"]

def test_web_chat_validation_empty_fields(client):
    payload = {
        "chat_id": "   ",
        "username": "tester",
        "text": "Halo"
    }
    response = client.post("/api/web-chat", json=payload)
    assert response.status_code == 422

def test_telegram_webhook_mock(client):
    payload = {
        "update_id": 10001,
        "message": {
            "message_id": 1,
            "chat": {"id": 12345},
            "from": {"first_name": "Tester"},
            "text": "Halo bot"
        }
    }
    with mock.patch("httpx.AsyncClient.post", new_callable=mock.AsyncMock) as mock_post:
        mock_post.return_value.status_code = 200
        response = client.post("/api/webhook", json=payload)
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}
