/// <reference path="./definitions.d.ts" />

import {removeListener} from './removeListener';
import {hasListener} from './hasListener';
import {isSignal} from './utils'; 
/**
 * Adds a function to a `listeners` array.
 * @param  {Function[]} listeners the listeners array to add the listener to
 * @param  {SignalListener|Signal} listener a function of signature `(val,previousVal):any`
 * @return void 
 */
function addListener(listeners: SignalValidListener[], listener:SignalValidListener): void {
	if(hasListener(listeners,listener)){return;}
	listeners.push(listener);
}
/**
 * Adds either an collection of listeners or a single listener to an array of listeners. 
 * @param  {Function[]} listeners the listeners array to add to
 * @param  {Array<Function|Signal>} An array of mixed signals or listeners of signature `(val,previousVal):any`
 * @returns void
 */
export function addListeners(arr: SignalValidListener[], fns: SignalValidListenerArgument): void {
	if(Array.isArray(fns)){
		fns.forEach(fn=>addListener(arr,fn));
		return;
	}
	if(typeof fns == 'function'){
		addListener(arr,<SignalValidListener>fns)	
	}	
}