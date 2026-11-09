# Greenland basemap and pin repair, November 9, 2026

Current public CARTO requests returned HTTP200256px images reading API KEY REQUIRED. Pixel inspection, not HTTP status or decoded image width, establishes map readiness.

- Replaced the denied keyless CARTO URL with the standard HTTPS OSM URL. OSM policy https://operations.osmfoundation.org/policies/tiles/ read November9: normal interactive browser use, valid Referer/browser User-Agent, normal cache headers, visible attribution, no bulk/offline/prefetch. Best effort, not a service guarantee. No account, key, paid plan or proxy introduced.
- Always-visible OSM copyright credit is outside map color/blur filters, clear of top controls at phone sizes. Required licence notices are not hidden under Reference. Links to https://www.openstreetmap.org/copyright . No changes to source destination data.
- GSAP entry animation and CSS hover previously overwrote Leaflet marker-root translations. Pins were bunched at the top or moved away from the pointer before clicking. Animate only inner artwork, preserve all root translations and coordinates.
- Existing app-shell service worker cache version bumped. No map tile URL is precached, no offline map support claimed. Existing open tabs may need closing/reopening to activate the new worker.
- Automated browser QA uses synthetic SVG tiles by interception, never hits live OSM tile servers or downloads/prefetches map areas.320/390/844/1320: attribution visible/hittable and clear of controls; actual pin click/About saving/Explore/History/Close; zero page errors. Map transform can expand document geometric extents while clipped by the existing page; no claim of whole-app overflow acceptance.
- Stubbed screenshots prove chrome/pin placement only, NOT geographic map pixels. Real-map screenshot, exact production bytes and final current deployment still required.
- Existing broader problems remain out of scope: fictional route curve is not directions, Aurora/ice models are not live forecasts, travel/photo data not freshly validated, favorites are not saved, full-app accessibility/performance/design not accepted.

## CI qualification repair

First PR CI failed before browser tests because ubuntu-latest resolved to26.04, unsupported by locked Playwright1.58.2. Pin ubuntu-24.04 without changing permissions, secrets or schedules. Legacy e2e fixture intercepts every OSM tile request, including navigation/insight tests. Local server isolated on4197: earlier8080 reuse reached another app, not a product failure. Four legacy browser tests pass with installed Chrome. Real map pixels remain a separate manual-browser gate.
