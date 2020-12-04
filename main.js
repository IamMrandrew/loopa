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


// Looper status
let recordingStatus = [false];
let recordedStatus = [false]


// Array for Recorded Audio Files, Index for Recording Audio Files Array (Pass to recorderjs)
let recordings = [];
let recordingsIndex = 0;

// Array for the Record Time (Ticks away from the start beat of Transport) of Recorded Audio Files
let recordingsOffset = [];


// Array for loopBars Input for Individual Looper
let loopBars = [];
// Array to count how many bars now between last played for Individual Looper
let loopBarsCount = [];

// Array for Circular progress bars for Individual Looper
let loopBarsCountProgress = [];
let loopProgressIndex = [];
// HTML Elements of Circular progress bars
let loopButtonsProgress;

// Mute status for Individual Looper
let looperMuted = []


// Array of Effects/ Filters for Individual Looper
let volNodes = [];
let panNodes = [];
let revNodes = [];
let LPFNodes = [];

// Get Looper HTML element
const looperHTML = document.querySelector('.glider-item');
let newLooper = document.createElement('div');
newLooper.classList.add('glider-item');
newLooper.innerHTML = looperHTML.innerHTML;


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
        let looperStep = [];

        for (i = 0; i < glider.slides.length - 1; i++) {
            looperStep[i] = loopProgressIndex[i] % 4;

            if (looperStep[i] == 0) {
                loopBarsCountProgress[i] %= loopBars[i];
                loopBarsCountProgress[i]++;
            }
        }

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

            if (step == 0 ) {
            for (i = 0; i < glider.slides.length - 1; i++) {
                loopBarsCount[i]++;
                loopBarsCount[i] %= loopBars[i];
            }

            for (i = 0; i < glider.slides.length - 1; i++ ){
                try {
                    if (loopBarsCount[i] == 0)
                        recordings[i].chain(LPFNodes[i],revNodes[i], panNodes[i], volNodes[i], Tone.Destination).start("+" + recordingsOffset[i] % (Tone.Ticks("4n").toTicks() * 4) + "i");  
                } catch {
                    console.log('%c   Require Input Recordings for Loop  ' + (i + 1) + '  ', "color: #FFFFFF; font-weight: 600; background-color: #4B4B4B");
                } 
                
            }
        }        

        loopButtonsProgress.forEach((loopButtonProgress, index) => {
            const radius = loopButtonProgress.r.baseVal.value;
            const circumference = radius * 2 * Math.PI;
            loopButtonProgress.style.strokeDasharray = circumference;        
            
            // 0 - 100
            if (recordedStatus[index]) {
                if(recordingStatus[index]) {
                    loopButtonProgress.style.stroke = '#F17474';
                } else {
                    loopButtonProgress.style.stroke = '#DEFFE7';
                }
                setProgress(((loopBarsCountProgress[index]-1) * 4 + (looperStep[index]+1)) * (1/(4*loopBars[index])) * 100)
                // console.log((loopBarsCountProgress[index]))
            }
            function setProgress(percent) {
                loopButtonProgress.style.strokeDashoffset = circumference - (percent / 100) * circumference;       
            }

        })
        
        index++;

        for (i = 0; i < glider.slides.length - 1; i++) {
            loopProgressIndex[i]++;
        }
    }

    // Transport start/stop Control (Play Button)
    playButton = document.querySelector('.play-button');
    playButton.addEventListener('click', () => {
        if (metronomePlaying) {
            Tone.Transport.stop();
            index = 0;

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
    recordingsOffset[glider.slides.length - 2] = 0.0;
    loopBars[glider.slides.length - 2] = 1;
    loopBarsCount[glider.slides.length - 2] = 0;
    loopProgressIndex[glider.slides.length - 2] =  0;
    recordingStatus[glider.slides.length - 2] = false;
    recordedStatus[glider.slides.length - 2] = false;

    // Get the value of how many bars it will loop once for Individual Looper
    const loopBarsInputs = document.querySelectorAll('.loop-bars-input');
    loopBarsInputs.forEach((loopBarsInput, index) => {
        if (index >= glider.slides.length - 2) {
            loopBars[index] = loopBarsInput.value;
            loopBarsInput.addEventListener('input', () => {
                loopBars[index] = loopBarsInput.value;
            })
        }
    })

    // Loop Bars Control (Increase bars)
    const loopBarsIncs = document.querySelectorAll('.loop-bars-inc');
    loopBarsIncs.forEach((loopBarsInc, index) => {
        if (index >= glider.slides.length - 2) {
            loopBarsInc.addEventListener('click', inc = () => {
                loopBarsInputs[index].value++;
                loopBars[index] = loopBarsInputs[index].value;
            })
        }
    })


    // Loop Bars Control (Increase bars)
    const loopBarsDecs = document.querySelectorAll('.loop-bars-dec');
    loopBarsDecs.forEach((loopBarsDec, index) => {
        if (index >= glider.slides.length - 2) {
            loopBarsDec.addEventListener('click', () => {
                loopBarsInputs[index].value--;
                loopBars[index] = loopBarsInputs[index].value;
            })
        }
    })

    // Volume Control for Individual Looper
    const volControls = document.querySelectorAll('.vol-control');
    volControls.forEach((volControl, index) => {
        if (index >= glider.slides.length - 2) {
            volNodes[index] = new Tone.Volume(-20);
            volControl.addEventListener('input', () => {            
                volNodes[index].volume.value = volControl.value;
                if(volControl.value == -30){
                    volNodes[index].mute=true;
                }
            })
        }
        
    })

    // Panner Control for Individual Looper
    const panControls = document.querySelectorAll('.pan-control');
    panControls.forEach((panControl, index) => {
        if (index >= glider.slides.length - 2) {
            panNodes[index] = new Tone.Panner(0);
            panControl.addEventListener('input', () => {            
                panNodes[index].pan.value = panControl.value;
            });
        }
    });

    // Reverb Control for Individual Looper
    const revControls = document.querySelectorAll('.REV-control');
    const revControls2 = document.querySelectorAll('.REV-control-2');
    const revControls3 = document.querySelectorAll('.REV-control-3');
    const revToggles = document.querySelectorAll('.REV-toggle');
    revControls.forEach((revControl, index) => {
        if (index >= glider.slides.length - 2) {
            revNodes[index] = new Tone.Reverb();
            revNodes[index].wet.value = 0;
            revControl.addEventListener('input', () => {            
                revNodes[index].wet.value = revControl.value;
                revToggles[index].checked = true; 
            });
        }
    });

    revControls2.forEach((revControl2, index) => {
        if (index >= glider.slides.length - 2) {
            revControl2.addEventListener('input', () => {            
                revNodes[index].preDelay = revControl2.value;
                revToggles[index].checked = true; 
            });
        }
    });

    revControls3.forEach((revControl3, index) => {
        if (index >= glider.slides.length - 2) {
            revControl3.addEventListener('input', () => {            
                revNodes[index].decay = revControl3.value;                
                revToggles[index].checked = true; 
            });
        }
    });

    revToggles.forEach((revToggle, index) => {
        if (index >= glider.slides.length - 2) {
            revToggle.addEventListener('change', () => {                   
                if (!revToggle.checked) {
                    revNodes[index].wet.value = 0;
                } else {
                    revNodes[index].wet.value = revControls[index].value;
                    revNodes[index].preDelay = revControls2[index].value;
                    revNodes[index].decay = revControls3[index].value;
                }        
            });
        }
    });

    // LPF Control for Individual Looper
    const LPFControls = document.querySelectorAll('.LPF-control');
    const LPFToggles = document.querySelectorAll('.LPF-toggle');

    LPFControls.forEach((LPFControl, index) => {
        if (index >= glider.slides.length - 2) {
            LPFNodes[index] = new Tone.Filter(20000, "lowpass", -48);
            LPFControl.addEventListener('input', () => {            
                LPFNodes[index].frequency.value = LPFControl.value;
                LPFToggles[index].checked = true;                
            });
        }
    });
    
    LPFToggles.forEach((LPFToggle, index) => {
        if (index >= glider.slides.length - 2) {
            LPFToggle.addEventListener('change', () => {                   
                if (!LPFToggle.checked) {
                    LPFNodes[index].frequency.rampTo(20000, 0.1);
                } else {
                    LPFNodes[index].frequency.value = LPFControls[index].value;
                }        
            });
        }
    });

    const loopButtons = document.querySelectorAll('.loop-button');
    loopButtons.forEach((loopButton, index) => {
        if (index >= glider.slides.length - 2) {
            loopButton.addEventListener('click', () => {
                recordingsIndex = index;
                if (!recordingStatus[index]) {
                    startRecording();
                    recordingStatus[index] = true;
                    recordedStatus[index] = true;   
                    recordingsOffset[index] = Tone.Transport.ticks; 

                    //Back to zero now
                    loopBarsCount[index] = 0;
                    loopProgressIndex[index] = 0;
                    loopBarsCountProgress[index] = 0;
                }
                else {
                    stopRecording();
                    recordingStatus[index] = false;      
                               
                }
                    
                loopButton.classList.toggle('loop-button-recording'); 
            })
        }
    })

    const looperMutes = document.querySelectorAll('.looper-mute i');
    looperMutes.forEach((looperMute, index) => {
        if (index >= glider.slides.length - 2) {
            looperMuted[index] = false;
            looperMute.addEventListener('click', () => {
                if (!looperMuted[index]){
                    volNodes[index].mute=true;
                    looperMuted[index] = true;
                }                    
                else {
                    looperMuted[index] = false;
                    volNodes[index].mute=false;
                }                    
                looperMute.classList.toggle('looper-mute-disable');
            });
        }
    })
    

    loopButtonsProgress = document.querySelectorAll('.loop-button-progress');
    loopButtonsProgress.forEach((loopButtonProgress, index) => {
        if (index >= glider.slides.length - 2) {
            const radius = loopButtonProgress.r.baseVal.value;
            const circumference = radius * 2 * Math.PI;
            loopButtonProgress.style.strokeDasharray = circumference; 
            loopButtonProgress.style.strokeDashoffset = circumference;       
        }
    })    
}

////////////////////////////////////
//                                //
//         Add Looper             //
//                                //
////////////////////////////////////

function addLooper() {
    let addLooper = document.querySelector('.add-looper');
    let gliderTrack = document.querySelector('.glider-track');

    addLooper.addEventListener('click', () => {   
        newLooper = newLooper.cloneNode(true);

        // ChildNodes[1] because the first node is occupied by spaces
        newLooper.childNodes[1].childNodes[1].childNodes[1].innerHTML = `<h2>Loop ${glider.slides.length + 1 - 1}</h2>` +
        '<div class="looper-mute">' +
            '<i class="fas fa-volume-down"></i>' +
        '</div>';

        gliderTrack.insertBefore(newLooper, gliderTrack.childNodes[glider.slides.length - 1]);
        glider.refresh(true);

        sliderControl();
        effects();
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
        let x = ((slider.value - slider.min) / (slider.max-slider.min)) * 100;
        let color = `linear-gradient(90deg, #DEFFE7 ${x}%,  #FFFFFF ${x}%)`;
        slider.style.background = color;
    });
}

function navControl() {
    const burger = document.querySelector('.burger');
    const navList = document.querySelector('.nav-list');
    burger.addEventListener('click', () => {
        navList.classList.toggle('active');
        burger.classList.toggle('active');
    })

    const instructionPopup = document.querySelector('.instruction-popup');
    const instructionToggle = document.querySelector('.instruction-toggle');
    const instructionClose = document.querySelector('.instruction-close');
    const instructionDismiss = document.querySelector('.instruction-dismiss');
    const main = document.querySelector('.main');

    instructionToggle.addEventListener('click', () => {
        instructionPopup.classList.add('active');
        navList.classList.toggle('active');
        burger.classList.toggle('active');
        main.classList.add('blur');
    })
    instructionClose.addEventListener('click', () => {
        instructionPopup.classList.remove('active');
        main.classList.remove('blur');
    })
    instructionDismiss.addEventListener('click', () => {
        instructionPopup.classList.remove('active');
        main.classList.remove('blur');
    })

}

////////////////////////////////////
//                                //
//        Effects/ Filters        //
//                                //
////////////////////////////////////

function effects() {
    const looper = document.querySelectorAll('.looper')
    const LPFs = document.querySelectorAll('.LPF');
    const LPFPopups = document.querySelectorAll('.LPF-popup');
    const closeLPFPopups = document.querySelectorAll('.close-LPF-popup');

    LPFs.forEach((LPF, index) => {
        if (index >= glider.slides.length - 2) {
            LPF.addEventListener('click', () => {
                LPFPopups[index].classList.add('active');
                looper[index].classList.add('blur');
            })
        }
    })

    closeLPFPopups.forEach((closeLPFPopup, index) => {
        if (index >= glider.slides.length - 2) {
            closeLPFPopup.addEventListener('click', () => {
                LPFPopups[index].classList.remove('active');
                looper[index].classList.remove('blur');
            })
        }
    })

    const REVs = document.querySelectorAll('.REV');
    const REVPopups = document.querySelectorAll('.REV-popup');
    const closeREVPopups = document.querySelectorAll('.close-REV-popup');

    REVs.forEach((REV, index) => {
        if (index >= glider.slides.length - 2) {
            REV.addEventListener('click', () => {
                REVPopups[index].classList.add('active');
                looper[index].classList.add('blur');
            })
        }
    })

    closeREVPopups.forEach((closeREVPopup, index) => {
        if (index >= glider.slides.length - 2) {
            closeREVPopup.addEventListener('click', () => {
                REVPopups[index].classList.remove('active');
                looper[index].classList.remove('blur');
            })
        }
    })
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

        console.log('%c   Recording Started   ', "color: #FFFFFF; font-weight: 600; background-color: #94AFA6");

    }).catch(function(err) {
        //enable the record button if getUserMedia() fails
        console.error("error");
    });
}

function stopRecording() {
    console.log('%c   Stop Button Clicked   ', "color: #FFFFFF; font-weight: 600; background-color: #F17474");

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

    recordings[recordingsIndex] = new Tone.Player(url);
}



setupAudio();
transport();
sliderControl();
looper();
addLooper();
effects();
navControl();