export function addToArray<T>(arr:T[],el:T):boolean{
	const index = arr.indexOf(el);
	if(index >= 0){return false;}
	arr.push(el);
	return true;
}

export function isFunction(x:any):x is Function{
	return typeof x === 'function';
}

export function isNumber(x:any):x is number{
	return typeof x === 'number';
}

export function isString(x:any):x is string{
	return typeof x === 'string';
}

export function isSignal(obj:any):obj is Signal<any,any>{
	return (obj && isFunction(obj) && obj.dependencies);
}

export function isArray(obj:any):obj is Array<any>{
	return (obj && Array.isArray(obj));
}

export function isThenable(obj:any):obj is Promise<any>{
	return (obj && ('then' in obj) && isFunction(obj.then));
}

export function isUndefined(thing:any):boolean{
	return (typeof thing === 'undefined');
}

export function isObject(obj:any):obj is Object{
	return (
		obj && 
		(typeof obj == 'object') && 
		(
			('constructor' in obj && obj.constructor == Object) ||
			!('constructor' in obj)
		)
	);
}

export function isSignalArray(obj:any):obj is SignalDependenciesArray<any>{
	return (isArray(obj) && obj.length && isSignal(obj[0]));
}

export function isSignalObject(obj:any):obj is SignalDependenciesObject<any>{
	if(!isObject(obj)){return false;}
	for(let n in obj){
		if(!Object.prototype.hasOwnProperty.call(obj,n)){continue;}
		if(isSignal(obj[n])){return true;}
		return false;
	} 
}

export function removeFromArray<T>(arr:T[],el:T):boolean{
	const index = arr.indexOf(el);
	if(index < 0){return false;}
	arr.splice(index,1);
	return true;
}

export function setArrayElement(arr:any[],index:number,value:any):any[]{
	if(arr[index] == value){
		return arr;
	}
	const arr2 = arr.slice();
	arr2[index] = value;
	return arr2;
}

export function getLastArrayIndex(arr:any[]):number{
	return arr.length - 1;
}

export function setObjectProperty(obj:any,name:string,value:any):any{
	if(obj[name] == value){
		return obj;
	}
	const obj2 = Object.assign({},obj,{[name]:value});
	return obj2;
}

export function now():number{
	return (performance && performance.now()) || (Date.now());
}

export function random(max:number,min:number=0,rand:()=>number=Math.random):number{
	return Math.floor(rand() * max) + min;  
}