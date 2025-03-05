import * as Tone from 'tone'
import { TonicToneInstrument } from '../ToneInstrument';

/**
 * 短笛
 */
export class PiccoloInstrument extends TonicToneInstrument {
	create() {
		return new Tone.PolySynth(Tone.MonoSynth, {
			volume: -11,
			oscillator: {
				type: "square8"
			},
			envelope: {
				attack: 0.12,
				decay: 0.0,
				sustain: 0.4,
				release: 0.8,
			},
			filterEnvelope: {
				attack: 0.001,
				decay: 0.7,
				sustain: 0.1,
				release: 0.8,
				baseFrequency: 300,
				octaves: 4
			}
		})
	}
}
