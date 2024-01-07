// // if 條件防止你重複運行這塊代碼。
// if (
//     typeof(this.flag_webaudio_test) == "undefined" 
//     || !this.flag_webaudio_test
// ) {  
//     this.flag_webaudio_test = true;
//     const AudioContext = window.AudioContext || window.webkitAudioContext; // 跨瀏覽器
//     const audioCtx = new AudioContext();
//     const oscillator = audioCtx.createOscillator();
//     const gainNode = audioCtx.createGain(); 
//     oscillator.type = 'sine';         // 正弦波
//     oscillator.frequency.value = 440; // A4 頻率
//     oscillator.connect(gainNode);
//     oscillator.start();               // 啟動音源
//     gainNode.connect(audioCtx.destination);

//     this.gainNode = gainNode;
//     this.audioCtx = audioCtx;
// }

function playNote(frequency, time, start_time=0) {

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();

    const gainNode = audioCtx.createGain(); //to get smooth rise/fall
    gainNode.connect(audioCtx.destination)

    const oscillator = audioCtx.createOscillator();
    // const gainNode = audioCtx.createGain(); 
    oscillator.type = 'sine' 
    oscillator.frequency.value = frequency; 
    oscillator.connect(gainNode);
    
    const end_time = start_time + time
    const trf = (end_time - start_time) / 12
    gainNode.gain.exponentialRampToValueAtTime(1,  start_time + trf);
    gainNode.gain.exponentialRampToValueAtTime(0.1, end_time + trf);
    oscillator.start(start_time);
    oscillator.stop(end_time);
}

function playNotes(notes) {
	var sum = 0;
	for (var i = 0; i < notes.length; ++i) {
		var note = notes[i][0];
		var time = notes[i][1];
		playNote(note, time, sum);
		sum += time; 
	}
}