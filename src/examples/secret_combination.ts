/// <reference path="../Signal.d.ts" />

import Signal from '../Signal';
import {createTestChamber,createButton} from './example_tools';
import {TimedSignal} from '../lib/TimedSignal';


export default function test(mountAt:HTMLElement=document.body){
	
	const sequence = 'abbaba';
	const seqLen = sequence.length;
	const maxTime = 5000;

	const clicks = Signal('');

	const btnA = createButton('A',clicks.bind(null,'a'));
	const btnB = createButton('B',clicks.bind(null,'b'));
	
	const reset = Signal(function(){
		text('');
		clicks('');
		letters.value = '';
		btnReset.disabled = true;
		btnA.disabled = false;
		btnB.disabled = false;
		return true;
	})
	
	const btnReset = createButton('reset',reset)
	
	const text = createTestChamber('Secret Combination',function(container){
		const help = document.createElement('div');
		help.innerHTML = `The correct combination is '${sequence}', enter it in under ${maxTime/1000} seconds:`;
		const time = document.createElement('div');
		container.appendChild(help);
		container.appendChild(btnA);
		container.appendChild(btnB);
		btnReset.disabled = true;
		container.appendChild(btnReset);
	},mountAt);
	
	
	const correctClicks = clicks.reduce(function(char:string,index:number):number{
		return (sequence[index] === char) ? index + 1 : 0;
	},0);

	
	const success = correctClicks.filter(count=>count>=seqLen).add(function(a){
		btnA.disabled = true;
		btnB.disabled = true;
		btnReset.disabled = false;
		text('Combination unlocked!');
	});
	
	const letters = clicks.reduce(function(char:string,all:string){
		return all + (char ? char + '-' : '');
	},'')
	.add(text,true)
	.toggleOn(success,reset)
	
		
	const timedSignal = TimedSignal(correctClicks,maxTime).add(function(params) {
		// TODO: Find a more elegant way to reset reduced streams?
		letters.value = '';
		clicks('');
		text('not fast enough!');
	}).toggleOn(success,reset)
	
}