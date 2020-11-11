function setupAudio() {
    
    document.querySelector('.play-button').addEventListener('click', async () => {
        await Tone.start();
        audio_context.resume();
        console.log('audio is ready');
    });

}
let recording = new Tone.Player("");

function sequencer() {
    // const metronomeSound = new Tone.Player("audio/metronome-me.mp3").toMaster();
    const metronomeSound = new Tone.Player("audio/metronome.mp3").toDestination();
    metronomeSound.volume.value = -10;

    const bpmInput = document.querySelector('.bpm-input');
    let bpm = 130;
    Tone.Transport.bpm.value = bpm;
    bpmInput.addEventListener('input', () => {
        bpm = bpmInput.value;
        Tone.Transport.bpm.value = bpm;
    });

    const bpmMute = document.querySelector('.bpm-mute i');
    let bpmMuted = false;
    bpmMute.addEventListener('click', () => {
        if (!bpmMuted)
            bpmMuted = true;
        else
            bpmMuted = false;
        bpmMute.classList.toggle('bpm-mute-disable');
    });

    let index = 0;

    Tone.Transport.scheduleRepeat(repeat, '4n');
    let metronomePlaying = false;

    function repeat() {
        let step = index % 4;
        let metronomedots = document.querySelectorAll('.metronome-dot');
        metronomedots.forEach(metronomedot => {
            metronomedot.classList.remove('current-dot');
        });
        let currentMetronomeDot = document.querySelector(`.metronome .metronome-dot:nth-child(${step + 1}`);
        currentMetronomeDot.classList.add('current-dot');

        if (!bpmMuted)
            metronomeSound.start();
        if (step == 0)
        try {
            recording.start();
        } catch {
            console.log("Require input recordings");
        }
            
        index++;

    }

    playButton = document.querySelector('.play-button');
    playButton.addEventListener('click', () => {
        if (metronomePlaying) {
            Tone.Transport.stop();
            playButton.classList.remove('fa-pause');
            playButton.classList.add('fa-play');
            metronomePlaying = false;
        }
        else {
            Tone.Transport.start();
            playButton.classList.remove('fa-play');
            playButton.classList.add('fa-pause');
            metronomePlaying = true;
        }
    });
}


function looper() {
    let recording = false;
    loopButton = document.querySelector('.loop-button');
    loopButton.addEventListener('click', () => {
        if (!recording) {
            startRecording();
            recording = true;
        }
        else {
            stopRecording();
            recording = false;
        }
            
        loopButton.classList.toggle('loop-button-recording');
        
    });
}


//Recorderjs

var audio_context;
var recorder;

function startUserMedia(stream) {
    var input = audio_context.createMediaStreamSource(stream);
    console.log('Media stream created.');

    // Uncomment if you want the audio to feedback directly
    //input.connect(audio_context.destination);
    //console.log('Input connected to audio context destination.');
    
    recorder = new Recorder(input);
    console.log('Recorder initialised.');
}

function startRecording() {
    recorder && recorder.record();
    console.log('Recording...');
}

function stopRecording() {
    recorder && recorder.stop();
    console.log('Stopped recording.');
    
    // create WAV download link using audio data blob
    createDownloadLink();
    
    recorder.clear();
}

var url;

function createDownloadLink() {
    recorder && recorder.exportWAV(function(blob) {
    // var url = URL.createObjectURL(blob);
    url = URL.createObjectURL(blob);
    // var li = document.createElement('li');
    // var au = document.createElement('audio');
    // var hf = document.createElement('a');
    
    // au.controls = true;
    // au.src = url;
    // hf.href = url;
    // hf.download = new Date().toISOString() + '.wav';
    // hf.innerHTML = hf.download;
    // li.appendChild(au);
    // li.appendChild(hf);
    // recordingslist.appendChild(li);

    console.log(url);
    recording = new Tone.Player(url).toDestination();
    });
}


function setupRecorder() {
    window.onload = function init() {
        try {
        // webkit shim
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
        window.URL = window.URL || window.webkitURL;
        
        audio_context = new AudioContext;
        console.log('Audio context set up.');
        console.log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
        } catch (e) {
        alert('No web audio support in this browser!');
        }
        
        navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
        console.log('No live audio input: ' + e);
        });
    };
}


setupRecorder();
setupAudio();

sequencer();
looper();
