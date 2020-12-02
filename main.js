function setupAudio() {
    let audioReady = false;
    document.querySelector('.play-button').addEventListener('click', async () => {
        if (!audioReady) {
            await Tone.start();
            console.log('%c   Audio Ready   ', "color: #FFFFFF; font-weight: 600; background-color: #94AFA6");
            audioReady = true;
        }
    });
}

////////////////////////////////////
//                                //
//          Initialization        //
//                                //
////////////////////////////////////


// Recording status
let isRecording = false;

// Index for Recorded Audio Files Array
let recordingIndex = 0;

// Array for Recorded Audio Files
let recordings = [];

// Array for the Record Time (Ticks away from the start beat of Transport) of Recorded Audio Files
let recordingsTime = [];

// Array for loopBars Input for Individual Looper
let loopBars = [];

// Array to count how many bars now between last played for Individual Looper
let loopBarsCount = [];

// Array of Volume Control for Individual Looper
let volNodes = [];


////////////////////////////////////
//                                //
//          Main Transport        //
//                                //
////////////////////////////////////

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
        if (bpmInput.value > 500) {
            console.warn('%c   BPM Too High   ', "color: #FFFFFF; font-weight: 600; background-color: #f8423f");
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

        for (i = 0; i < glider.slides.length - 1; i++) {
            loopBarsCount[i] %= loopBars[i];
        }

        if (step == 0 ) {
            for (i = 0; i < glider.slides.length - 1; i++ ){
                try {
                    if (loopBarsCount[i] == 0)
                        recordings[i].chain(volNodes[i], Tone.Destination).start("+" + recordingsTime[i] % (Tone.Ticks("4n").toTicks() * 4) + "i");
                } catch {
                    console.log('%c  Require Input Recordings for Loop ' + (i + 1) + '  ', "color: #FFFFFF; font-weight: 600; background-color: #4B4B4B");
                } 
                loopBarsCount[i]++;
            }
        }

        index++;
    }

    // Transport start/stop Control (Play Button)
    playButton = document.querySelector('.play-button');
    playButton.addEventListener('click', () => {
        if (metronomePlaying) {
            Tone.Transport.stop();

            for (i = 0; i < glider.slides.length - 1; i++) {
                recordings[i].stop();
            }

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

////////////////////////////////////
//                                //
//             Looper             //
//                                //
////////////////////////////////////

function looper() {
    // Initialize recordings and loopBars item
    recordings[glider.slides.length - 2] = new Tone.Player("");
    recordingsTime[glider.slides.length - 2] = 0.0;
    loopBars[glider.slides.length - 2] = 1;
    loopBarsCount[glider.slides.length - 2] = 0;

    // Get the value of how many bars it will loop once for Individual Looper
    const loopBarsInputs = document.querySelectorAll('.loop-bars-input');
    loopBarsInputs.forEach((loopBarsInput, index) => {
        if (index >= glider.slides.length - 2) {
            loopBars[index] = loopBarsInput.value;
            loopBarsInput.addEventListener('input', () => {
                loopBars[index] = loopBarsInput.value;
            });
        }
    });

    // Loop Bars Control (Increase bars)
    const loopBarsIncs = document.querySelectorAll('.loop-bars-inc');
    loopBarsIncs.forEach((loopBarsInc, index) => {
        if (index >= glider.slides.length - 2) {
            loopBarsInc.addEventListener('click', inc = () => {
                loopBarsInputs[index].value++;
                loopBars[index] = loopBarsInputs[index].value;
            });
        }
    });


    // Loop Bars Control (Increase bars)
    const loopBarsDecs = document.querySelectorAll('.loop-bars-dec');
    loopBarsDecs.forEach((loopBarsDec, index) => {
        if (index >= glider.slides.length - 2) {
            loopBarsDec.addEventListener('click', () => {
                loopBarsInputs[index].value--;
                loopBars[index] = loopBarsInputs[index].value;
            });
        }
    });

    // Volume Control for Individual Looper
    const volControls = document.querySelectorAll('.vol-control');
    volControls.forEach((volControl, index) => {
        if (index >= glider.slides.length - 2) {
            volNodes[index] = new Tone.Volume(-20).toDestination();
            volControl.addEventListener('input', () => {            
                volNodes[index].volume.value = volControl.value;
            });
        }
    });

    const loopButtons = document.querySelectorAll('.loop-button');
    loopButtons.forEach((loopButton, index) => {
        if (index >= glider.slides.length - 2) {
            loopButton.addEventListener('click', () => {
                recordingIndex = index;
                if (!isRecording) {
                    startRecording();
                    isRecording = true;
                    recordingsTime[index] = Tone.Transport.ticks; 

                    // Loop Bars Count (Start on 1 as the loopBarsCount will increase from 0 to 1 in that moment)
                    loopBarsCount[index] = 1;
                }
                else {
                    stopRecording();
                    isRecording = false;
                }
                    
                loopButton.classList.toggle('loop-button-recording');
                
            });
        }
    });

}

////////////////////////////////////
//                                //
//         Add Looper             //
//                                //
////////////////////////////////////

function addLooper() {
    let addLooper = document.querySelector('.add-looper');
    let gliderTrack = document.querySelector('.glider-track');
    // looperGliderItem = looperGliderItem.cloneNode(true); // use for grab from html

    addLooper.addEventListener('click', () => {      
        let newLooper = document.querySelector('.glider-item');
        newLooper = newLooper.cloneNode(true);

        // ChildNodes[1] because the first node is occupied by spaces
        newLooper.childNodes[1].childNodes[1].childNodes[1].innerHTML = `<h2>Loop ${glider.slides.length + 1 - 1}</h2>`;

        gliderTrack.insertBefore(newLooper, gliderTrack.childNodes[glider.slides.length - 1]);
        glider.refresh(true);

        sliderControl();
        looper();
    });
}

////////////////////////////////////
//                                //
//           CSS Control          //
//                                //
////////////////////////////////////

function sliderControl() {
    let sliders = document.querySelectorAll(".slider-control");
    sliders.forEach((slider) => {
        slider.addEventListener('input', () => {
            let x = ((slider.value - slider.min) / (slider.max-slider.min)) * 100;
            let color = `linear-gradient(90deg, #DEFFE7 ${x}%,  #FFFFFF ${x}%)`;
            slider.style.background = color;
        });
    });
}

let glider = new Glider(document.querySelector('.glider'), {
    // slidesToShow: 'auto',
    // itemWidth: 320,
    slidesToShow: 1,
    dots: '.dots',
    draggable: false,
    dragVelocity: 1,
    responsive: [
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 2,
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

////////////////////////////////////
//                                //
//           Recorderjs           //
//                                //
////////////////////////////////////

//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var input; 							//MediaStreamAudioSourceNode we'll be recording

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //audio context to help us record

function startRecording() {
    console.log('%c   Record Button Clicked   ', "color: #FFFFFF; font-weight: 600; background-color: #94AFA6");

    
    var constraints = { audio: true, video:false }

    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        console.log('%c   Success getUserMedia()         \n   Stream created                 \n   Initializing Recorder.js ...   ', "color: #FFFFFF; font-weight: 600; background-color: #94AFA6");

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

        console.log('%c   Recording started   ', "color: #FFFFFF; font-weight: 600; background-color: #94AFA6");

    }).catch(function(err) {
        //enable the record button if getUserMedia() fails
        console.error("error");
    });
}

function stopRecording() {
    console.log('%c  Stop Button Clicked  ', "color: #FFFFFF; font-weight: 600; background-color: #F17474");

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



setupAudio();
transport();
sliderControl();
looper();
addLooper();
