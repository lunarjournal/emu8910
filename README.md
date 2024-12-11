# emu8910

This repository contains a `Typescript` implementation of General Instrument's [`AY8910`](https://en.wikipedia.org/wiki/General_Instrument_AY-3-8910) `PSG` (programmable sound generator).

It implements most of the `PSG's` original registers. <br>
The offical datasheet for the `PSG` can be found [`here`](http://map.grauw.nl/resources/sound/generalinstrument_ay-3-8910.pdf).

> **Demo Player** <br>
> [`AYSir`](https://drsnuggles.github.io/AYSir/?engine=lunar)

Sound output is achieved in the browser through an `AudioContext()` hook. <br>
This emulator also adds interrupt support (with variable frequency) for updating the `PSG's` registers.

FIR filter data generated using:
[`https://www.arc.id.au/FilterDesign.html`](https://www.arc.id.au/FilterDesign.html).

Compile with `tsc emu8910.ts`.

To use simply create a `PSG49` object as follows:
```
var emu8910 = new PSG49(YM_CLOCK_ZX, 50);
```
Which sets the default clock speed and interrupt frequency (`50 Hz`). 

This exposes a a `PSG` register file in the `emu8910.register` object:
```
emu8910.register.A_FINE
emu8910.register.A_COARSE
emu8910.register.B_FINE
emu8910.register.B_COARSE
emu8910.register.C_FINE
emu8910.register.C_COARSE
emu8910.register.NOISE_PERIOD
emu8910.register.MIXER
emu8910.register.A_VOL
emu8910.register.B_VOL
emu8910.register.C_VOL
emu8910.register.ENV_FINE
emu8910.register.ENV_COARSE
emu8910.register.ENV_SHAPE
```

The register file is then used to control the `PSG` or extract state information.

To play a FYM module:
```
song = new FYMReader(<BUFFER>);
emu8910.interrupt.routine = <ISR_FUNC>
emu8910.clock.frequency = song.getClockRate()
emu8910.interrupt.frequency = song.getFrameRate()
```

This sets the `ISR` (Interrupt Service Routine) function, clock and interrupt frequency for a specific song.

To stop playback:
```
emu8910.driver.device.suspend()
emu8910.interrupt.frequency = 0
```
To resume:
```
emu8910.driver.device.resume()
emu8910.interrupt.frequency = song.getFrameRate()
```

> Note: You can access the emulator's internal register file with `emu8910.register`.

These registers need to be updated at the frequency of the `ISR`.

Files:

* `src/emu8910.ts` - `core emulator implementation`.
* `fym.js` - `FYM (Fast YM) format parser`.
* `parser.js` - `register parser`.
* `index.html` - `HTML boilerplate`.

To run demo start web server: `python -m http.server 8000` and navigate to `index.html`.

> Note: Click anywhere on the page to start audio output.

