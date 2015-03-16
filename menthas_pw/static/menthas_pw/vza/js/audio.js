function AudioLib() {
    this._defaults = {
        soundcloud_id: '589f1798161df231169e187ccb057bbb'
    };
    this._viz = null;
    this.current_track = null;
    this.current_track_id = null;
}

_.extend(AudioLib.prototype, {
    init: function(options) {
        if (_.isUndefined(options))
            options = {};
        this.options = _.defaults(options, this._defaults);

        soundManager.usePolicyFile = true;
        soundManager.url = swf_url ? swf_url : './js/soundmanager2/swf/';
        soundManager.flashVersion = 9;
        soundManager.useFlashBlock = false;
        soundManager.debugFlash = false;
        soundManager.debugMode = false;
        soundManager.useHighPerformance = true;
        soundManager.wmode = 'transparent';
        soundManager.useFastPolling = true;
        soundManager.usePeakData = true;
        soundManager.useWaveformData = true;
        soundManager.useEqData = true;
        soundManager.waitForWindowLoad = true;
        soundManager.flash9Options.useEQData = true;
        soundManager.flash9Options.useWaveformData = true;
        soundManager.html5Only = false;
        soundManager.preferFlash = true;

        var _this = this;
        soundManager.onready(function() {
            SC.initialize({
              client_id: _this.options.soundcloud_id,
            });
        });
    },

    setVisualization: function(viz) {
        this._viz = viz;
    },

    startVisualization: function(track) {
        if (_.isNull(this._viz)) {
            console.log("A visualization library must be set first");
        }
        var _this = this;
        SC.stream("/tracks/"+track, {
            volume: 80,
            whileplaying: function() {
                _this._viz.render(this.waveformData, this.eqData);
            }
        }, function(sound){
            _this.current_track = sound;
            _this.current_track_id = track;
            sound.play();
        });
    }
});
