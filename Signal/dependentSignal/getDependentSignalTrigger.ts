import {areDepsMet} from './areDepsMet';

/**
 * Returns a function suitable to be used as a trigger for 
 * dependents arrays.
 * @param  {CombinedSignalArray} depSignal the dependent signal
 * @param  {number} index the index of the dependency signal
 * @param  {Function} copy a function used to add the received value to the `depSignal`
 *                    value. Typically, this is a function to change an index in an array.
 * 	                  The function has the signature `(currentValue:array,index:number,receivedValue:any):array`
 * @returns SignalFunctor the trigger function
 */
export function getDependentSignalTrigger(depSignal:CombinedSignalArray|CombinedSignalObject, index:number|string,copy:Function):SignalFunctor{
	return function trigger(val,previousValue){
		const newValue = copy(depSignal.value,index,val);
		const hasChanged = newValue!== depSignal.value; 
		const returnedValue =  hasChanged ? newValue : depSignal.value;
		const _depsMet = areDepsMet(depSignal);
		if(_depsMet){
			depSignal.changed = index;
			depSignal.trigger(returnedValue);
		}else if(hasChanged){
			depSignal.value = returnedValue;
		}	
	}
}