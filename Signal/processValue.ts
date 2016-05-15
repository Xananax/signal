/// <reference path="./definitions.d.ts" />

import {SKIP,BREAK,DISPOSE,PAUSE,UNPAUSE} from './constants';
import {processFunctionArray,isSignal,dispose} from './utils'

/**
 * Returns true if `value` === `previousValue`. 
 * @param  {any} value
 * @param  {any} previousArg
 * @returns boolean
 */
function isSame(value:any,previousArg:any):boolean{
	return (value === previousArg);
}

/**
 * Returns true if the current update should be skipped.
 * An update is considered skippable if it returns:
 * - the BREAK symbol
 * - the DISPOSE symbol
 * - `skipSimilar` is set to true and the returned value
 *   is strictly similar to the previous value.
 * @param  {boolean} skipSimilar true if you want a (===) similarity check
 * @param  {any} value the current value having been processed
 * @param  {any} previousArg the previous value
 * @returns boolean
 */
function shouldSkip(skipSimilar:boolean,value:any,previousArg:any):boolean{
	if(value == BREAK){return true;}
	if(value == DISPOSE){return true;}
	if(value == PAUSE){return true;}
	if(value == UNPAUSE){return true;}
	if(skipSimilar && isSame(value,previousArg)){return true;}
	return false;
}
/**
 * This function is called before dispatching and transforms the value through processors.
 * Runs the passed value through the arrays of processors, then:
 *  - If any processor returned the symbol BREAK, nothing happens, and `false` is returned.
 *  - if any processor returned the symbol DIPOSE, the signal is `dispose()`d, and `false` is returned
 *  - if `skipSimilar` is true and the processed value is similar to the previous value,
 *    nothing happens, and `false` is returned.
 * If none of the above is true, then the signal's `hasValue` property is set to true, its
 * `value` property is set to the processed value, and `true` is returned.
 * @param  {Signal} s the signal that is dispatching
 * @param  {Function[]} processors an array of processors to apply to the value before dispatching.
 * @param  {boolean} skipSimilar if true, and the processed value is strictly equal to the previous value, nothing happens
 * @param  {any} arg the current value
 * @param  {any} previousArg the previous value
 * @returns boolean true if the value was set, false if updating was short circuited
 */
export function processValue(s:Signal, processors:SignalFunctor[], skipSimilar: boolean, arg: any, previousArg: any):boolean{
	const value = processFunctionArray(processors,true,arg,previousArg);
	if(shouldSkip(skipSimilar,value,previousArg)){
		(value == DISPOSE) && s.dispose();
		(value == PAUSE) && s.pause(true);
		(value == UNPAUSE) && s.pause(false);
		return false;
	}
	s.hasValue = true;
	s.value = value;
	return true;	

}