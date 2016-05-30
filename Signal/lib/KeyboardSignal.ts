/// <reference path="../Signal.d.ts" />

import {SKIP,createSignal,createCombinedSignal} from '../Signal';
import {shouldTriggerToggleSignal} from './utils';


function shouldTriggerKeyCode(keyCodes:number[],ons:boolean[],s:ToggleSignal,bool:boolean,evt:KeyboardEvent):void{
	const {keyCode} = evt;
	const index = keyCodes.indexOf(keyCode);
	shouldTriggerToggleSignal(index,ons,s,bool);
}

export function KeyboardSignal(keyCodes:number[],name?:string,addEventListener:SignalEventAdder=window.addEventListener,removeEventListener:SignalEventAdder=window.removeEventListener,now:SignalTimeProvider=Date.now):ToggleSignal{
	
	let on = false;
	
	const s = createSignal([],function(pressed:boolean){
		if(on == pressed){return SKIP;}
		const since = now();
		on = pressed;
		const val = {on,since,name};
		return val;
	});
	
	const ons = keyCodes.map(_=>false);
	const onKeyDown = shouldTriggerKeyCode.bind(null,keyCodes,ons,s,true);
	const onKeyUp = shouldTriggerKeyCode.bind(null,keyCodes,ons,s,false);
	
	window.addEventListener('keydown',onKeyDown);
	window.addEventListener('keyup',onKeyUp);
	
	s.onDispose.push(
		()=>window.removeEventListener('keydown',onKeyDown)
	,	()=>window.removeEventListener('keyup',onKeyUp)
	);
		
	
	s.value = {on,since:0,name};
	s.depsMet = true;
	return s;
}

export function GroupedKeyboardSignals(keyCodes){
	
	const controllers:SignalDependenciesObject = {};
	
	Object.keys(keyCodes).forEach(function(name){
		controllers[name] = KeyboardSignal(keyCodes[name],name);
	});

	return createCombinedSignal(controllers);
}