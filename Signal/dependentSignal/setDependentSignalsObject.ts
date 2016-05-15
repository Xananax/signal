import {createFilledArray} from './createFilledArray';
import {setObjectValue} from './setObjectValue';
import {getDependentSignalTrigger} from './getDependentSignalTrigger';
import {setDependentSignal} from './setDependentSignal';
/**
 * Sets an object of signals as dependencies of one signal.
 * - The dependent signal will be added to each signal in the array as a listener;
 * - The dependent signal will auto-remove itself from all the signal's listeners when
 *   it will be disposed of.
 * - Every depended on signal that has a value will have it's value added to the returned `value`
 *   property. 
 * @param  {CombinedSignalObject} depSignal the dependent signal
 * @param  {Object} deps an object of signals
 * @returns Object an object with keys similar to the keys of the passed dependencies
 */
export function setDependentSignalsObject(depSignal:CombinedSignalObject,deps:SignalDependenciesObject):any{
	const keys = Object.keys(deps);
	const value = {};
	keys.forEach(function(key:string,index:number){
		const signal = deps[key];
		if(signal.hasValue){
			value[key] = signal.value;
		}
		const trigger = getDependentSignalTrigger(depSignal,key,setObjectValue);
		setDependentSignal(depSignal,signal,trigger);
	});
	return value;
}