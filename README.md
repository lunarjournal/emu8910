### emu8910

This repository contains a Typescript implementation of General Instrument's [AY-3-8910](https://en.wikipedia.org/wiki/General_Instrument_AY-3-8910) PSG (programmable sound generator).
It implements most of the PSG's original registers. A datasheet can be found [here](http://map.grauw.nl/resources/sound/generalinstrument_ay-3-8910.pdf).

Sound output is achieved in the browser through an AudioContext() hook. <br>
This emulator also adds interrupt support (with variable frequency) for updating the PSG's registers.

FIR filter data generated using:
[https://www.arc.id.au/FilterDesign.html](https://www.arc.id.au/FilterDesign.html)

Compile with `tsc emu8910.ts`.

Files:

* src/emu8910.ts - Core emulator implementation
* fym.js - FYM (Fast YM) format parser
* update.js - Register parser
* index.html - HTML boilerplate

To run demo start web server: `python -m http.server 8000` and navigate to `index.html`.

Then click anywhere on the page to start audio output.

