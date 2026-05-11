import type { FrequencyType, Waveform } from '../../shared/types';

export interface AudioConfig {
  frequency: number;
  type: FrequencyType;
  waveform: Waveform;
}

/**
 * Web Audio API HTML kaynağı üretir.
 * WebView içinde yüklenir, binaural beat ve isochronic tone sentezi yapar.
 * React Native → WebView iletişimi window.ReactNativeWebView.postMessage kullanır.
 */
export function buildAudioEngineHtml(config: AudioConfig): string {
  // Binaural beat: sol kulağa base freq, sağ kulağa base + beat freq
  const BASE_CARRIER = 200;
  const binauralLeft = BASE_CARRIER;
  const binauralRight = BASE_CARRIER + config.frequency;

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body { margin: 0; background: transparent; }
  </style>
</head>
<body>
<script>
  let audioCtx = null;
  let nodes = [];

  function initCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function stopAll() {
    nodes.forEach(n => { try { n.stop(); } catch(e) {} });
    nodes = [];
  }

  function startBinaural(leftHz, rightHz, waveform) {
    initCtx();
    stopAll();

    const merger = audioCtx.createChannelMerger(2);
    merger.connect(audioCtx.destination);

    const leftOsc = audioCtx.createOscillator();
    leftOsc.type = waveform;
    leftOsc.frequency.setValueAtTime(leftHz, audioCtx.currentTime);
    const leftGain = audioCtx.createGain();
    leftGain.gain.value = 0.4;
    leftOsc.connect(leftGain);
    leftGain.connect(merger, 0, 0);
    leftOsc.start();
    nodes.push(leftOsc);

    const rightOsc = audioCtx.createOscillator();
    rightOsc.type = waveform;
    rightOsc.frequency.setValueAtTime(rightHz, audioCtx.currentTime);
    const rightGain = audioCtx.createGain();
    rightGain.gain.value = 0.4;
    rightOsc.connect(rightGain);
    rightGain.connect(merger, 0, 1);
    rightOsc.start();
    nodes.push(rightOsc);
  }

  function startIsochronic(hz, waveform) {
    initCtx();
    stopAll();

    const osc = audioCtx.createOscillator();
    osc.type = waveform;
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0;
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    nodes.push(osc);

    // Isochronic: hz hızında gain kesme
    const period = 1 / hz;
    const halfPeriod = period / 2;
    let t = audioCtx.currentTime;
    for (let i = 0; i < hz * 600; i++) {
      gainNode.gain.setValueAtTime(0.5, t);
      gainNode.gain.setValueAtTime(0, t + halfPeriod);
      t += period;
    }
  }

  function startSolfeggio(hz) {
    initCtx();
    stopAll();
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(hz, audioCtx.currentTime);
    const gain = audioCtx.createGain();
    gain.gain.value = 0.3;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    nodes.push(osc);
  }

  document.addEventListener('message', handleMsg);
  window.addEventListener('message', handleMsg);

  function handleMsg(e) {
    let cmd;
    try { cmd = JSON.parse(e.data); } catch(err) { return; }

    if (cmd.type === 'START') {
      const { frequency, freqType, waveform } = cmd;
      if (freqType === 'binaural_beat') {
        startBinaural(${binauralLeft}, ${binauralRight}, waveform || 'sine');
      } else if (freqType === 'isochronic') {
        startIsochronic(frequency, waveform || 'sine');
      } else {
        startSolfeggio(frequency);
      }
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage('PLAYING');
    } else if (cmd.type === 'PAUSE' || cmd.type === 'STOP') {
      stopAll();
      if (audioCtx) { audioCtx.suspend(); }
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage('STOPPED');
    }
  }

  window.ReactNativeWebView && window.ReactNativeWebView.postMessage('READY');
</script>
</body>
</html>`;
}
