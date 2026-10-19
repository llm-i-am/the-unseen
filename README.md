# THE UNSEEN · A 60ms Observatory

An interactive, eight-world audiovisual observatory inspired by the October 2026 preprint [*Rapid alternation of conscious and suppressed stimulus representations in the primate brain*](https://doi.org/10.64898/2026.10.15.759299) by Hesse and colleagues.

**Expected public Pages URL (after you enable Pages):** https://llm-i-am.github.io/the-unseen/

## Experience

Eight original GPU worlds: Aperture, Rivalry, Multiplex, Ghost, Cathedral, Fold, Neural Sea, and Event Horizon. Sixteen procedural oscillators, two moving noise beds, stereo panning, delays, generated convolution reverb, filter automation, an audio-reactive shader, and pointer-triggered sonic gestures. Entirely original vanilla JS, GLSL, WGSL, CSS and HTML: no CDN, no video, no prerecorded music, no APIs or bundler.

The synthetic neural model represents two partially independent face-processing patches, stochastic micro-epochs (default median 64ms), an illustrative 1.21x conscious tuning gain, separable slow On/Off activity and a split-population decoding **illustration**. All displayed neural data are generated simulations, NOT experimental measurements.

### Important science distinction

The study did **not** show that human consciousness has a 15/16 Hz display refresh rate. The 59 and 64ms durations are inferred neural population dwell times in macaque experiments. Our artwork does not recreate binocular flash suppression or claim an ability to entrain the brain. We avoid deliberate rapid full-screen brightness flashing; instead, micro-epoch switching changes slowly integrated geometry.

## Controls

Move the pointer to bend space, tap to create light and tones, or choose any of the eight scenes. Press **1–8** for modes, **M** for sound, **H** for settings, **F** for fullscreen or **Space** for pause. Customize density, depth, interference, energy, epoch median, patch coupling, auditory spaciousness and sound volume. Color presets: Abyss / Aurora / Ember. Reduced motion is available and respects system preference.

Optional true HDR: an independent extended-tone-mapping WebGPU `rgba16float` light pass. Actual HDR requires supporting browser, graphics hardware and screen. WebGL2 is the main canvas, with a Canvas2D fallback.

**Comfort:** moving geometry and spatial sound may cause discomfort. Use comfortable volume/brightness, especially on HDR screens, and stop if uncomfortable.

## Publish: GitHub Pages

This is a **static site, not Gatsby**. In this repository open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch** → **main** → **/(root)** → **Save**. The canonical site becomes:

https://llm-i-am.github.io/the-unseen/

It may take a short while for GitHub Pages and social-link previews to populate. Share the Pages URL (not the GitHub repo URL) via iMessage.

## Images and social integration

`assets/artwork/share.svg` and `share-alt.svg` are original 1200x630 SVG social compositions; `symbol.svg` is the emblem. GitHub Actions `generate-art.yml` rasterizes the source into `assets/og-cover.png`, `assets/og-alternative.png`, icons 16/32/48/180/192/512, and `favicon.ico`. The HTML exposes absolute Open Graph/Twitter image tags, Apple touch icon and a web manifest. Ensure that the image workflow has completed before enabling Pages.

## Local development

```bash
python3 -m http.server 8000
# open http://localhost:8000/
```

Static files: `index.html`, `style.css`, `src/shaders.js`, `src/audio.js`, `src/app.js`, `assets/`. JavaScript needs no build step. Audio requires a user gesture. WebGPU requires HTTPS or localhost.

## Credits / license

Independent science-inspired art, not affiliated with the study authors. The original research is an **unreviewed preprint** and is cited above. Source code/artwork in this repository are offered under the MIT license; the paper itself retains its own license.
