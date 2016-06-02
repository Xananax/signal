import {
	addToArray
,	isFunction
,	isNumber
,	isString
,	isSignal
,	isArray
,	isThenable
,	isUndefined
,	isObject
,	isSignalArray
,	isSignalObject
,	removeFromArray
,	setArrayElement
,	getLastArrayIndex
,	setObjectProperty
,	now
,	random
} from './utils';
import {expect} from 'chai';

describe('addToArray',()=>{
	describe('addToArray(arr,el)',()=>{
		it('should add an element to the array',()=>{
			const arr = [1,2,3];
			addToArray(arr,4)
			expect(arr.length).to.equal(4);
			expect(arr[3]).to.equal(4);
		});
	});
});
describe('isFunction',()=>{
	describe('isFunction(fn)',()=>{
		it('should return true',()=>{
			const fns = [()=>{},function(){},new Function('return;')]
			eval('fns.push(function(){})');
			expect(fns.every(isFunction)).to.equal(true);
		});
	});
	describe('isFunction(anything else)',()=>{
		it('should return false',()=>{
			const nonFunctions = ['',1,new Date(),[],{}];
			expect(nonFunctions.every(n=>!isFunction(n))).to.equal(true);
		});
	});
});
describe('isNumber',()=>{
	describe('isNumber(number)',()=>{
		it('should return true',()=>{
			const els = [1,NaN,4.343,Infinity]
			expect(els.every(isNumber)).to.equal(true);
		});
	});
	describe('isNumber(anything else)',()=>{
		it('should return false',()=>{
			const els = ['',new Date(),[],{}];
			expect(els.every(n=>!isNumber(n))).to.equal(true);
		});
	});
});