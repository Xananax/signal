/// <reference path="../Signal.d.ts" />

import Signal from '../Signal';
import {createInputsTestChamber} from './example_tools';

export default function test(mountAt:HTMLElement = document.body){
	
	const x = Signal(10);
	const y = Signal(20);
 
	const text = createInputsTestChamber('Sum',{x,y},mountAt);

	const sum = Signal([x,y],function([x,y]){
		return [x,y,x+y];
	})
	.map(function([x,y,result]){
		const str = `${x}+${y} = ${result}`;
		text(str);
	});

}
