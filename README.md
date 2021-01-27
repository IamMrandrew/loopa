<img src="https://user-images.githubusercontent.com/62586450/105276905-5496c880-5bdd-11eb-9b9f-1a0a1cea4f0f.png" width="128" height="128">

# Loopa
[![Netlify Status](https://api.netlify.com/api/v1/badges/747980a3-60ba-4e6a-a444-2b6dbf6d942a/deploy-status)](https://app.netlify.com/sites/loopa/deploys)

This project aimed at developing a web app about Audio Loopstation with Effects and Filters. People can use it to create their music with streamed media as input.

The project is inspired by the lectures about [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API), Audio Filters and Effects. Our idea is to provide platforms for users to record audio in multiple tracks for looping and combining them into music. With Loopa, we can provide a cross platform and user-friendly experience.

Loopa is created by HTML, CSS and Javascript. Some with popular framework like [Tone.js](https://github.com/Tonejs/Tone.js/), and libraries like [Recorder.js](https://github.com/mattdiamond/Recorderjs), [RecordRTC.js](https://github.com/muaz-khan/RecordRTC) and [Glider.js](https://github.com/NickPiscitelli/Glider.js) are imported for web audio and user interface. 

This course project is in collaboration with @WadeHo. Check out [Loopa](https://loopa.laporatory.com) to start creating your music.

![Loopa Mockup](https://user-images.githubusercontent.com/62586450/102717217-d9ab6b00-431b-11eb-834c-76494b8cd47c.png)
Fig 1.1,  Showcase of Loopa


## How we get Inspired
There are few similar apps on the market. For instance, Loopy HD: Looper. 

However, we mixed their features together and provided real time audio mixing on the browser, to make it clear, it is cross-platform supported. We also provided an user-friendly design which is also a neat and clean design for Loopa. 

## Features
- Unlimited Loopers
- Effects and filters
- Cross-Platform
- Master output to .wav files

## Methodologies
There is an instruction guide inside the menu of our app to showcase how our app works. Here, we will focus on the part that is related to the functions that manipulate the web audio.

### Tone.js
We make use of Tone.js as the web audio framework. It is a relatively comprehensive framework of web audio so that I can use it for different purposes in our project.
Player
In this project, we utilized the Player provided in Tone.js to play the audio files.
```
const metronomeSound = new Tone.Player("audio/metronome.mp3").toDestination();
```

#### Transport
Also, we have used the Transport for timing musical events for the loopers. For the metronome, There is a repeating function called repeat. This function will be called every quarter-note. Index will keep increasing per beats and modulus by 4 to reset to zero. 
```
function transport() {
  const metronomeSound = new Tone.Player("audio/metronome.mp3").toDestination() 
  Tone.Transport.bpm.value = bpm;
  let index = 0;
  Tone.Transport.scheduleRepeat(repeat, '4n');
  function repeat(time) {   
    let step = index % 4;
    metronomeSound.start();
    index++;
  }
}
```

#### Audio Nodes, Effects
As you can see, we provided options for users to control the filters and effects etc… The principle behind was adding nodes between the source and the destination. Tone.js provided different components for that. 

Here, we take Volume as an example. We first get all the HTML elements of the range inputs in all the loopers. Then we create the audio node( Tone.Volume ) and the event listener to change the value when users input for each of them when they are newly created. 

```
function setupMainLooper() {
    // Volume Control for Individual Looper
    const volControls = document.querySelectorAll('.main .vol-control');
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
}
```

#### Chain
After we created different audio nodes for, we have to connect them between the audio source and the destination. Chain let us connect them in series. We first connect the Source -> Filters -> Effects -> Other Audio Nodes -> Destination

```
recordings[i].chain(LPFNodes[i], HPFNodes[i], revNodes[i], panNodes[i], volNodes[i], Tone.Destination).start("+" + (recordingsOffset[i] % (Tone.Ticks("4n").toTicks() * 4) - 40) + "i");  
```

### Audio Recording
We make use of the library Recorder.js for getting user’s media (e.g microphone, virtual/ physical instrument audio input). Then we grab the url of blob created after recording and store in the Player in recordings array, which store the recorded audio to loop for each loopers

```
navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
audioContext = new AudioContext();
gumStream = stream;
input = audioContext.createMediaStreamSource(stream);
}
function createDownloadLink(blob) {
   var url = URL.createObjectURL(blob);
   recordings[recordingsIndex] = new Tone.Player(url);
}
```

Due to the lack of maintenance and functionality of Recorder.js, we also used another library called RecordRTC.js. We use it for the recording on the master output ( The output of loopers ) and output to a .wav file.

```
const audio = document.querySelector(".master-download");
const audioContextforMainRecord = Tone.context;
const dest = audioContextforMainRecord.createMediaStreamDestination();
let masterRecorder = RecordRTC(dest.stream, {
    type: 'audio',
    mimeType: 'audio/wav',
    recorderType: StereoAudioRecorder,
    disableLogs: true
})
```

Chain them to the destination we created for RecordRTC
recordings[i].chain(LPFNodes[i], HPFNodes[i], revNodes[i], panNodes[i], volNodes[i], dest);

```
function stopMasterRecording() {
    masterRecorder.stopRecording( ()=> {
        let blob = masterRecorder.getBlob();
        audio.href = URL.createObjectURL(blob)
        audio.download = "loopa_master.wav"
    });
}
```

### Looping Algorithm
Here we are going to introduce the most important part of our program, the looping. We tried many algorithms for this and eventually we came up with a working solution. However, we believed that it is not the best solution but it is what we can achieve in this limited time.

As there is a timing unit called Ticks in Tone.js when Transport is running, we try to save the offset ticks in transport when we start recording, and check every ticks for an interval of 4 bars. And we playback the audio when it matches.

```
setInterval(() => {
  if (Math.abs(Tone.Transport.ticks % (Tone.Ticks("4n").toTicks() * looperBars[i]) - recordingsTime[i] % (Tone.Ticks("4n").toTicks() * 4)) < 3)
    try {
      recordings[i].start();
    } catch {
      console.log("Require input recordings for Loop 1");
    }
```

However, this method requires too many calls in every tick and it causes the browser to start lagging and we think it is not a good method and there are some accuracy issues too. So, we end up changed to another approach that is using the delay start time of start() of Player.

When the first beat of a bar is hitted (step = 0), we will perform a check for every loopers if it reaches its loopbars (loopbars means the interval of bars that it will start looping again, e.g. for looping 4 beats, the interval of bars is one )

Just like the previous approach, we will save the offset of ticks. But this time, we will make the audio to start playing with that offset modulus the ticks of a bar (-40 for fixing the delay) 
"+" + (recordingsOffset[i] % (Tone.Ticks("4n").toTicks() * 4) - 40) + "i"

Here is the complete code of the corresponding section.
```
if (step == 0 ) {
  // Counting the remaining loops for each loopers
  for (i = 0; i < glider.slides.length - 1; i++) {
    loopBarsCount[i]++;
    loopBarsCount[i] %= loopBars[i];
  }

  for (i = 0; i < glider.slides.length - 1; i++ ){
    try {
      if (loopBarsCount[i] == 0) {
        recordings[i].chain(LPFNodes[i], HPFNodes[i], revNodes[i], panNodes[i], volNodes[i], Tone.Destination).start("+" + (recordingsOffset[i] % (Tone.Ticks("4n").toTicks() * 4) - 40) + "i");  
      }                  
    }                
  }
}
```
### User Interface Design
This part is not really related to the course so we will just briefly introduce our approach on this. We used a Javascript library called glider.js for the carousel. It allowed multiple loopers to stay/ hide on the screen responsively when the screen is shrunk.

![loopa-screenshot-with-gliderjs](https://user-images.githubusercontent.com/62586450/102717537-f6e13900-431d-11eb-8be6-c665f62bb041.png)
Fig 1.3, Screenshot of Loopa with glider.js 

We also allowed users to create as many loopers as they want. Therefore, we cannot hard code the HTML and Javascript for the loopers. We have to create a new set of elements when a new looper is created.

