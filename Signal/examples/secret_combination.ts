/// <reference path="../Signal.d.ts" />

import {Signal} from '../Signal';
import {PacketedSignal} from '../lib/PacketedSignal';
import {LiftedSignal} from '../lib/LiftedSignal';
import {SampledSignal} from '../lib/SampledSignal';
import {createTestChamber,createButton} from './common';
import {TickSignal} from '../lib/TickSignal';


export default function test(mountAt:HTMLElement=document.body){
	const magicSeq = 'abbaba';
	const seqLen = magicSeq.length;
	const maxTime = 5000;

	const clicks = Signal();
	const btnA = createButton('A',clicks.bind(null,'a'));
	const btnB = createButton('B',clicks.bind(null,'b'));
	const btnReset = createButton('Reset',reset);

	const text = createTestChamber('Secret Combination',function(container){
		const help = document.createElement('div');
		help.innerHTML = `The correct combination is '${magicSeq}', enter it in under ${maxTime/1000} seconds'`;
		container.appendChild(help);
		container.appendChild(btnA);
		container.appendChild(btnB);
		container.appendChild(btnReset);
	},mountAt);

	const correctClicks = clicks
		.reduce(function(char,index){
			return magicSeq[index] === char ? index + 1
					: magicSeq[0] === char ? 1
										: 0;
		},0);

	function reset(){
		correctClicks.value = 0;
		text('not fast enough, try again!')	
	}
		
	const success = correctClicks.filter(count=>count>=seqLen).add(function(a){
		text('Combination unlocked!');
		btnReset.disabled = true;
	});
		
	const timedSignal = TickSignal(correctClicks,maxTime).endsOn(success).add(reset);	
}