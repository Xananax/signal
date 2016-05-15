export * from './Signal';
export * from './combine';

import {Signal} from './Signal';
import {combine} from './combine';

const log = (a) => console.log(a);

const s = Signal();
const s2 = Signal(2).map(a=>a+1)
const s3 = Signal(3).map(a=>a+1);

const c = Signal([
	s
,	s2
,	s3
]);
c.add(a=>log(a));
//c.skipSimilar = true;

s(1);
s2(2);
s3(3);
//c.deps.s('999');


/** 
const map = {};

function makeCell(x:number,y:number):Signal<number,number>{
	const cell = <Signal<number,number>>Signal(0);
	map[`${x}_${y}`] = cell;
	return cell;
}

function makeRow(y:number,size:number=10):CombinedSignal{
	let i = 0;
	const row = new Array(size);
	while(i < size){
		row[i] = makeCell(i,y);
		i++;
	}
	const r =  combine(row);
	return r;
}

function makeGrid(width:number=10,height:number=10):CombinedSignal{
	let i = 0;
	const cols = new Array(height);
	while(i < height){
		cols[i] = makeRow(i,width);
		i++;
	}
	const g = combine(cols);
	return g;
}

const grid = makeGrid(2,2);

grid.add(function([grid]){
	let str = '';
	grid.forEach(function(row){
		str+= Array.isArray(row) && row.map((col)=>'0').reduce((a,b)=>a+b) || `${row}`;
		str+= '\n';
	});
	console.log(str);
})

map['0_0'](4);

**/