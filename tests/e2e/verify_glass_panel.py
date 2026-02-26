from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Set viewport to mobile size to test responsiveness
        page.set_viewport_size({"width": 375, "height": 812})

        try:
            page.goto("http://localhost:8080")
            print("Page loaded")

            # Click Enter
            page.click("#enter-btn")
            print("Entered app")

            # Wait for map to be visible
            page.wait_for_selector("#map.visible", timeout=10000)

            # Wait for markers to appear in DOM
            page.wait_for_selector(".custom-marker", state="attached", timeout=10000)
            print("Markers attached")

            # Wait for animation
            page.wait_for_timeout(3000)

            # Click a marker
            markers = page.locator(".custom-marker")
            # We need to click the div inside the marker usually, or the marker itself.
            # Leaflet markers are divs.
            # Click the one for Nuuk or similar.
            # Since we don't know which is which easily without class, we just click first.
            markers.first.click()
            print("Marker clicked")

            # Wait for glass panel
            page.wait_for_selector("#glass-panel", state="visible", timeout=5000)
            # Ensure it's not hidden class
            page.wait_for_selector("#glass-panel:not(.hidden)", timeout=5000)

            page.wait_for_timeout(1000) # Wait for slide up animation

            # Take screenshot
            page.screenshot(path="verification_glass_panel.png")
            print("Screenshot saved to verification_glass_panel.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="error.png")

        browser.close()

if __name__ == "__main__":
    run()
