/// <reference path="../Signal.d.ts" />

import {Signal} from '../Signal';
import {BufferedSignal} from '../lib/BufferedSignal';
import {createTestChamber,createButton,createInput,createTextElement} from './common';

export default function test(mountAt:HTMLElement=document.body){
	const clickStream = Signal();

	const a = Signal('A');
	const b = a.map(a=>a+'B');
	const c = a.map(a=>a+'C');
	const d = Signal([b,c],([b,c])=>b+' '+c);

	d.skipSimilar(true);

	let str = '';
	let count = 0;

	const text = createTestChamber('Diamond',function(container:HTMLElement){
		const inputA = createInput('A','string',a);
		const help = createTextElement('This is a demonstration of a diamond structure')
		const graph = createTextElement('  A\n/   \\\nB     C\n\\   /\n  D','pre');
		const valuesB = createTextElement('');
		const valuesC = createTextElement('');
		b.map(v=>valuesB.innerText=`B:\`${v}\``)
		c.map(v=>valuesC.innerText=`C:\`${v}\``)
		container.appendChild(help);
		container.appendChild(graph);
		container.appendChild(valuesB);
		container.appendChild(valuesC);
		container.appendChild(inputA);
	},mountAt);
	d.map(value=>{
		str+=`${count}: ${value}\n`;
		count++;
		text(str);
	});

}