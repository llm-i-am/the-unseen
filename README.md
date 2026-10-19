# THE UNSEEN · A 60ms Observatory

An interactive, eight-world audiovisual observatory inspired by the October 2026 preprint [*Rapid alternation of conscious and suppressed stimulus representations in the primate brain*](https://doi.org/10.64898/2026.10.15.759299) by Hesse and colleagues.

**Expected public Pages URL (after you enable Pages):** https://llm-i-am.github.io/the-unseen/

## Volume IV: Infinite Worlds / A Psychoacoustic Odyssey

The site now combines two independently organized sensory systems into a deeper, spatially coherent experience. Everything remains **procedural, local and dependency-free**.

### Twelve major new visual/audio systems

- **Hyperfield optical architecture:** eight scene-specific additions to the original GLSL worlds, including nested impossible orbit paths, cross-patch opposing hypotheses, quasi-periodic Lissajous figures, double-exposure perspective, infinite luminous vaults, recursive folded space, bidirectional optic flow and gravitational lensing. All are original math/shaders.
- **Dual-direction optic flow:** two point-cloud strata travel in contradictory directions with slow orbital drift. This is inspired by research on *vection*, an illusion of self-motion, rather than presented as a proven way to increase conscious access.
- **Chromatic depth and lensing:** cyan/violet edge disparity supports perceived layer separation without rapidly alternating full-frame brightness.
- **Sound-reactive shader space:** frequency bands are slowly integrated into geometric motion and refraction, while physical light levels remain continuously graded. Auditory timing changes *form*, not dangerous large-area flashes.
- **Dual-world soundscape:** four continuously orbiting **3D HRTF PannerNode** sound emitters, two counter-moving spatial populations, each with distinct harmonic relationships.
- **Six-voice additive choir:** gently detuned, low-pass-filtered tones form a harmonic bed behind the original sixteen partial oscillators, moving between apparent depths.
- **Stochastic crystalline score:** procedurally generated, decaying three-part chimes appear at long non-periodic intervals and accompany world transitions; no pre-recorded samples.
- **Risset-like perpetual ascent:** eight windowed carriers migrate through four octaves to form a slowly rising or falling pitch paradox. Inspired by auditory Shepard/Risset illusions, **not a brainwave-frequency protocol**.
- **Breath-linked movement:** 4/6 guided breathing drives spatial extent, atmospheric filters and the UI halo. No forced holds, rapid breathing or respiratory claims.
- **Stage-aware constellation engine:** an additional adaptive 2D depth field stays separate from WebGL, providing optic flow and fine-detail persistence on displays of different size.
- **Cross-modal binding:** changes in the music, lighting geometry, and journey stages intentionally co-occur to create a cohesive audiovisual event. This is design informed by audiovisual temporal-integration research, **not a measured therapeutic effect**.
- **Advanced compatibility:** automatic WebGPU HDR where supported, display-P3-capable WebGL2, adaptive GPU quality, 2D fallback, reduced motion and full sound opt-out.

### Scientific grounding and limitations

Hesse et al. (2026) found that macaque neural populations during binocular flash suppression could be separated into coordinated micro-epochs predominantly representing the conscious or suppressed face. Median inferred dwell times were 64 and 59 ms. Conscious-state feature tuning was approximately 1.21x stronger, and simultaneously recorded face patches were not strongly synchronized. This **does not mean a browser can reproduce those neural states by delivering flashes**. The state timings inside this code are computational artwork only.

Other useful research and implementation references:

- [Original Hesse et al. preprint (2026)](https://doi.org/10.64898/2026.10.15.759299), CC BY 4.0.
- [Visual perception of self-motion](https://doi.org/10.1146/annurev-vision-121423-013200), review on optic flow and vection.
- [Directionless vection](https://pmc.ncbi.nlm.nih.gov/articles/PMC3589905/), opposing expanding and contracting flow.
- [Chromostereopsis and illusory color depth](https://pmc.ncbi.nlm.nih.gov/articles/PMC4382974/).
- [Audiovisual temporal binding](https://pubmed.ncbi.nlm.nih.gov/23709064/), review of cross-modal timing.
- [W3C WCAG 2.3.1](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold), constraints on potentially seizure-inducing flashes.
- [Tone.js](https://github.com/Tonejs/Tone.js) (Web Audio design reference, **not included as a dependency**).
- [LYGIA](https://github.com/patriciogonzalezvivo/lygia) (shader-design reference, **no external library included**).
- [WebGPU extended HDR example](https://github.com/code4fukui/hdr-demo).
- [MDN HRTF PannerNode](https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/panningModel).

The repository contains original implementations rather than copied third-party source. No clinical claims are made. Large-area 15 Hz screen flashes are deliberately avoided, because they can induce photosensitive seizures without any established benefit from this paper.

## Volume III: The Immersive Journey

**One tap → full-bleed universe.** All intensity, geometry, depth, and the available HDR highlight path are automatically enabled. The screen uses a minimal breathing halo, a gentle in/out instruction, and a small hidden controls menu. The rich diagnostics and toolbars from Volume II no longer appear during the journey.

A five-minute, approximately 6-breaths-per-minute practice uses 4-second gentle inhales and 6-second unforced exhales. Its pacing reflects the evidence for slow breathing around 0.1 Hz and exhale-focused breathing, **not a clinical finding of optimal 4/6 timing nor proven synergy with the paper’s neural switching**. There are no required breath holds, extreme inhalations, or fast flashes. Alternate equal 5/5 timing and reduced-motion comfort are available from the discreet menu. Every visual world smoothly morphs with the breath, while the procedural soundtrack breathes with it.

On modern iOS Safari, arbitrary sites cannot force-hide the browser bars. Use **Share → Add to Home Screen → Open as Web App** for the most immersive edge-to-edge experience. On supported browsers the app attempts fullscreen on the direct user entry gesture, requests a screen wake lock, and requests WebGPU HDR rendering automatically. These are capability-dependent and may be declined by platform policies.

For a research-oriented comparison, see [Cell Reports Medicine, 2023: brief exhale-focused breathwork](https://doi.org/10.1016/j.xcrm.2022.100895), and [Shao et al. (2024): meta-analysis on slow breathing](https://doi.org/10.1007/s12671-023-02294-2).

## Experience

Eight original GPU worlds: Aperture, Rivalry, Multiplex, Ghost, Cathedral, Fold, Neural Sea, and Event Horizon. Sixteen procedural oscillators, two moving noise beds, stereo panning, delays, generated convolution reverb, filter automation, an audio-reactive shader, and pointer-triggered sonic gestures. Entirely original vanilla JS, GLSL, WGSL, CSS and HTML: no CDN, no video, no prerecorded music, no APIs or bundler.

The synthetic neural model represents two partially independent face-processing patches, stochastic micro-epochs (default median 64ms), an illustrative 1.21x conscious tuning gain, separable slow On/Off activity and a split-population decoding **illustration**. All displayed neural data are generated simulations, NOT experimental measurements.

### Important science distinction

The study did **not** show that human consciousness has a 15/16 Hz display refresh rate. The 59 and 64ms durations are inferred neural population dwell times in macaque experiments. Our artwork does not recreate binocular flash suppression or claim an ability to entrain the brain. We avoid deliberate rapid full-screen brightness flashing; instead, micro-epoch switching changes slowly integrated geometry.

## Controls

Move the pointer to bend space, tap to create light and tones, or choose any of the eight scenes. Press **1–8** for modes, **M** for sound, **H** for settings, **F** for fullscreen or **Space** for pause. Customize density, depth, interference, energy, epoch median, patch coupling, auditory spaciousness and sound volume. Color presets: Abyss / Aurora / Ember. Reduced motion is available and respects system preference.

Automatically attempted true HDR (where supported): an independent extended-tone-mapping WebGPU `rgba16float` light pass. Actual HDR requires supporting browser, graphics hardware and screen. WebGL2 is the main canvas, with a Canvas2D fallback.

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
