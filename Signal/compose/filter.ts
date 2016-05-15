/// <reference path="../definitions.d.ts" />

import {BREAK} from '../constants';

/**
 * Returns a functor that filters a signal.
 * 
 * @param  {SignalFunctor} fn a functor that must return a falsy or truthy value.
 * @returns SignalFunctor
 */
export function createFilter(fn:SignalFilter):SignalFunctor{
	return function trigger(value:any,previousValue:any):any{
		const ret = fn(value,previousValue);
		return ret ? value : BREAK;
	}
}