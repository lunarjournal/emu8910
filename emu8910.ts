// Copyright (C) 
// Author: Dylan Muller

const YM_CLOCK_ZX = 1750000;
const FIR = 

[-0.000058, 
    0.000024, 
    0.000088, 
    -0.000003, 
    -0.000116, 
    -0.000035, 
    0.000137, 
    0.000089, 
    -0.000143, 
    -0.000156, 
    0.000126, 
    0.000231, 
    -0.000079, 
    -0.000304, 
    -0.000002, 
    0.000362, 
    0.000117, 
    -0.000390, 
    -0.000261, 
    0.000375, 
    0.000423, 
    -0.000304, 
    -0.000585, 
    0.000168, 
    0.000726, 
    0.000033, 
    -0.000821, 
    -0.000294, 
    0.000845, 
    0.000596, 
    -0.000775, 
    -0.000915, 
    0.000593, 
    0.001215, 
    -0.000292, 
    -0.001456, 
    -0.000121, 
    0.001594, 
    0.000626, 
    -0.001589, 
    -0.001186, 
    0.001405, 
    0.001751, 
    -0.001025, 
    -0.002258, 
    0.000444, 
    0.002638, 
    0.000316, 
    -0.002820, 
    -0.001211, 
    0.002743, 
    0.002175, 
    -0.002360, 
    -0.003117, 
    0.001647, 
    0.003933, 
    -0.000611, 
    -0.004512, 
    -0.000705, 
    0.004744, 
    0.002222, 
    -0.004535, 
    -0.003825, 
    0.003817, 
    0.005369, 
    -0.002558, 
    -0.006686, 
    0.000773, 
    0.007598, 
    0.001470, 
    -0.007929, 
    -0.004048, 
    0.007523, 
    0.006783, 
    -0.006258, 
    -0.009449, 
    0.004059, 
    0.011782, 
    -0.000908, 
    -0.013485, 
    -0.003144, 
    0.014246, 
    0.007982, 
    -0.013741, 
    -0.013425, 
    0.011632, 
    0.019237, 
    -0.007546, 
    -0.025141, 
    0.000999, 
    0.030835, 
    0.008787, 
    -0.036013, 
    -0.023415, 
    0.040387, 
    0.047128, 
    -0.043707, 
    -0.095861, 
    0.045780, 
    0.314841, 
    0.453515, 
    0.314841, 
    0.045780, 
    -0.095861, 
    -0.043707, 
    0.047128, 
    0.040387, 
    -0.023415, 
    -0.036013, 
    0.008787, 
    0.030835, 
    0.000999, 
    -0.025141, 
    -0.007546, 
    0.019237, 
    0.011632, 
    -0.013425, 
    -0.013741, 
    0.007982, 
    0.014246, 
    -0.003144, 
    -0.013485, 
    -0.000908, 
    0.011782, 
    0.004059, 
    -0.009449, 
    -0.006258, 
    0.006783, 
    0.007523, 
    -0.004048, 
    -0.007929, 
    0.001470, 
    0.007598, 
    0.000773, 
    -0.006686, 
    -0.002558, 
    0.005369, 
    0.003817, 
    -0.003825, 
    -0.004535, 
    0.002222, 
    0.004744, 
    -0.000705, 
    -0.004512, 
    -0.000611, 
    0.003933, 
    0.001647, 
    -0.003117, 
    -0.002360, 
    0.002175, 
    0.002743, 
    -0.001211, 
    -0.002820, 
    0.000316, 
    0.002638, 
    0.000444, 
    -0.002258, 
    -0.001025, 
    0.001751, 
    0.001405, 
    -0.001186, 
    -0.001589, 
    0.000626, 
    0.001594, 
    -0.000121, 
    -0.001456, 
    -0.000292, 
    0.001215, 
    0.000593, 
    -0.000915, 
    -0.000775, 
    0.000596, 
    0.000845, 
    -0.000294, 
    -0.000821, 
    0.000033, 
    0.000726, 
    0.000168, 
    -0.000585, 
    -0.000304, 
    0.000423, 
    0.000375, 
    -0.000261, 
    -0.000390, 
    0.000117, 
    0.000362, 
    -0.000002, 
    -0.000304, 
    -0.000079, 
    0.000231, 
    0.000126, 
    -0.000156, 
    -0.000143, 
    0.000089, 
    0.000137, 
    -0.000035, 
    -0.000116, 
    -0.000003, 
    0.000088, 
    0.000024, 
    -0.000058] ;



interface Channel{

    port : number,
    counter : number,
    period : number,
    volume : number,
    pan : number,
    tone : number,
    noise : number,
    envelope : number

}

interface Envelope{

    counter : number,
    period : number,
    shape : number,
    stub : any,
    matrix : any,
    strobe : number,
    offset : number,
    transient : number,
    store : number,
    step : number

}

interface Oscillator{

    frequency: number,
    scale : number,
    cycle : number,
    step : number

}

interface Interrupt{
    frequency : number,
    routine : any,
    cycle : number,
}

class Interpolator{
    buffer : number[] = [];

    constructor(){
        for(let i = 0; i < 4; i++){
            this.buffer[i] = 0x0;
        }
    }

    step(x : number){
        let b = this.buffer;
        b[0] = b[1];
        b[1] = b[2];
        b[2] = b[3];

        b[3] = x;
    }

    cubic(mu : number){

        let b = this.buffer; 
        let a0,a1,a2,a3,mu2 = 0;
        mu2 = mu * mu2;
        a0 = b[3] - b[2] - b[0] + b[1];
        a1 = b[0] - b[1] - a0;
        a2 = b[2] - b[0];
        a3 = b[1];

        return (a0*mu*mu2 + a1*mu2 + a2*mu + a3);
    }

}

// DC filter
class BiasFilter {

    samples : number[] =[];
    index : number = 0x0;
    length : number = 0x0;
    sum: number = 0x0;
    attenuate : number = 0x0;
    
    constructor(length : number, attenuate : number){

        this.length = length;
        this.sum = 0x0;

        for(let i = 0; i < this.length; i++){
            this.samples[i] = 0x0;
        }
        this.attenuate = attenuate;
    }

    step(x : number){
        let index = this.index;
        let delta = x - this.samples[index];
        let attenuate = this.attenuate;
        let avg = 0x0;
        
        this.sum += delta;
        this.samples[index] = x;

        if(++this.index > (this.length - 1)){
            this.index = 0x0;
        }

        avg = this.sum / this.length;

        return (x - avg) * (1/attenuate);
    }
}

class FirFilter {
    buffer : number[] = [];
    index : number = 0x0;
    offset : number = 0x0;
    length : number = 0x0;
    m : number = 0x0;
    h : number[] = [];

    constructor(h : number[], m : number){

        this.length = h.length * m;
        this.index = 0;
        this.m = m;
        this.h = h;

        let buffer = this.buffer;
        for(let i = 0; i < this.length * 2; i++){
            buffer[i] = 0x0;
        }
    }

    step(samples : number []){

        let index = this.index;
        let buffer = this.buffer;
        let length = this.length;
        let m = this.m;
        let h = this.h;
        let y = 0x0;
        let i = 0x0;

        this.offset = length - (index * m);
        let sub = buffer.slice(this.offset);
        this.index = (index + 1) % (length / m - 1);
        for( i = m -1; i >=0; i--){
            buffer[this.offset + i] = samples[i];
        }
        for( i = 0; i < h.length; i++){
            y += h[i] * sub[i];
        }
        for( i = 0; i < m; i++){
            buffer[this.offset + length - m + i] = buffer[this.offset + i];
        }

      
        return y;

    }

}

class AudioDriver {

    host : PSG49;
    device : AudioContext;
    context: ScriptProcessorNode;
    frequency : number = 0x0;
    filter : (BiasFilter | any)[];
    bias : number;

    constructor(host : PSG49){

        this.device = new AudioContext();
        let device = this.device;
      
        this.filter = [
            
            new BiasFilter(1024, 1.25),
            new BiasFilter(1024, 1.25),

            device.createBiquadFilter(),
            device.createBiquadFilter()
        ];

        let filter = this.filter;

        filter[2].type = "lowshelf";
        filter[2].frequency.value = 1500;
        filter[2].gain.value = 3.35;

        filter[3].type = "lowpass";
        filter[3].frequency.value = 10000;
        filter[3].Q.value = 1;
        
        this.frequency = device.sampleRate;
        this.context = device.createScriptProcessor(4096,0,2);
        this.context.onaudioprocess = this.update;
        this.context.connect(filter[2]);

        filter[2].connect(filter[3]);
        filter[3].connect(device.destination);

        this.host = host;
        this.bias = 1/100;

    }

    update = function(ev : AudioProcessingEvent){
    
        let ch0 = ev.outputBuffer.getChannelData(0);
        let ch1 = ev.outputBuffer.getChannelData(1);
      
        let host = this.host;
        let filter = this.filter;
        let bias = this.bias;
        let output = [0, 0];
        let port = [0, 0];

        for(let i = 0; i < ch0.length; i++){
    
            output = host.step();
          
            port[0] = filter[0].step(output[0]);
            port[1] = filter[1].step(output[1]);

            ch0[i] = bias + port[0];
            ch1[i] = bias + port[1];
        }

    }.bind(this);
}

enum PSG49_LUT{

    A_FINE, A_COARSE,
    B_FINE, B_COARSE,
    C_FINE, C_COARSE,
    NOISE_PERIOD,
    MIXER,
    A_VOL,
    B_VOL,
    C_VOL,
    ENV_FINE,
    ENV_COARSE,
    ENV_SHAPE
    
}
class PSG49 {

    clock : Oscillator;
    driver : AudioDriver;
    interrupt : Interrupt;
    channels: Channel[];
    envelope : Envelope;
    fir : FirFilter[];
    oversample : number;
    interpolate : Interpolator[];
    dac : number[];

    // main register file
    register = {

        A_FINE: 0x0,  A_COARSE: 0x0,
        B_FINE: 0x0,  B_COARSE: 0x0,
        C_FINE: 0x0,  C_COARSE: 0x0,

        NOISE_PERIOD: 0x0,

        MIXER: 0x0,

        A_VOL: 0x0,
        B_VOL: 0x0,
        C_VOL: 0x0,

        ENV_FINE: 0x0, ENV_COARSE: 0x0,
        ENV_SHAPE: 0x0,

        PORT_A: 0x0,
        PORT_B: 0x0
    }

    constructor(clockRate : number, intRate : number){

        this.driver = new AudioDriver(this);
        this.interpolate = [ 
            new Interpolator(),
            new Interpolator()
        ];

        let m = 8;
        this.fir = [
            new FirFilter(FIR, m),
            new FirFilter(FIR, m)
        ];
        this.oversample = m;
    
        this.clock = {
            frequency : clockRate,
            scale : 1/16 * 2,
            cycle : 0,
            step : 0
        };

        this.interrupt = {
            frequency : intRate,
            cycle : 0,
            routine : ()=>{}
        }

        this.envelope = {
            strobe : 0,
            transient : 0,
            step : 0,
            shape : 0,
            offset : 0,
            stub : []

        } as Envelope;
  
        this.channels = [ 
            {
                counter : 0x0,
                pan : 0.5,
            } as Channel, 
            {
                counter : 0x0,
                pan : 0.5
            } as Channel,
            {
                counter : 0x0,
                pan : 0.5
            } as Channel,
            
            {counter : 0x0} as Channel
        ]

        // seed noise generator
        this.channels[3].port = 0x1;

        this.dac = [];

        this.build_dac(1.3, 40);
        this.build_adsr();

    }

    build_dac(decay : number, shift : number){
        let dac = this.dac;
        let y = Math.sqrt(decay);
        let z = shift/31;

        dac[0] = 0;
        dac[1] = 0;

        for(let i = 2; i <= 31; i++){
            dac[i] = 1.0 / Math.pow(y, shift - (z*i) );
        }
    }

    init_test(){
        let r = this.register;

        r.MIXER = 0b00111000;
        r.A_VOL = 15;
        //r.A_VOL |= 0x10;
        r.A_FINE = 200;
        //r.ENV_COARSE = 200;
    }


    build_adsr(){
        let envelope = this.envelope;
        let stub = envelope.stub;

        stub.reset = (ev : Envelope)=>{
            let strobe = ev.strobe;
            let transient = ev.transient;
   
            switch(ev.offset){

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
                case 0x2: ev.step = 31;
                    break;
                case 0x3: ev.step = 0;
                    break; 
            }
    }

        stub.grow = (ev: Envelope)=>{

            if(++ ev.step > 31 ){
                ev.strobe ^= 1;
                ev.stub.reset(ev);
            }

        };

        stub.decay = (ev : Envelope)=>{
            if(-- ev.step < 0){
                ev.strobe ^= 1;
                ev.stub.reset(ev);
            }

        };

        stub.hold = (ev : Envelope)=>{ }

        envelope.matrix = [

            [stub.decay, stub.hold],
            [stub.grow,  stub.hold],
            [stub.decay, stub.decay],
            [stub.grow,  stub.grow],
            [stub.decay, stub.grow],
            [stub.grow,  stub.decay],
            
        ];
    }
    
    clamp(){
        let r = this.register;

        r.A_FINE &= 0xff; r.B_FINE &= 0xff;
        r.C_FINE &= 0xff; r.ENV_FINE &= 0xff;

        r.A_COARSE &= 0xf; r.B_COARSE &=0xf;
        r.C_COARSE &= 0xf; r.ENV_COARSE &= 0xff;
        
        r.A_VOL &= 0x1f; r.B_VOL &= 0x1f;
        r.C_VOL &= 0x1f;

        r.NOISE_PERIOD &= 0x1f; r.MIXER &= 0x3f;
        r.ENV_SHAPE &= 0xff; 
        
    }

    map(){

        let r = this.register;
        let channel = this.channels;
        let ev = this.envelope;

        let toneMask = [0x1,0x2,0x4];
        let noiseMask = [0x8,0x10,0x20];

        this.clamp();
        // update tone channel period
        channel[0].period = r.A_FINE | r.A_COARSE << 8;
        channel[1].period = r.B_FINE | r.B_COARSE << 8;
        channel[2].period = r.C_FINE | r.C_COARSE << 8;

        channel[0].volume = r.A_VOL & 0xf;
        channel[1].volume = r.B_VOL & 0xf;
        channel[2].volume = r.C_VOL & 0xf;

        for(let i = 0; i < 3; i++){
            let bit = r.MIXER & toneMask[i];
            channel[i].tone = bit ? 1 : 0;
        }

        for(let i = 0; i < 3; i++){
            let bit = r.MIXER & noiseMask[i];
            channel[i].noise = bit ? 1 : 0;
        }

        channel[0].envelope = (r.A_VOL & 0x10) ? 0 : 1;
        channel[1].envelope = (r.B_VOL & 0x10) ? 0 : 1;
        channel[2].envelope = (r.C_VOL & 0x10) ? 0 : 1;
        
         // update channel noise period
        channel[3].period = r.NOISE_PERIOD << 1;

        ev.period = r.ENV_FINE | r.ENV_COARSE << 8;
        ev.shape = r.ENV_SHAPE;

         
        switch(ev.shape){
            
            case 0x0: case 0x1:
            case 0x2: case 0x3:
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
            case 0x4: case 0x5:
            case 0x6: case 0x7:
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
            if(ev.shape != ev.store){
                ev.strobe = 0x0;    
                ev.counter = 0x0;
                ev.stub.reset(ev);

            }
            ev.store = r.ENV_SHAPE;
    }

    step_tone(index : number){

        let ch = this.channels[index % 3];
        let step = this.clock.step;
        let port = ch.port;

        let period = (ch.period == 0x0) ? 0x1 : ch.period;
        ch.counter += step;
        
        if(ch.counter >= period){
            // 50% duty cycle
            port ^= 0x1;
            ch.port = port;
            ch.counter = 0x0;
        }

        return ch.port;

    }

    step_envelope(){

        let step = this.clock.step;
        let ev = this.envelope;
         
        ev.counter += step;

        if(ev.counter >= ev.period){
            ev.matrix[ev.offset][ev.strobe](ev);
            ev.counter = 0x0;
        }

        return (ev.step);
    }

    step_noise(){

        let ch = this.channels[3];
        let step = this.clock.step;
        let port = ch.port;
        let period = (ch.period == 0) ? 1 : ch.period;

        ch.counter += step;
  
        if(ch.counter >= period){
            port ^= (((port & 1) ^ ((port >> 3) & 1)) << 17);
            port >>= 1;
            ch.port = port;
            ch.counter = 0x0;
        }
        return ch.port & 1;
    }
    
    step_mixer(){

        let port = 0x0;
        let output = [0.0, 0.0];
        let index = 0x0;
        let ch = this.channels;
        let noise = this.step_noise();
        let step = this.step_envelope();

        for(let i = 0; i < 3; i++){
            
            let volume = ch[i].volume;
            let pan = ch[i].pan;

            port = this.step_tone(i) | ch[i].tone;
            port &= noise | ch[i].noise;
            
            // todo: add dac volume table
            //bit*=toneChannel[i].volume;
            // mix each channel
        
            if(!ch[i].envelope){
                index = step;
            }else{

                index = volume * 2 + 1;
            }

            port *= this.dac[index];

            // clamp pan levels 
            // distortion over +1 ?

            if(pan > 0.9){
                pan = 0.9;
            }
            else if (pan < 0.1){
                pan = 0.1;
            }

            output[0] += port * (1- pan) ;
            output[1] += port * (pan) ;

        }
   
        return output;
    }

    step(){
        
        let output = [];
        let clockStep = 0;
        let intStep = 0;
        let i = 0x0;

        let clock = this.clock;
        let driver = this.driver;
        let fir = this.fir;
        let oversample = this.oversample;
        let interpolate = this.interpolate;
        let interrupt = this.interrupt;

        let x = clock.scale;
        let fc = clock.frequency;
        let fd = driver.frequency;
        let fi = interrupt.frequency;

        clockStep = (fc * x) / fd;
        clock.step = clockStep / oversample;

        intStep = fi/ fd;

        // add number of clock cycle

        interrupt.cycle += intStep;
        // do we have clock cycles to process?
        // if so process single clock cycle

        let sample_left = [];
        let sample_right = [];

        for(i = 0; i < oversample; i++){
            sample_left[i] = 0x0;
            sample_right[i] = 0x0;
        }

        if(interrupt.cycle > 1){
            interrupt.cycle--;
            interrupt.routine();
            interrupt.cycle = 0;
        }
        for(let i = 0; i < oversample; i++){
        clock.cycle += clockStep;

        if(clock.cycle > 1){
            clock.cycle--;

          this.map();
          output = this.step_mixer();

          interpolate[0].step(output[0]);
          interpolate[1].step(output[1]);
          
        }
        sample_left[i] = interpolate[0].cubic(0.5);
        sample_right[i] = interpolate[1].cubic(0.5);
 

    }
    output[0] = fir[0].step(sample_left);
    output[1] = fir[1].step(sample_right);
    
        return output;
    }

}
