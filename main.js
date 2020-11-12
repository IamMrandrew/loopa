function setupAudio() {
    
    document.querySelector('.play-button').addEventListener('click', async () => {
        await Tone.start();
        console.log('audio is ready');
    });

}

let recording = new Tone.Player("");

function sequencer() {
    const metronomeSound = new Tone.Player("audio/metronome.mp3").toDestination();
    metronomeSound.volume.value = -10;

    const bpmInput = document.querySelector('.bpm-input');
    let bpm = 130;
    Tone.Transport.bpm.value = bpm;
    bpmInput.addEventListener('input', () => {
        if (bpm > 5000) {
            console.log("bpm too high");
        } else {
            bpm = bpmInput.value;
        }
            
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

    recording = new Tone.Player(url).toDestination();

}



// setupRecorder();
setupAudio();

sequencer();
looper();
