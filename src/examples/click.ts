/// <reference path="../Signal.d.ts" />

import Signal from '../Signal';
import {BufferedSignal} from '../lib/BufferedSignal';
import {createTestChamber,createButton} from './example_tools';

export default function test(mountAt:HTMLElement=document.body){
	
	const clickStream = Signal();

	const text = createTestChamber('Clicks',function(container:HTMLElement){
		container.appendChild(createButton('click me',clickStream));
	},mountAt);

	const groupedClicks = BufferedSignal(clickStream)
		.map(clicks=>clicks.length)
		.map(clicks=>(clicks?
			(clicks==1 ? 'you clicked one time' : `you clicked ${clicks} times`):
			'click the button rapidly')
		).map(text);
}