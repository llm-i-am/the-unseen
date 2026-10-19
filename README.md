# THE UNSEEN · Volume VI: HDR RUPTURE

An intense 16-act generative audiovisual performance (eight geometric universes reconfigured into new stages) inspired by the October 2026 preprint [*Rapid alternation of conscious and suppressed stimulus representations in the primate brain*](https://doi.org/10.64898/2026.10.15.759299) by Hesse and colleagues.

**Live public GitHub Pages URL:** https://llm-i-am.github.io/the-unseen/

## Volume VI — Safari-native HDR RUPTURE

**The default renderer is now a new full-frame WebGPU implementation**, designed specifically for **iOS 26 Safari**. Earlier versions drew primarily to an SDR WebGL canvas and used a small WebGPU HDR highlight overlay; Volume VI makes the *entire image* a 16-bit floating-point WebGPU canvas. The old WebGL scene stays as a fallback.

The primary canvas requests:

\`\`\`js
context.configure({
  device,
  format: "rgba16float",
  colorSpace: "display-p3",
  alphaMode: "opaque",
  toneMapping: { mode: "extended" }
});
\`\`\`

The WGSL shader emits pixel values above ordinary SDR white for finely distributed luminous caustics while preserving dark regions for contrast. The display/headroom decides how much real luminance is available. **There is no such thing as requesting "110% HDR brightness" from Safari**: the phone's hardware, OS tone mapping, and current brightness limit the result. A successful configuration also does **not** verify measured luminance.

The implementation explicitly uses \`dynamic-range-limit: no-limit\` for the WebGPU layer, WebGPU/Display-P3 feature detection, GPU-device-loss fallback, and adaptive resolution. On iOS hardware without WebGPU, in private/restricted contexts, or without HDR headroom, the existing WebGL version remains functional. Safari 26.0's release notes explicitly include WebGPU and HDR support in WebGPU canvas.

The composition is **HUDless from the moment the user enters**. No chapter labels, buttons, progress bar, or breathing overlay interrupt the image. Double-tap anywhere or touch with two fingers to reveal controls; press Escape on a keyboard. Pausing, muting, gentler motion, and exiting remain possible. Audio requires the entry tap per browser policy.

All 16 acts are now **7–8 seconds long**, continuously looping. Optical transformations and procedural sound keep moving without breath-counting or long prose delays.

- \`src/hdr6-shader.js\`: new WGSL optical renderer; eight scene families, labyrinth recursion, concentric mirror structures, optical flow, refractive high-range caustics, moving portals and spatial interference.
- \`src/hdr6-engine.js\`: Safari-native 16f P3 EDR device/pipeline/controller, self-adjusting rendering resolution, and fallback recovery.
- \`hdr6.css\`: explicit HDR compositing and zero-distraction display.
- \`tests/hdr6-gpu-test.cjs\`: attempts actual software-WebGPU WGSL shader compilation, reporting unsupported CI environments honestly.
- \`tests/browser-smoke.cjs\`: desktop/mobile gesture and runtime checks.

Reference materials: [Safari 26 release notes](https://developer.apple.com/documentation/safari-release-notes/safari-26-release-notes), [WebKit Safari 26 feature review](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/), [MDN GPUCanvasContext configuration](https://developer.mozilla.org/en-US/docs/Web/API/GPUCanvasContext/configure), [Apple's EDR headroom documentation](https://developer.apple.com/videos/play/wwdc2022/10113/), and [W3C flashing-content limits](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold).

**Scope of verification:** automated Chromium tests cannot prove Safari-specific HDR luminance. Confirm actual highlights on a physical iOS 26 HDR-capable iPhone using Safari; compare standard/extended tone-mapping conditions and display brightness. The paper inspiring this artwork describes neural representations in macaque experiments, not a human brain "refresh rate" or display stimulation protocol.

## Volume V — RUPTURE: No Safe Center

**Intent:** replace the calm guided-breathing interface with raw, visually abrasive, industrial generative art. This is not medical, neurological or therapeutic stimulation.

The default launches a 16-act audiovisual ride with sharp-edged neon typography and a stripped-back HUD. Chapters last approximately 14–24 seconds instead of the previous 42.5-second progression. Generated spatial sound, speed, and geometry vary at every act. The site remains static and dependency-free.

### New systems

- **Rupture Field (src/rupture-field.js):** fractal hard-light cuts, moiré lattices, prismatic folding, local spatial dislocations, chromatic shearing and evolving spectral structures.
- **Riot Audio (src/riot-audio.js):** sample-free industrial rhythm sequencer with pitched kick sweeps, bandpass-noise snares and hats, distorted metallic fragments, FM bass stabs, probabilistic accents and rhythmic dropouts. Works alongside the existing spatial orbiters, harmonic choir and Shepard–Risset-like rising/falling tones.
- **Memory Mosh (src/memory-mosh.js):** partial-frame delayed-image collage and local shearing with visual history feedback. Independently implemented; source references credited below.
- **16-chapter director (src/rupture-experience.js):** stage-specific names, changing tempo, motion speed, geometric coupling, color and visual form, plus sudden typographic interventions. The default no longer counts breaths.
- **Brutalist UI (rupture.css):** enormous compressed neon lettering and a single unobtrusive controls menu. Mute, pause, next reality, intensity, gentler motion and exit remain available.
- **Progressive performance:** adaptive GPU resolution, low-cost entry preview, automatic conditional HDR, bounded compressor and sound opt-out.

### The evidence and its limits

The original Hesse et al. study measured temporally interleaved conscious/suppressed neural representations in macaques, not an effective 16 Hz human screen-entrainment protocol. The visual and auditory effects here are an original generative artwork, not clinical stimulation. Intensity comes from geometry, optical flow, contradictory spatial signals and audio timbre, **not repeated full-screen flashes**.

Research and independent design references:

- [Live frame-feedback datamosh art](https://github.com/niccolofanton/data-mosh), conceptual reference only; no copied code.
- [Sample-free Web Audio drum synthesis](https://github.com/sen-ltd/drum-machine), architectural reference only; no copied code.
- [Looming sounds influence perceived visual size/brightness](https://doi.org/10.1016/j.cognition.2014.04.011).
- [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).
- [W3C flash threshold guidance](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold).

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
