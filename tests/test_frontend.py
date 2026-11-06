import sys
import pathlib
import os
import threading
import time
import unittest.mock as mock

# Add repo root to sys.path
repo_root = str(pathlib.Path(__file__).resolve().parent.parent)
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

# Mock backend external dependencies
sys.modules["supabase"] = mock.MagicMock()
sys.modules["groq"] = mock.MagicMock()
sys.modules["gspread"] = mock.MagicMock()
sys.modules["google.oauth2.service_account"] = mock.MagicMock()

os.environ["GROQ_API_KEY"] = "mock_groq_key"
os.environ["SUPABASE_URL"] = "https://mock.supabase.co"
os.environ["SUPABASE_KEY"] = "mock_supabase_key"
os.environ["TELEGRAM_BOT_TOKEN"] = "mock_telegram_token"

import pytest
import uvicorn
from starlette.staticfiles import StaticFiles
from playwright.sync_api import sync_playwright
import api.index as api_module

PORT = 8878
BASE_URL = f"http://127.0.0.1:{PORT}"

@pytest.fixture(scope="session")
def server():
    # Setup mock Groq responses
    mock_groq = mock.AsyncMock()
    mock_choice = mock.MagicMock()
    mock_choice.message.content = "Halo dari mock backend!"
    mock_response = mock.MagicMock()
    mock_response.choices = [mock_choice]
    mock_groq.chat.completions.create = mock.AsyncMock(return_value=mock_response)
    api_module.groq_client = mock_groq

    # Setup mock Supabase
    mock_sb = mock.MagicMock()
    mock_table = mock.MagicMock()
    mock_table.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value.data = []
    mock_table.insert.return_value.execute.return_value = None
    mock_sb.table.return_value = mock_table
    api_module.supabase = mock_sb

    # Mount static assets mirroring Vercel's routing
    assets_dir = os.path.join(repo_root, "frontend", "assets")
    if os.path.exists(assets_dir):
        api_module.app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    config = uvicorn.Config(api_module.app, host="127.0.0.1", port=PORT, log_level="error")
    srv = uvicorn.Server(config)
    thread = threading.Thread(target=srv.run, daemon=True)
    thread.start()
    time.sleep(1) # wait for startup
    yield BASE_URL
    srv.should_exit = True
    thread.join(timeout=2)

@pytest.fixture(scope="session")
def browser_instance():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        yield browser
        browser.close()

def test_viewports_and_overflow(server, browser_instance):
    viewports = [
        {"name": "desktop_1280", "width": 1280, "height": 800},
        {"name": "tablet_768", "width": 768, "height": 1024},
        {"name": "mobile_375", "width": 375, "height": 667},
        {"name": "mobile_360", "width": 360, "height": 640},
        {"name": "mobile_short_height", "width": 375, "height": 450},
        {"name": "mobile_360_short_height", "width": 360, "height": 420},
    ]

    for vp in viewports:
        context = browser_instance.new_context(viewport={"width": vp["width"], "height": vp["height"]})
        page = context.new_page()
        page.goto(server)
        page.wait_for_load_state("networkidle")

        # Check horizontal overflow
        scroll_width = page.evaluate("() => document.documentElement.scrollWidth")
        client_width = page.evaluate("() => document.documentElement.clientWidth")
        inner_width = page.evaluate("() => window.innerWidth")

        assert scroll_width <= client_width + 1, (
            f"Horizontal overflow detected at {vp['name']} ({vp['width']}x{vp['height']}): "
            f"scrollWidth={scroll_width}, clientWidth={client_width}, innerWidth={inner_width}"
        )

        context.close()

def test_fixed_fab_visibility(server, browser_instance):
    # Desktop 1280: FAB must be visible and fixed
    context_desktop = browser_instance.new_context(viewport={"width": 1280, "height": 800})
    page_desktop = context_desktop.new_page()
    page_desktop.goto(server)
    fab = page_desktop.locator("#chat-fab")
    assert fab.is_visible(), "FAB should be visible at 1280px"
    pos = fab.evaluate("el => window.getComputedStyle(el).position")
    assert pos == "fixed", "FAB position should be fixed"
    context_desktop.close()

    # Tablet 768: FAB must be hidden by @media (max-width: 900px)
    context_tablet = browser_instance.new_context(viewport={"width": 768, "height": 1024})
    page_tablet = context_tablet.new_page()
    page_tablet.goto(server)
    assert not page_tablet.locator("#chat-fab").is_visible(), "FAB should be hidden at 768px"
    context_tablet.close()

    # Mobile 375: FAB must be hidden by @media (max-width: 900px)
    context_mobile = browser_instance.new_context(viewport={"width": 375, "height": 667})
    page_mobile = context_mobile.new_page()
    page_mobile.goto(server)
    assert not page_mobile.locator("#chat-fab").is_visible(), "FAB should be hidden at 375px"
    context_mobile.close()

    # Mobile 360: FAB must be hidden
    context_360 = browser_instance.new_context(viewport={"width": 360, "height": 640})
    page_360 = context_360.new_page()
    page_360.goto(server)
    assert not page_360.locator("#chat-fab").is_visible(), "FAB should be hidden at 360px"
    context_360.close()

def test_cta_focus_behavior(server, browser_instance):
    context = browser_instance.new_context(viewport={"width": 1280, "height": 800})
    page = context.new_page()
    page.goto(server)

    # Click CTA button in hero section
    hero_cta = page.locator(".hero [data-open-chat]")
    hero_cta.click()

    # Verify chat panel opens
    chat_panel = page.locator("#chat-panel")
    assert chat_panel.is_visible(), "Chat panel should be visible after CTA click"

    # Verify message-input is focused
    focused_id = page.evaluate("() => document.activeElement ? document.activeElement.id : null")
    assert focused_id == "message-input", f"Chat input should receive focus after opening, got {focused_id}"

    # Close chat panel
    close_btn = page.locator("#close-chat")
    close_btn.click()

    assert not chat_panel.is_visible(), "Chat panel should be hidden after close"

    # Verify focus returned to hero CTA
    is_hero_cta_focused = hero_cta.evaluate("el => document.activeElement === el")
    assert is_hero_cta_focused, "Focus should return to CTA opener button"

    context.close()

def test_no_autoplay(server, browser_instance):
    context = browser_instance.new_context(viewport={"width": 1280, "height": 800})
    page = context.new_page()
    page.goto(server)

    # Verify no autoplay audio/video
    autoplay_media = page.locator("video[autoplay], audio[autoplay]").count()
    assert autoplay_media == 0, "No audio/video elements should have autoplay"

    context.close()

def test_site_navigation_links(server, browser_instance):
    context = browser_instance.new_context(viewport={"width": 1280, "height": 800})
    page = context.new_page()
    page.goto(server)

    # Verify main sections exist
    for sec_id in ["profil", "proyek", "pengalaman", "organisasi", "pendidikan", "keahlian", "kontak"]:
        assert page.locator(f"#{sec_id}").count() >= 1, f"Section #{sec_id} should exist in DOM"

    # Verify 3D Room link exists in nav
    room_link = page.locator(".site-nav a[href*='open-world.html']")
    assert room_link.count() >= 1, "Nav must contain link to 3D room (open-world.html)"

    context.close()

def test_project_filter_interaction(server, browser_instance):
    context = browser_instance.new_context(viewport={"width": 1280, "height": 800})
    page = context.new_page()
    page.goto(server)

    # Projects section should contain project cards
    cards = page.locator("#project-list .project")
    total_cards = cards.count()
    assert total_cards >= 8, f"Expected at least 8 projects, found {total_cards}"

    context.close()

def test_pdf_modal_reader(server, browser_instance):
    context = browser_instance.new_context(viewport={"width": 1280, "height": 800})
    page = context.new_page()
    page.goto(server)

    # Check pdf modal is initially hidden
    pdf_modal = page.locator("#pdf-modal")
    if pdf_modal.count() > 0:
        assert not pdf_modal.is_visible(), "PDF modal should initially be hidden"

    context.close()

def test_prefers_reduced_motion(server, browser_instance):
    context = browser_instance.new_context(
        viewport={"width": 1280, "height": 800},
        reduced_motion="reduce"
    )
    page = context.new_page()
    page.goto(server)

    # HTML scroll behavior should be auto
    scroll_behavior = page.evaluate("() => window.getComputedStyle(document.documentElement).scrollBehavior")
    assert scroll_behavior == "auto", "Scroll behavior should be auto under reduced motion"

    context.close()

def test_js_disabled(server, browser_instance):
    context = browser_instance.new_context(
        viewport={"width": 1280, "height": 800},
        java_script_enabled=False
    )
    page = context.new_page()
    page.goto(server)

    # Check key content visibility
    hero_name = page.locator(".hero-name")
    assert hero_name.is_visible(), "Hero name must be visible with JS disabled"
    assert "Rizky Alviando" in hero_name.inner_text()

    # Project section visible
    projects = page.locator("#proyek")
    assert projects.is_visible(), "Projects section must be visible with JS disabled"

    # Education section visible
    pendidikan = page.locator("#pendidikan")
    assert pendidikan.is_visible(), "Pendidikan section must be visible with JS disabled"

    context.close()

def test_console_cleanliness(server, browser_instance):
    context = browser_instance.new_context(viewport={"width": 1280, "height": 800})
    page = context.new_page()

    console_errors = []
    page_errors = []
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
    page.on("pageerror", lambda err: page_errors.append(err.message))

    page.goto(server)
    page.wait_for_load_state("networkidle")

    # Check no severe errors
    assert len(page_errors) == 0, f"Uncaught page errors found: {page_errors}"
    assert len(console_errors) == 0, f"Console error logs found: {console_errors}"

    context.close()
