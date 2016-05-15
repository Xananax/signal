import {createFilledArray} from './createFilledArray';
import {setArrayValue} from './setArrayValue';
import {getDependentSignalTrigger} from './getDependentSignalTrigger';
import {setDependentSignal} from './setDependentSignal';

/**
 * Sets an array of signals as dependencies of one signal.
 * - The dependent signal will be added to each signal in the array as a listener;
 * - The dependent signal will auto-remove itself from all the signal's listeners when
 *   it will be disposed of.
 * - Every depended on signal that has a value will have it's value added to the returned `value`
 *   property. 
 * @param  {CombinedSignalArray} depSignal the dependent signal
 * @param  {SignalDependenciesArray} deps an array of dependencies
 * @returns Array an array of values, of same size as the array of dependencies. 
 */
export function setDependentSignalsArray(depSignal:CombinedSignalArray,deps:SignalDependenciesArray):any[]{
	const value = createFilledArray(deps.length,undefined);
	deps.forEach(function(signal:Signal,index:number){
		if(signal.hasValue){
			value[index] = signal.value;
		}
		const trigger = getDependentSignalTrigger(depSignal,index,setArrayValue);
		setDependentSignal(depSignal,signal,trigger);
	});
	return value;
}