function setupAudio() {
    document.querySelector('.play-button').addEventListener('click', async () => {
        await Tone.start()
        console.log('audio is ready')
    });
}

function sequencer() {
    const metronomeSound = new Tone.Player("audio/metronome-me.mp3").toMaster();
    metronomeSound.volume.value = -15;

    const bpmInput = document.querySelector('.bpm-input');
    let bpm = 130;
    Tone.Transport.bpm.value = bpm;
    bpmInput.addEventListener('input', () => {
        bpm = bpmInput.value;
        Tone.Transport.bpm.value = bpm;
    });
    let index = 0;

    Tone.Transport.scheduleRepeat(repeat, '4n');
    // Tone.Transport.start();
    let metronomePlaying = false;

    function repeat() {
        let step = index % 4;
        let metronomedots = document.querySelectorAll('.metronome-dot');
        metronomedots.forEach(metronomedot => {
            // console.log(metronomedot);
            metronomedot.classList.remove('current-dot');
        });
        let currentMetronomeDot = document.querySelector(`.metronome .metronome-dot:nth-child(${step + 1}`);
        currentMetronomeDot.classList.add('current-dot');
        metronomeSound.start();
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
    loopButton = document.querySelector('.loop-button');
    loopButton.addEventListener('click', () => {
        loopButton.classList.toggle('loop-button-recording');
    })
}

setupAudio();
sequencer();
looper();