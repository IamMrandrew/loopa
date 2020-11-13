function setupAudio() {
    document.querySelector('.play-button').addEventListener('click', async () => {
        await Tone.start();
        console.log('audio is ready');
    });
}

// Index for Recorded Audio Files Array
let recordingIndex = 0;

// Array for Recorded Audio Files
let recordings = [];
recordings[0] = new Tone.Player("");
recordings[1] = new Tone.Player("");
recordings[2] = new Tone.Player("");

// Array for the Record Time (Ticks away from the start beat of Transport) of Recorded Audio Files
let recordingsTime = [];
recordingsTime[0] = 0.0;
recordingsTime[1] = 0.0;
recordingsTime[2] = 0.0;

// Array for loopBars Input for Individual Looper
let loopBarsIndex = 0;
let loopBars = [1, 1, 1];

// Array of Volume Control for Individual Looper
let volNodes = [];

function transport() {
    // Initial Metronome Audio File to Player
    const metronomeSound = new Tone.Player("audio/metronome.mp3").toDestination();
    metronomeSound.volume.value = -10;

    // Initial bpm value
    let bpm = 60;
    Tone.Transport.bpm.value = bpm;

    // Get BPM Input
    const bpmInput = document.querySelector('.bpm-input');
    bpmInput.addEventListener('input', () => {
        if (bpm > 5000) {
            console.log("bpm too high");
        } else {
            bpm = bpmInput.value;
        }
            
        Tone.Transport.bpm.value = bpm;
    });

    // Bpm Mute Button
    const bpmMute = document.querySelector('.bpm-mute i');
    let bpmMuted = false;
    bpmMute.addEventListener('click', () => {
        if (!bpmMuted)
            bpmMuted = true;
        else
            bpmMuted = false;
        bpmMute.classList.toggle('bpm-mute-disable');
    });

    // Get the value of how many bars it will loop once for Individual Looper
    const loopBarsInputs = document.querySelectorAll('.loop-bars-input');
    loopBarsInputs.forEach((loopBarsInput, index) => {
        loopBars[index] = loopBarsInput.value * 4;

        loopBarsInput.addEventListener('input', () => {
            loopBars[index] = loopBarsInput.value * 4;
        });
    });

    // Loop Bars Control (Increase bars)
    const loopBarsIncs = document.querySelectorAll('.loop-bars-inc');
    loopBarsIncs.forEach((loopBarsInc, index) => {
        loopBarsInc.addEventListener('click', () => {
            loopBarsInputs[index].value++;
            loopBars[index] = loopBarsInputs[index].value * 4;
        });
    });

    // Loop Bars Control (Increase bars)
    const loopBarsDecs = document.querySelectorAll('.loop-bars-dec');
    loopBarsDecs.forEach((loopBarsDec, index) => {
        loopBarsDec.addEventListener('click', () => {
            loopBarsInputs[index].value--;
            loopBars[index] = loopBarsInputs[index].value * 4;
        });
    });

    // Volume Control for Individual Looper
    const volControls = document.querySelectorAll('.vol-control');
    volControls.forEach((volControl, index) => {
        volNodes[index] = new Tone.Volume(-20).toDestination();
        volControl.addEventListener('input', () => {
            volNodes[index].volume.value = volControl.value;
        });
    });

    // Tone.Transport
    let index = 0;

    Tone.Transport.scheduleRepeat(repeat, '4n');

    // Status of metronome (Initial)
    let metronomePlaying = false;

    function repeat(time) {
        // Metronome back to first beat 
        let step = index % 4;

        // Metronome Dots Visualize
        let metronomedots = document.querySelectorAll('.metronome-dot');
        metronomedots.forEach(metronomedot => {
            metronomedot.classList.remove('current-dot');
        });
        let currentMetronomeDot = document.querySelector(`.metronome .metronome-dot:nth-child(${step + 1}`);
        currentMetronomeDot.classList.add('current-dot');

        // Mute Control for Metronome
        if (!bpmMuted)
            metronomeSound.start();

        // Calc the Loop Bars
        let looper1Step = index % loopBars[0];
        let looper2Step = index % loopBars[1];
        let looper3Step = index % loopBars[2];
        
        if (looper1Step == 0) {
            try {
                recordings[0].chain(volNodes[0], Tone.Destination).start("+" + recordingsTime[0] % (Tone.Ticks("4n").toTicks() * 4) + "i");
            } catch {
                console.log("Require input recordings for Loop 1");
            }
        }
        if (looper2Step == 0) {
            try {
                recordings[1].chain(volNodes[1], Tone.Destination).start("+" + recordingsTime[1] % (Tone.Ticks("4n").toTicks() * 4) + "i");
            } catch {
                console.log("Require input recordings for Loop 2");
            }
        }
        if (looper3Step == 0) {
            try {
                recordings[2].chain(volNodes[2], Tone.Destination).start("+" + recordingsTime[2] % (Tone.Ticks("4n").toTicks() * 4) + "i");
            } catch {
                console.log("Require input recordings for Loop 3");
            }
        }
        
        // Step Transport.scheduleRepeat
        index++;
    }

    // Transport start/stop Control (Play Button)
    playButton = document.querySelector('.play-button');
    playButton.addEventListener('click', () => {
        if (metronomePlaying) {
            Tone.Transport.stop();
            recordings[0].stop();
            recordings[1].stop();
            recordings[2].stop();
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
    let isRecording = false;
    loopButtons = document.querySelectorAll('.loop-button');
    loopButtons.forEach((loopButton, index) => {
        loopButton.addEventListener('click', () => {
            recordingIndex = index;
            if (!isRecording) {
                startRecording();
                isRecording = true;
                recordingsTime[index] = Tone.Transport.ticks; 
            }
            else {
                stopRecording();
                isRecording = false;
            }
                
            loopButton.classList.toggle('loop-button-recording');
            
        });
    });

}


// Recorderjs

//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;


var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var input; 							//MediaStreamAudioSourceNode we'll be recording


// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //audio context to help us record


function startRecording() {
    console.log("recordButton clicked");

    /*
        Simple constraints object, for more advanced audio features see
        https://addpipe.com/blog/audio-constraints-getusermedia/
    */
    
    var constraints = { audio: true, video:false }


    /*
        Disable the record button until we get a success or fail from getUserMedia() 
    */


    /*
        We're using the standard promise based getUserMedia() 
        https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    */


    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        console.log("getUserMedia() success, stream created, initializing Recorder.js ...");


        /*
            create an audio context after getUserMedia is called
            sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
            the sampleRate defaults to the one set in your OS for your playback device

        */
        audioContext = new AudioContext();

        /*  assign to gumStream for later use  */
        gumStream = stream;
        
        /* use the stream */
        input = audioContext.createMediaStreamSource(stream);


        /* 
            Create the Recorder object and configure to record mono sound (1 channel)
            Recording 2 channels  will double the file size
        */
        rec = new Recorder(input,{numChannels:1})


        //start the recording process
        rec.record()


        console.log("Recording started");


    }).catch(function(err) {
        //enable the record button if getUserMedia() fails
        console.log("error");
    });
}


function pauseRecording(){
    console.log("pauseButton clicked rec.recording=",rec.recording );
    if (rec.recording){
        //pause
        rec.stop();
    }else{
        //resume
        rec.record()

    }
}


function stopRecording() {
    console.log("stopButton clicked");

    //tell the recorder to stop the recording
    rec.stop();

    //stop microphone access
    gumStream.getAudioTracks()[0].stop();


    //create the wav blob and pass it on to createDownloadLink
    rec.exportWAV(createDownloadLink);
}


function createDownloadLink(blob) {
    var url = URL.createObjectURL(blob);
    var au = document.createElement('audio');
    var li = document.createElement('li');
    var link = document.createElement('a');

    recordings[recordingIndex] = new Tone.Player(url);

}

function sliderControl() {
    let sliders = document.querySelectorAll(".vol-control");
    sliders.forEach((slider) => {
        slider.addEventListener('input', () => {
            let x = ((slider.value - slider.min) / (slider.max-slider.min)) * 100;
            let color = `linear-gradient(90deg, #DEFFE7 ${x}%,  #FFFFFF ${x}%)`;
            slider.style.background = color;
        });
    });
}

new Glider(document.querySelector('.glider'), {
    // slidesToShow: 'auto',
    // itemWidth: 320,
    slidesToShow: 1,
    draggable: true,
    dots: '.dots',
    dragVelocity: 1,
    responsive: [
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 2,
                draggable: true,
            }
        }, {
            breakpoint: 1024,
            settings: {
                slidesToShow: 3,
                draggable: false,
            }
        }, {
            breakpoint: 1440,
            settings: {
                slidesToShow: 4,
                draggable: false,
            }
        },{
            breakpoint: 1700,
            settings: {
                slidesToShow: 5,
                draggable: false,
            }
        }
    ]
});

setupAudio();
transport();
sliderControl();
looper();
