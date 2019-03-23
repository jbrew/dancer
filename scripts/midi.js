let audioCtx, oscArray;
var userInputNotes = [];
var listenerObjects = [];

function onMIDISuccess(midiAccess) {

  console.log(midiAccess.inputs);
  console.log(midiAccess.outputs);

  for (let input of midiAccess.inputs.values())
    input.onmidimessage = getMIDIMessage;
}

function onMIDIFailure() {
    console.log('Could not access your MIDI devices.');
}


function getMIDIMessage(midiMessage) {
    //console.log(midiMessage.data);
    let onOffCode = midiMessage.data[0];
    let pitchCode = midiMessage.data[1];
    let velocity = midiMessage.data[2]
    let t = audioCtx.currentTime;

    let noteInfo = codeInfo(pitchCode);
    //console.log(noteInfo);
    // console.log(onOffCode + ", " + noteInfo.name);
    keysDown[noteInfo.name] = (onOffCode == 144) ? true : false;

    if(typeof(pitchCode) != "undefined" &&  onOffCode == 144){

    	var note = {'code': pitchCode, 'velocity': velocity, 'time': t};

      	userInputNotes.push(note);
    }

    playNote(pitchCode, velocity);
}


function playNote(code, velocity){

  // set the pitch
  var gn = oscArray[code.toString()]['gainNode'];

  if(velocity > 0){
    //console.log('observed', velocity/127);
    gn.gain.value = velocity/127;
    //console.log(velocity);
  }
  else {
    gn.gain.value = 0;
  }

  for (var i in listenerObjects) {
    var listenerObj = listenerObjects[i];
    listenerObj.updateState(userInputNotes);
  }

}

// a function that takes a midi pitch code, and returns the frequency, octave info, and note name
function codeInfo(code) {

    let notes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]

    let semitoneRatio = 2 ** (1/12);
    let baselineFrequency = 27.5;
    let baselineCode = 21; // MIDI code for lowest note on keyboard
    let stepsAboveBaseline = code - baselineCode;

    let thisOctave = Math.floor(code/12);
    let thisNoteName = notes[code%12];
    let thisFrequency = baselineFrequency * (semitoneRatio ** stepsAboveBaseline);

    let roundedFrequency = Math.floor(thisFrequency * 10000)/10000

    return {
      name: thisNoteName,
      frequency: roundedFrequency,
      octave: thisOctave
    }
}


function enableKeyboardKeys(){

    console.log("enabling!");

    // translate keyboard key code to midi pitch code
    let keyboardPitchCodes = {
      "65": 60,
      "83": 62,
      "68": 64,
      "70": 65,
      "71": 67,
      "72": 69,
      "74": 71,
      "75": 72,
      "87": 61,
      "69": 63,
      "84": 66,
      "89": 68,
      "85": 70
    }

    document.querySelector("body").addEventListener("keydown", function(e){

      let keyboardCode = e.keyCode;
      let pitchCode = keyboardPitchCodes[keyboardCode];
      let noteInfo = codeInfo(pitchCode);
      
      // ensure that our keydown doesn't keep triggering the same note again and again
      if(typeof(pitchCode) != "undefined" && !keysDown[noteInfo.name].playing){
          getMIDIMessage({data: [144, pitchCode, 100]});
      }
    });

    document.querySelector("body").addEventListener("keyup", function(e){
      let keyboardCode = e.keyCode;
      let pitchCode = keyboardPitchCodes[keyboardCode];
      if(typeof(pitchCode) != "undefined"){
          getMIDIMessage({data: [128, pitchCode, 0]});
      }
    });
}


function initAudio(){
  // for legacy browsers
  console.log('init!')
  const AudioContext = window.AudioContext || window.webkitAudioContext;

  // create a new audio context
  audioCtx = new AudioContext();
  let startTime = audioCtx.currentTime;

  // create an array with as many oscillators as there are MIDI notes
  oscArray = {};
  for (let i=0; i<127; i++) {
    var newOsc = audioCtx.createOscillator();
    var newGainNode = audioCtx.createGain();
    newOsc.type = 'sawtooth';
    newOsc.start();
    newOsc.connect(newGainNode);

    let noteInfo = codeInfo(i);
    var freq = noteInfo['frequency'];
    newOsc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    newGainNode.connect(audioCtx.destination);
    newGainNode.gain.value = 0; // all notes initialized at silence
    oscArray[i.toString()] = {'osc': newOsc, 'gainNode': newGainNode}
  }


  // enable key listeners
  console.log('a')
  enableKeyboardKeys();
}


let keysDown = {
  "C": false,
  "D": false,
  "E": false,
  "F": false,
  "G": false,
  "A": false,
  "B": false,
  "C": false,
  "Db": false,
  "Eb": false,
  "Gb": false,
  "Ab": false,
  "Bb": false
}

export default function initMidi(_listenerObjects) {
  console.log('initMidi');
  let userInputNotes = [];
  listenerObjects = _listenerObjects;

  if (navigator.requestMIDIAccess) {
      console.log('This browser supports WebMIDI!');

  } else {
      console.log('WebMIDI is not supported in this browser.');
  }

  navigator.requestMIDIAccess()
      .then(onMIDISuccess, onMIDIFailure);

  document.getElementById('start-button').addEventListener('click', function() {
    console.log('user clicked!')
    initAudio();
  });
  
}

