/// <reference path="../Signal.d.ts" />

import {SKIP,createSignal} from '../Signal';

export function ToggleSignal(name?:string,now:SignalTimeProvider=Date.now):ToggleSignal{
	let on = false;
	const s = createSignal([],function(pressed:boolean){
		if(on == pressed){return SKIP;}
		const since = now();
		on = pressed;
		return {on,since,name};
	});
	s.value = {on,since:0,name};
	s.depsMet = true;
	return s;
}