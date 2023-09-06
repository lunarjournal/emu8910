
    var song;
    var emu8910 = new PSG49(YM_CLOCK_ZX, 50);

    Array.prototype.shuffle = function() {
      var m = this.length, t, i;
      while(m) {
        i = Math.floor(Math.random() * m--);
        t = this[m];
        this[m] = this[i];
        this[i] = t;
      }
      return this;
    }

    var songs = [
        "01_scalesmannmisfire.fym"
    ].shuffle();

    var currentSong = 0;

    loadAndPlay = function() {
        emu8910.driver.device.resume()
        var oReq = new XMLHttpRequest();
        oReq.open('GET', 'music/' + songs[currentSong], true);
        oReq.responseType = 'arraybuffer';
        oReq.onload = function(e) {
            if(oReq.response) play(oReq.response);
        }
        oReq.send();
    }

    updateState = function() {
        var r = song.getNextFrame();
        emu8910.register.A_FINE = r[0]
        emu8910.register.A_COARSE = r[1];

        emu8910.register.B_FINE = r[2];
        emu8910.register.B_COARSE = r[3];

        emu8910.register.C_FINE = r[4];
        emu8910.register.C_COARSE = r[5];
        emu8910.register.NOISE_PERIOD = r[6];

        emu8910.register.MIXER = r[7];

        emu8910.register.A_VOL = r[8];
        emu8910.register.B_VOL = r[9];
        emu8910.register.C_VOL = r[10];

        emu8910.register.ENV_FINE = r[11];
        emu8910.register.ENV_COARSE = r[12];

        if (r[13] != 0xff) {
            emu8910.register.ENV_SHAPE = r[13];
        }
    }

    play = function(fym) {
        song = new FYMReader(fym);
        emu8910.interrupt.routine = updateState;
        emu8910.clock.frequency = song.getClockRate()
        emu8910.interrupt.frequency = song.getFrameRate()
    }

    document.addEventListener('click', loadAndPlay, false);
    document.addEventListener('touchend', loadAndPlay, false);
