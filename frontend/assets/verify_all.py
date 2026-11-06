from playwright.sync_api import sync_playwright
import os
import time

repo_root = os.path.abspath("BELAJAR-MANDIRI/web-chatbot")
open_world_path = f"file:///{os.path.join(repo_root, 'frontend', 'open-world.html').replace(os.sep, '/')}"
index_path = f"file:///{os.path.join(repo_root, 'frontend', 'index.html').replace(os.sep, '/')}"

screenshot_dir = os.path.join(repo_root, "frontend", "assets", "screenshots_verify")
os.makedirs(screenshot_dir, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 800})
    
    # 1. Test open-world.html (3D room view & downward arrow hotspots)
    print("Navigating to open-world.html...")
    page.goto(open_world_path)
    page.wait_for_timeout(2000)
    
    # Check hotspots
    pc_hotspot = page.locator("#hotspot-pc")
    book_hotspot = page.locator("#hotspot-book")
    chess_hotspot = page.locator("#hotspot-chess")
    frame_hotspot = page.locator("#hotspot-frame")
    print(f"Hotspots in DOM: pc={pc_hotspot.count()}, book={book_hotspot.count()}, chess={chess_hotspot.count()}, frame={frame_hotspot.count()}")
    
    page.screenshot(path=os.path.join(screenshot_dir, "01_room_with_downward_arrows.png"))
    print("Screenshot 1 taken: 01_room_with_downward_arrows.png")
    
    # 2. Test Desktop Modal & File Explorer (No emoji slop + Coursera certs)
    print("Opening Desktop OS & File Explorer...")
    page.evaluate("openDesktopModal(); openDesktopApp('explorer'); filterExplorer('coursera');")
    page.wait_for_timeout(1000)
    page.screenshot(path=os.path.join(screenshot_dir, "02_explorer_coursera_certs.png"))
    print("Screenshot 2 taken: 02_explorer_coursera_certs.png")
    
    # Check all projects (no emojis)
    page.evaluate("filterExplorer('all');")
    page.wait_for_timeout(500)
    page.screenshot(path=os.path.join(screenshot_dir, "03_explorer_all_projects_clean.png"))
    print("Screenshot 3 taken: 03_explorer_all_projects_clean.png")

    # 3. Test Chess Modal (AI 1800 ELO vs Rizky ~1600 ELO)
    print("Opening Chess Arena Modal...")
    page.evaluate("closeDesktopModal(); openChessModal();")
    page.wait_for_timeout(1000)
    
    # Make a move as White: e2 to e4 (from row 6, col 4 to row 4, col 4)
    print("Making white pawn move e2-e4...")
    page.evaluate("executeMove({ from: [6, 4], to: [4, 4] });")
    page.wait_for_timeout(300)
    # Trigger AI move
    print("Triggering AI move for Black (~1800 ELO)...")
    page.evaluate("playAiMove();")
    page.wait_for_timeout(1000) # Wait for AI minimax
    
    page.screenshot(path=os.path.join(screenshot_dir, "04_chess_arena_1800_elo.png"))
    print("Screenshot 4 taken: 04_chess_arena_1800_elo.png")
    
    # 4. Test Flipbook Modal (Page 8 Coursera Specializations)
    print("Opening Flipbook Modal...")
    page.evaluate("closeChessModal(); openFlipbookModal();")
    page.wait_for_timeout(1000)
    page.screenshot(path=os.path.join(screenshot_dir, "05_flipbook_modal.png"))
    print("Screenshot 5 taken: 05_flipbook_modal.png")

    # 5. Test index.html (Standard Mode without Atlas)
    print("Navigating to index.html...")
    page.goto(index_path)
    page.wait_for_timeout(1500)
    
    atlas_in_index = page.locator("#atlas").count()
    print(f"Atlas section in index.html: {atlas_in_index} (must be 0)")
    assert atlas_in_index == 0, "Atlas section must be removed from index.html"
    
    page.screenshot(path=os.path.join(screenshot_dir, "06_standard_index_clean.png"))
    print("Screenshot 6 taken: 06_standard_index_clean.png")

    browser.close()
    print("All verification steps completed successfully!")

