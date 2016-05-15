/// <reference path="./definitions.d.ts" />


/**
 * Returns true if the array of listeners contains the passed function.
 * 
 * @param  {Function[]} listeners
 * @param  {Function|Signal} listener
 * @returns boolean
 */
export function hasListener(listeners: SignalValidListener[], listener: SignalValidListener): boolean {
	const index = listeners.indexOf(listener);
	if(index < 0){return false;}
	return true;
}