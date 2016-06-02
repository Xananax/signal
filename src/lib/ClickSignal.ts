/// <reference path="../Signal.d.ts" />

import {SKIP,createSignal} from '../';
import {shouldTriggerToggleSignal} from './utils';

function shouldTriggerClick(nodes:Node[],ons:boolean[],s:ToggleSignal,bool:boolean,evt:MouseEvent):void{
	const el = <Node>evt.target;
	const index = nodes.indexOf(el);
	shouldTriggerToggleSignal(index,ons,s,bool);
}


export function ClickSignal(elements:Node[],name?:string,now:SignalTimeProvider=Date.now):ToggleSignal{
	
	let on = false;
	
	const s = createSignal(function(pressed:boolean){
		if(on == pressed){return SKIP;}
		const since = now();
		on = pressed;
		const val = {on,since,name};
		return val;
	});
	
	const ons = elements.map(_=>false);
	
	const toggleOn = shouldTriggerClick.bind(null,elements,ons,s,true);
	const toggleOff = shouldTriggerClick.bind(null,elements,ons,s,false);
	
	elements.forEach(function(el:Node){
		el.addEventListener('mousedown',toggleOn);
		el.addEventListener('mouseup',toggleOff);
		s.onDispose.push(
			()=>el.removeEventListener('mousedown',toggleOn)
		,	()=>el.removeEventListener('mouseup',toggleOff)
		);
	});
	
	
	s.value = {on,since:0,name};
	s.depsMet = true;
	return s;
}