let audioCtx;
let noiseNode;
let gainNode;
let isPlaying = false;

export function playWind() {
    if (isPlaying) return;

    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    filter.Q.value = 1;

    // LFO for wind gusts
    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15; // Slow variation

    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 300; // Variation amount

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.01; // Start quiet

    // Fade in
    gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 2);

    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    noiseNode.start();
    isPlaying = true;

    // Store nodes to stop later
    noiseNode.stopLFO = () => lfo.stop();
}

export function pauseWind() {
    if (!isPlaying || !noiseNode) return;

    // Fade out
    gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 1);

    setTimeout(() => {
        if (noiseNode) {
            noiseNode.stop();
            if (noiseNode.stopLFO) noiseNode.stopLFO();
            noiseNode.disconnect();
            noiseNode = null;
        }
        isPlaying = false;
    }, 1000);
}
