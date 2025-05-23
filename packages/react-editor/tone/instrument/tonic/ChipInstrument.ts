import * as Tone from 'tone'
import { TonicToneInstrument } from '../ToneInstrument';

/**
 * 芯片
 */
export class ChipInstrument extends TonicToneInstrument {
	create() {
		return new Tone.PolySynth(Tone.Synth, {
			volume: -1
		})
	}
}
