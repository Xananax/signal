/// <reference path="../definitions.d.ts" />

import {setDependentSignal} from './setDependentSignal';
import {createSignal} from '../createSignal'

export function createDependentSignal(parentSignal:Signal,listener?:SignalFunctor):Signal{

	const dependentSignal = listener ? createSignal([listener]) : createSignal();

	setDependentSignal(dependentSignal,parentSignal);

	if (parentSignal.hasValue) {
		dependentSignal.value = listener ? listener(parentSignal.value) : parentSignal.value;
	}

	return dependentSignal;
}