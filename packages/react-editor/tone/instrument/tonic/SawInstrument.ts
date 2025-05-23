import * as Tone from 'tone'
import { TonicToneInstrument } from '../ToneInstrument';

/**
 * 锯齿
 */
export class SawInstrument extends TonicToneInstrument {
	create() {
		return new Tone.PolySynth(Tone.Synth, {
			volume: -2,
			oscillator: {
				type: "amtriangle",
				harmonicity: 1,
				modulationType: "sine"
			},
			envelope: {
				attackCurve: "exponential",
				attack: 0.05,
				decay: 0.1,
				sustain: 0.2,
				release: 1.5,
			},
			portamento: 0.05
		})
	}
}
