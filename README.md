# Loopa

Loopa is my first web app using [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) and the popular framework [Tone.js](https://github.com/Tonejs/Tone.js/). As the name implies, LOOPA is a LOOPER! This course project is in collaboration with @WadeHo

Here is the screenshot of my web app. You can access it through [https://loopa.netlify.app](https://loopa.netlify.app)
![截圖 2020-12-03 19 33 22](https://user-images.githubusercontent.com/62586450/101012876-69bc8700-359e-11eb-8991-4df59a019776.png)

## Approaches
- Audio Loopstation

Audio input by user streamed media like microphone, or audio from computers

- Effects/ Filters

Effects and filters as node between the source and destination
- Cross Platform/ User Experience

## Features
- Unlimited Loopers
- Effects and filters for individual loopers

## How the loops works
### Tone.Transport
I used the Transport timing clock provided by Tone.js as the fundamental timing of my loopstation.

```
function transport() {
	Const metronomeSound = new Tone.Player(“audio/metronome.mp3”).toDestination() 
Tone.Transport.bpm.value = bpm;
let index = 0;
Tone.Transport.scheduleRepeat(repeat, '4n');
function repeat(time) { ...   
		Let step = index % 4
		metronomeSound.start();
		index++;
	}
}
```

## How the effects works
### Componenets and Effects Nodes
Tone.js provided volume, panning nodes, and also effects, filters nodes. I used array to store them for individual loopers and dont connect to destination first (Will chain it with Tone.Destination later)

### Chain
We can use chain for connecting the nodes in series, and also the Tone.Destination
```
function createDownloadLink(blob) {
recordings[recordingsIndex] = new Tone.Player(url);
}
function transport() {
	recordings[i].chain(LPFNodes[i],revNodes[i], panNodes[i], volNodes[i],, Tone.Destination).start(“+” + recordingsOffset[i] %
(Tone.Ticks(“4n”).toTicks () * 4) + “i” );
}
```
    
## Recorder.js
I used the old repository/ library called [Recorder.js](https://github.com/mattdiamond/Recorderjs) for building audio context and getting user's input as audio source. 
```
navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
  audioContext = new AudioContext();
  gumStream = stream;
  input = audioContext.createMediaStreamSource(stream);
}
```
Storing the result audio file with Tone.Player into array for individual loopers
```
function createDownloadLink(blob) {
   var url = URL.createObjectURL(blob);
   recordings[recordingsIndex] = new Tone.Player(url);
}
```

### Glider.js
To mention, I also used [Glider.js](https://github.com/NickPiscitelli/Glider.js/) as carousel for responsive design of my loopers. It is a really good tools for me to build slidering cards efficently.

![ezgif com-gif-maker](https://user-images.githubusercontent.com/62586450/101012769-44c81400-359e-11eb-9155-20925d2c90c7.gif)

## Challenges
- Looping audio while start recording at any position of the main transport
- Synchronize between loopers


## Current Workaround
When it hit the first beat, playback the audio with offset to the first beat 
```
startRecording();
recordingStatus[index] = true;
recordingsOffset[index] = Tone.Transport.ticks;
```

```
If (step == 0) {
recordings[i].chain(volNodes[i], LPFNodes[i],revNodes[i]).start("+" + recordingsOffset[i] % (Tone.Ticks("4n").toTicks() * 4) + "i"); 
}

```

## Something I cannot fix right now
- Seamless loop
- Take one cycle to playback after recorded
- Delay :(((
