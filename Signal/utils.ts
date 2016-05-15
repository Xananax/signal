/// <reference path="./definitions.d.ts" />

import {SKIP,BREAK,DISPOSE} from './constants';

export function isSignal(s:Signal){
	return s && s.isSignal;
}

export function processFunctionArray(fns:SignalFunctor[],processBreak:boolean,arg:any,previousArg:any):any{
	if(!fns || !fns.length){return arg;}
	const {length} = fns;
	let i = 0;
	let value:any = arg;
	while(i < length){
		const func = fns[i++];
		const ret = func(arg,previousArg);
		if(processBreak && ret == SKIP){continue;}
		if(processBreak && ret == BREAK){return BREAK;}
		if(processBreak && ret == DISPOSE){return DISPOSE;}
		value = ret;
	}
	return value;
}

export function dispose(onDispose:Function[],listenersArr:Function[][]):void{
	listenersArr.forEach(l=>l.length=0);
	onDispose && onDispose.forEach(d=>d());
	onDispose.length = 0;
}