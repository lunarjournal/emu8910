### emu8910

This repository contains a Typescript implementation of General Instrument's [AY-3-8910](https://en.wikipedia.org/wiki/General_Instrument_AY-3-8910) PSG (programmable sound generator).
It implements most of the PSG's original registers. A datasheet can be found [here](http://map.grauw.nl/resources/sound/generalinstrument_ay-3-8910.pdf).

Sound output is achieved in the browser through an AudioContext() hook. <br>
This emulator also adds interrupt support (with variable frequency) for updating the PSG's registers.

This repository currently lacks a working example of the emulator which I plan to add in the future.

Files:

* emu8910.ts - Core emulator implementation
