import Signal from '../Signal';
import {BufferedSignal} from '../lib/BufferedSignal';
import {createTestChamber,createButton} from './example_tools';

import {KeyboardSignal} from '../lib/KeyboardSignal';


export default function test(mountAt:HTMLElement=document.body){
	
	const clickStream = Signal();

	const text = createTestChamber('Clicks',function(container:HTMLElement){
	},mountAt);
	
	const left = KeyboardSignal([37]);
	const up = KeyboardSignal([38]);
	const right = KeyboardSignal([39]);
	const down = KeyboardSignal([40]);

	const keys = Signal([left,up,right,down],function([l,u,r,d],previous){
		let str = [];
		if(l.on){str.push('left');}
		if(u.on){str.push('up');}
		if(r.on){str.push('right');}
		if(d.on){str.push('down');}
		if(!str.length){str.push('no key pressed')}
		const changed = keys ? keys.changed : -1;
		const lastChanged = (
			(changed==0) ? 'left':
			(changed==1) ? 'up':
			(changed==2) ? 'right':
			(changed==3) ? 'down' :
			'none'
		);
		return `[${str.join(',')}], last changed: ${lastChanged}`;
	}).add(text,true);

}