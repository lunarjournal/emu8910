/**
 * @file emu8910.js
 * @brief Tiny AY8910 PSG Emulator - emu8910.js
 *
 * +---------------------------------------+
 * |   .-.         .-.         .-.         |
 * |  /   \       /   \       /   \        |
 * | /     \     /     \     /     \     / |
 * |        \   /       \   /       \   /  |
 * |         "_"         "_"         "_"   |
 * |                                       |
 * |  _   _   _ _  _   _   ___   ___ _  _  |
 * | | | | | | | \| | /_\ | _ \ / __| || | |
 * | | |_| |_| | .` |/ _ \|   /_\__ \ __ | |
 * | |____\___/|_|\_/_/ \_\_|_(_)___/_||_| |
 * |                                       |
 * |                                       |
 * | Lunar RF Labs                         |
 * | https://lunar.sh                      |
 * |                                       |
 * | RF Research Laboratories              |
 * | Copyright (C) 2022-2024               |
 * |                                       |
 * +---------------------------------------+
 *
 * Copyright (c) 2022 Lunar RF Labs
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var YM_CLOCK_ZX = 1750000;
var FIR = [-0.011368,
    0.004512,
    0.008657,
    -0.011763,
    -0.000000,
    0.012786,
    -0.010231,
    -0.005801,
    0.015915,
    -0.006411,
    -0.012504,
    0.017299,
    -0.000000,
    -0.019605,
    0.016077,
    0.009370,
    -0.026526,
    0.011074,
    0.022508,
    -0.032676,
    0.000000,
    0.042011,
    -0.037513,
    -0.024362,
    0.079577,
    -0.040604,
    -0.112540,
    0.294080,
    0.625000,
    0.294080,
    -0.112540,
    -0.040604,
    0.079577,
    -0.024362,
    -0.037513,
    0.042011,
    0.000000,
    -0.032676,
    0.022508,
    0.011074,
    -0.026526,
    0.009370,
    0.016077,
    -0.019605,
    -0.000000,
    0.017299,
    -0.012504,
    -0.006411,
    0.015915,
    -0.005801,
    -0.010231,
    0.012786,
    -0.000000,
    -0.011763,
    0.008657,
    0.004512,
    -0.011368];
var Interpolator = /** @class */ (function () {
    function Interpolator() {
        this.buffer = [];
        for (var i = 0; i < 4; i++) {
            this.buffer[i] = 0x0;
        }
    }
    Interpolator.prototype.step = function (x) {
        var b = this.buffer;
        b[0] = b[1];
        b[1] = b[2];
        b[2] = b[3];
        b[3] = x;
    };
    Interpolator.prototype.cubic = function (mu) {
        var b = this.buffer;
        var a0, a1, a2, a3, mu2 = 0;
        mu2 = mu * mu2;
        a0 = b[3] - b[2] - b[0] + b[1];
        a1 = b[0] - b[1] - a0;
        a2 = b[2] - b[0];
        a3 = b[1];
        return (a0 * mu * mu2 + a1 * mu2 + a2 * mu + a3);
    };
    return Interpolator;
}());
// DC filter
var BiasFilter = /** @class */ (function () {
    function BiasFilter(length, attenuate) {
        this.samples = [];
        this.index = 0x0;
        this.length = 0x0;
        this.sum = 0x0;
        this.attenuate = 0x0;
        this.length = length;
        this.sum = 0x0;
        for (var i = 0; i < this.length; i++) {
            this.samples[i] = 0x0;
        }
        this.attenuate = attenuate;
    }
    BiasFilter.prototype.step = function (x) {
        var index = this.index;
        var delta = x - this.samples[index];
        var attenuate = this.attenuate;
        var avg = 0x0;
        this.sum += delta;
        this.samples[index] = x;
        if (++this.index > (this.length - 1)) {
            this.index = 0x0;
        }
        avg = this.sum / this.length;
        return (x - avg) * (1 / attenuate);
    };
    return BiasFilter;
}());
var FirFilter = /** @class */ (function () {
    function FirFilter(h, m) {
        this.buffer = [];
        this.index = 0x0;
        this.offset = 0x0;
        this.length = 0x0;
        this.m = 0x0;
        this.h = [];
        this.length = h.length * m;
        this.index = 0;
        this.m = m;
        this.h = h;
        var buffer = this.buffer;
        for (var i = 0; i < this.length * 2; i++) {
            buffer[i] = 0x0;
        }
    }
    FirFilter.prototype.step = function (samples) {
        var index = this.index;
        var buffer = this.buffer;
        var length = this.length;
        var m = this.m;
        var h = this.h;
        var y = 0x0;
        var i = 0x0;
        this.offset = length - (index * m);
        var sub = buffer.slice(this.offset);
        for (i = 0; i < m; i++) {
            buffer[this.offset + i - 1] = samples[i];
        }
        for (i = 0; i < h.length; i++) {
            y += h[i] * (sub[i] + sub[h.length - i - 1]);
        }
        for (i = 0; i < m; i++) {
            buffer[this.offset + length - m + i] = buffer[this.offset + i];
        }
        this.index = (index + 1) % (length / m - 1);
        return y;
    };
    return FirFilter;
}());
var AudioDriver = /** @class */ (function () {
    function AudioDriver(host) {
        this.frequency = 0x0;
        this.update = function (ev) {
            var ch0 = ev.outputBuffer.getChannelData(0);
            var ch1 = ev.outputBuffer.getChannelData(1);
            var host = this.host;
            var filter = this.filter;
            var bias = this.bias;
            var output = [0, 0];
            var port = [0, 0];
            for (var i = 0; i < ch0.length; i++) {
                output = host.step();
                port[0] = filter[0].step(output[0]);
                port[1] = filter[1].step(output[1]);
                ch0[i] = bias + port[0];
                ch1[i] = bias + port[1];
            }
        }.bind(this);
        this.device = new AudioContext();
        var device = this.device;
        this.filter = [
            new BiasFilter(1024, 1.25),
            new BiasFilter(1024, 1.25),
            device.createBiquadFilter(),
            device.createBiquadFilter()
        ];
        var filter = this.filter;
        filter[2].type = "lowshelf";
        filter[2].frequency.value = 10000;
        filter[2].gain.value = 2;
        filter[3].type = "lowpass";
        filter[3].frequency.value = 10000;
        filter[3].Q.value = 1;
        this.frequency = device.sampleRate;
        this.context = device.createScriptProcessor(4096, 0, 2);
        this.context.onaudioprocess = this.update;
        this.context.connect(filter[2]);
        filter[2].connect(filter[3]);
        filter[3].connect(device.destination);
        this.host = host;
        this.bias = 0;
    }
    return AudioDriver;
}());
var PSG49_LUT;
(function (PSG49_LUT) {
    PSG49_LUT[PSG49_LUT["A_FINE"] = 0] = "A_FINE";
    PSG49_LUT[PSG49_LUT["A_COARSE"] = 1] = "A_COARSE";
    PSG49_LUT[PSG49_LUT["B_FINE"] = 2] = "B_FINE";
    PSG49_LUT[PSG49_LUT["B_COARSE"] = 3] = "B_COARSE";
    PSG49_LUT[PSG49_LUT["C_FINE"] = 4] = "C_FINE";
    PSG49_LUT[PSG49_LUT["C_COARSE"] = 5] = "C_COARSE";
    PSG49_LUT[PSG49_LUT["NOISE_PERIOD"] = 6] = "NOISE_PERIOD";
    PSG49_LUT[PSG49_LUT["MIXER"] = 7] = "MIXER";
    PSG49_LUT[PSG49_LUT["A_VOL"] = 8] = "A_VOL";
    PSG49_LUT[PSG49_LUT["B_VOL"] = 9] = "B_VOL";
    PSG49_LUT[PSG49_LUT["C_VOL"] = 10] = "C_VOL";
    PSG49_LUT[PSG49_LUT["ENV_FINE"] = 11] = "ENV_FINE";
    PSG49_LUT[PSG49_LUT["ENV_COARSE"] = 12] = "ENV_COARSE";
    PSG49_LUT[PSG49_LUT["ENV_SHAPE"] = 13] = "ENV_SHAPE";
})(PSG49_LUT || (PSG49_LUT = {}));
var PSG49 = /** @class */ (function () {
    function PSG49(clockRate, intRate) {
        // main register file
        this.register = {
            A_FINE: 0x0, A_COARSE: 0x0,
            B_FINE: 0x0, B_COARSE: 0x0,
            C_FINE: 0x0, C_COARSE: 0x0,
            NOISE_PERIOD: 0x0,
            // bit position
            // 5  4  3  2  1  0
            // NC NB NA TC TB TA
            // T = Tone, N = Noise
            MIXER: 0x0,
            A_VOL: 0x0,
            B_VOL: 0x0,
            C_VOL: 0x0,
            ENV_FINE: 0x0, ENV_COARSE: 0x0,
            ENV_SHAPE: 0x0,
            PORT_A: 0x0,
            PORT_B: 0x0
        };
        this.driver = new AudioDriver(this);
        this.interpolate = [
            new Interpolator(),
            new Interpolator()
        ];
        var m = 8;
        this.fir = [
            new FirFilter(FIR, m),
            new FirFilter(FIR, m)
        ];
        this.oversample = m;
        this.clock = {
            frequency: clockRate,
            scale: 1 / 16 * 2,
            cycle: 0,
            step: 0
        };
        this.interrupt = {
            frequency: intRate,
            cycle: 0,
            routine: function () { }
        };
        this.envelope = {
            strobe: 0,
            transient: 0,
            step: 0,
            shape: 0,
            offset: 0,
            stub: []
        };
        this.channels = [
            {
                counter: 0x0,
                pan: 0.5,
            },
            {
                counter: 0x0,
                pan: 0.5
            },
            {
                counter: 0x0,
                pan: 0.5
            },
            { counter: 0x0 }
        ];
        // seed noise generator
        this.channels[3].port = 0x1;
        this.dac = [];
        this.build_dac(1.3, 40);
        this.build_adsr();
    }
    PSG49.prototype.build_dac = function (decay, shift) {
        var dac = this.dac;
        var y = Math.sqrt(decay);
        var z = shift / 31;
        dac[0] = 0;
        dac[1] = 0;
        for (var i = 2; i <= 31; i++) {
            dac[i] = 1.0 / Math.pow(y, shift - (z * i));
        }
    };
    PSG49.prototype.init_test = function () {
        var r = this.register;
        r.MIXER = 56;
        r.A_VOL = 15;
        //r.A_VOL |= 0x10;
        r.A_FINE = 200;
        //r.ENV_COARSE = 200;
    };
    PSG49.prototype.build_adsr = function () {
        var envelope = this.envelope;
        var stub = envelope.stub;
        stub.reset = function (ev) {
            var strobe = ev.strobe;
            var transient = ev.transient;
            switch (ev.offset) {
                case 0x4:
                    transient = 0;
                case 0x0:
                    ev.step = strobe ? transient : 31;
                    break;
                case 0x5:
                    transient = 31;
                case 0x1:
                    ev.step = strobe ? transient : 0;
                    break;
                case 0x2:
                    ev.step = 31;
                    break;
                case 0x3:
                    ev.step = 0;
                    break;
            }
        };
        stub.grow = function (ev) {
            if (++ev.step > 31) {
                ev.strobe ^= 1;
                ev.stub.reset(ev);
            }
        };
        stub.decay = function (ev) {
            if (--ev.step < 0) {
                ev.strobe ^= 1;
                ev.stub.reset(ev);
            }
        };
        stub.hold = function (ev) { };
        envelope.matrix = [
            [stub.decay, stub.hold],
            [stub.grow, stub.hold],
            [stub.decay, stub.decay],
            [stub.grow, stub.grow],
            [stub.decay, stub.grow],
            [stub.grow, stub.decay],
        ];
    };
    PSG49.prototype.clamp = function () {
        var r = this.register;
        r.A_FINE &= 0xff;
        r.B_FINE &= 0xff;
        r.C_FINE &= 0xff;
        r.ENV_FINE &= 0xff;
        r.A_COARSE &= 0xf;
        r.B_COARSE &= 0xf;
        r.C_COARSE &= 0xf;
        r.ENV_COARSE &= 0xff;
        r.A_VOL &= 0x1f;
        r.B_VOL &= 0x1f;
        r.C_VOL &= 0x1f;
        r.NOISE_PERIOD &= 0x1f;
        r.MIXER &= 0x3f;
        r.ENV_SHAPE &= 0xff;
    };
    PSG49.prototype.map = function () {
        var r = this.register;
        var channel = this.channels;
        var ev = this.envelope;
        var toneMask = [0x1, 0x2, 0x4];
        var noiseMask = [0x8, 0x10, 0x20];
        this.clamp();
        // update tone channel period
        channel[0].period = r.A_FINE | r.A_COARSE << 8;
        channel[1].period = r.B_FINE | r.B_COARSE << 8;
        channel[2].period = r.C_FINE | r.C_COARSE << 8;
        channel[0].volume = r.A_VOL & 0xf;
        channel[1].volume = r.B_VOL & 0xf;
        channel[2].volume = r.C_VOL & 0xf;
        for (var i = 0; i < 3; i++) {
            var bit = r.MIXER & toneMask[i];
            channel[i].tone = bit ? 1 : 0;
        }
        for (var i = 0; i < 3; i++) {
            var bit = r.MIXER & noiseMask[i];
            channel[i].noise = bit ? 1 : 0;
        }
        channel[0].envelope = (r.A_VOL & 0x10) ? 0 : 1;
        channel[1].envelope = (r.B_VOL & 0x10) ? 0 : 1;
        channel[2].envelope = (r.C_VOL & 0x10) ? 0 : 1;
        // update channel noise period
        channel[3].period = r.NOISE_PERIOD << 1;
        ev.period = r.ENV_FINE | r.ENV_COARSE << 8;
        ev.shape = r.ENV_SHAPE;
        switch (ev.shape) {
            case 0x0:
            case 0x1:
            case 0x2:
            case 0x3:
            case 0x9:
                ev.transient = 0;
                ev.offset = 0;
                r.ENV_SHAPE = 0xff;
                break;
            case 0xb:
                ev.transient = 31;
                ev.offset = 0;
                r.ENV_SHAPE = 0xff;
                break;
            case 0x4:
            case 0x5:
            case 0x6:
            case 0x7:
            case 0xf:
                ev.transient = 0;
                ev.offset = 1;
                r.ENV_SHAPE = 0xff;
            case 0xd:
                ev.transient = 31;
                ev.offset = 1;
                r.ENV_SHAPE = 0xff;
                break;
            case 0x8:
                ev.offset = 2;
                break;
            case 0xc:
                ev.offset = 3;
                break;
            case 0xa:
                ev.offset = 4;
                break;
            case 0xe:
                ev.offset = 5;
                break;
        }
        if (ev.shape != ev.store) {
            ev.strobe = 0x0;
            ev.counter = 0x0;
            ev.stub.reset(ev);
        }
        ev.store = r.ENV_SHAPE;
    };
    PSG49.prototype.step_tone = function (index) {
        var ch = this.channels[index % 3];
        var step = this.clock.step;
        var port = ch.port;
        var period = (ch.period == 0x0) ? 0x1 : ch.period;
        ch.counter += step;
        if (ch.counter >= period) {
            // 50% duty cycle
            port ^= 0x1;
            ch.port = port;
            ch.counter = 0x0;
        }
        return ch.port;
    };
    PSG49.prototype.step_envelope = function () {
        var step = this.clock.step;
        var ev = this.envelope;
        ev.counter += step;
        if (ev.counter >= ev.period) {
            ev.matrix[ev.offset][ev.strobe](ev);
            ev.counter = 0x0;
        }
        return (ev.step);
    };
    PSG49.prototype.step_noise = function () {
        var ch = this.channels[3];
        var step = this.clock.step;
        var port = ch.port;
        var period = (ch.period == 0) ? 1 : ch.period;
        ch.counter += step;
        if (ch.counter >= period) {
            port ^= (((port & 1) ^ ((port >> 3) & 1)) << 17);
            port >>= 1;
            ch.port = port;
            ch.counter = 0x0;
        }
        return ch.port & 1;
    };
    PSG49.prototype.step_mixer = function () {
        var port = 0x0;
        var output = [0.0, 0.0];
        var index = 0x0;
        var ch = this.channels;
        var noise = this.step_noise();
        var step = this.step_envelope();
        for (var i = 0; i < 3; i++) {
            var volume = ch[i].volume;
            var pan = ch[i].pan;
            port = this.step_tone(i) | ch[i].tone;
            port &= noise | ch[i].noise;
            // todo: add dac volume table
            //bit*=toneChannel[i].volume;
            // mix each channel
            if (!ch[i].envelope) {
                index = step;
            }
            else {
                index = volume * 2 + 1;
            }
            port *= this.dac[index];
            // clamp pan levels
            // distortion over +1 ?
            if (pan > 0.9) {
                pan = 0.9;
            }
            else if (pan < 0.1) {
                pan = 0.1;
            }
            output[0] += port * (1 - pan);
            output[1] += port * (pan);
        }
        return output;
    };
    PSG49.prototype.step = function () {
        var output = [];
        var clockStep = 0;
        var intStep = 0;
        var i = 0x0;
        var clock = this.clock;
        var driver = this.driver;
        var fir = this.fir;
        var oversample = this.oversample;
        var interpolate = this.interpolate;
        var interrupt = this.interrupt;
        var x = clock.scale;
        var fc = clock.frequency;
        var fd = driver.frequency;
        var fi = interrupt.frequency;
        clockStep = (fc * x) / fd;
        clock.step = clockStep / oversample;
        intStep = fi / fd;
        // add number of clock cycle
        interrupt.cycle += intStep;
        // do we have clock cycles to process?
        // if so process single clock cycle
        var sample_left = [];
        var sample_right = [];
        for (i = 0; i < oversample; i++) {
            sample_left[i] = 0x0;
            sample_right[i] = 0x0;
        }
        if (interrupt.cycle > 1) {
            interrupt.cycle--;
            interrupt.routine();
            interrupt.cycle = 0;
        }
        for (var i_1 = 0; i_1 < oversample; i_1++) {
            clock.cycle += clockStep;
            if (clock.cycle > 1) {
                clock.cycle--;
                this.map();
                output = this.step_mixer();
                interpolate[0].step(output[0]);
                interpolate[1].step(output[1]);
            }
            sample_left[i_1] = interpolate[0].cubic(0.5);
            sample_right[i_1] = interpolate[1].cubic(0.5);
        }
        output[0] = fir[0].step(sample_left);
        output[1] = fir[1].step(sample_right);
        return output;
    };
    return PSG49;
}());
