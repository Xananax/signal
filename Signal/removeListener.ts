/// <reference path="./definitions.d.ts" />

/**
 * Removes a listener from an array of listeners.
 * @param  {Function[]} listeners the array of listeners
 * @param  {Function|Signal} listener the listener to remove
 * @returns boolean true if removal was successful, false otherwise (which means the function was already removed)
 */
export function removeListener(listeners:SignalFunctor[],listener:SignalValidListener):boolean{
	const index = listeners.indexOf(listener);
	if(index < 0){return false;}
	listeners.splice(index,1);
	return true;
}