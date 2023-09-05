FYMReader = function(buffer) {
    var psgDump = pako.inflate(new Uint8Array(buffer));
    var ptr = 0;
    var frame = 0;

    function getInt() {
        var r = 0;
        for(var i = 0; i < 4; i++) r += psgDump[ptr++] << (8*i);
        return r;
    }

    function getStr() {
        var c, r = '';
        while(c = psgDump[ptr++]) r += String.fromCharCode(c);
        return r;
    }

    var offset = getInt();

    var frameCount = getInt();
    this.getFrameCount = function() {
        return frameCount;
    }

    var loopFrame = getInt();
    this.getLoopFrame = function() {
        return loopFrame;
    }

    var clockRate = getInt();
    this.getClockRate = function() {
        return clockRate;
    }

    var frameRate = getInt();
    this.getFrameRate = function() {
        return frameRate;
    }

    var trackName = getStr();
    this.getTrackName = function() {
        return trackName;
    }

    var authorName = getStr();
    this.getAuthorName = function() {
        return authorName;
    }

    var loopCount = 0;
    this.getLoopCount = function() {
        return loopCount;
    }

    this.getNextFrame = function() {
        var regs = [];
        for(var r = 0; r < 14; r++) {
            regs[r] = psgDump[r * frameCount + frame + offset];
        }
        if(++frame >= frameCount) {
            loopCount++;
            frame = loopFrame;
        }
        return regs;
    }
}
