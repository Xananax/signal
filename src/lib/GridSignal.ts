/// <reference path="../Signal.d.ts" />

import {
	SKIP
,	createSignal
,	invalidateDependents
,	areDepsResolved
,	applySignalValue
,	random
} from '../';

export function makeArray(size:number,fill:(index:number)=>number):number[];
export function makeArray(size:number,fill:(index:number)=>number[]):Grid;
export function makeArray(size:number,fill:number):number[];
export function makeArray(size:number,fill:any=0):any{
	if(typeof fill == 'function'){
		return new Array(size).fill(null).map((_,index)=>fill(index));
	}
	return new Array(size).fill(fill);
}

export function makeGrid(width:number,height:number,fill:number=0):Grid{
	const row = makeArray(width,fill);
	const grid = makeArray(height,()=>row.slice());
	return grid;
}

export function isValidCell(width:number,height:number,x:number,y:number):boolean{
	if(y > height-1){ throw new Error(`index y \`${y}\` is out of bounds`);}
	if(x > width-1){ throw new Error(`index x \`${x}\` is out of bounds`);}
	return true;	
}

export function setCell(grid:Grid,x:number,y:number,value:number):Grid{
	const height = grid.length;
	const width = grid[0].length;
	isValidCell(width,height,x,y);
	if(grid[y][x] == value){return grid;}
	return makeArray(height,(i)=>
		(i == y) ? makeArray(width,(j)=>((j==x)? value : grid[i][j])) :
			grid[i]
	);
}

export function getCell(grid:Grid,x:number,y:number):number{
	const height = grid.length;
	const width = grid[0].length;
	isValidCell(width,height,x,y);
	return grid[y][x];
}

export function resizeGrid(grid:Grid,width:number,height:number,left:number=0,top:number=0):Grid{
	let i = top;
	const gHeight = grid.length;
	const gWidth = grid[0].length;
	width = width || gWidth;
	height = height || gHeight;
	if(top==0 && left == 0 && width == gWidth && height == gHeight){
		return cloneGrid(grid);
	}
	const maxY = Math.max(gHeight,top+height);
	const maxX = Math.max(gWidth,left+width);
	const newGrid = [];
	while(i < maxY ){
		const row = grid[i++];
		const newRow = [];
		let j = left;
		while(j < maxX ){
			const cell = row[j++];
			newRow.push(cell);
		}
		newGrid.push(newRow);
	}
	return newGrid;
}

export function mergeGrids(grid:Grid,mGrid:Grid,x:number=0,y:number=0):Grid{

	const height = grid.length;
	const width = grid[0].length;
	isValidCell(width,height,x,y);
	const mHeight = mGrid.length;
	const mWidth = mGrid[0].length;
	let row = 0;
	let col = 0;
	return makeArray(height,function(i){
		if(i < y || row >= mHeight){
			return grid[i];
		}
		col = 0;
		const r = makeArray(width,function(j){
			if(j < x || col >= mWidth){return grid[i][j];}
			let c = mGrid[row][col++];
			if(c == null){return grid[i][j];}
			return c;
		})
		row++;
		return r;
	});
}

export function cloneGrid(grid:Grid){
	const height = grid.length;
	const width = grid[0].length;
	return makeArray(height,(i)=>
		makeArray(width,(j)=>grid[i][j])
	);
}

export function gridToString(grid:Grid,map:string[]):string{
	const lastIndex = map.length - 1;
	return grid.map(row=>
		row.map(n=>map?(map[n]!=null)?map[n]:map[lastIndex]:n)
		.join('')
	).join('\n');
}

interface Grid extends Array<Array<number>>{}

interface GridSignalCellEntry extends Array<any>{
	0:number
,	1?:number
,	2?:number
}
interface GridSignalMergeEntry extends Array<any>{
	0:Grid
,	1?:number
,	2?:number
} 
interface GridSignalResizeEntry extends Array<any>{
	0:number[]
	1:number[]
}
type GridSignalEntry =  GridSignalCellEntry | GridSignalMergeEntry | GridSignalResizeEntry; 
 
 
export function getEmptyCell(grid:Grid):[number,number]{
	const height = grid.length;
	const width = grid[0].length;
	let x = random(width);
	let y = random(height);
	let trials = width*height;
	while(grid[y][x] > 0 && trials){
		x = random(width);
		y = random(height);
		trials--;
	}
	if(!trials){throw new Error(`Could not find an empty position!`)}
	return [x,y];
}

export function GridSignal(width:number,height:number):Signal<GridSignalEntry,Grid>{
	
	let grid = makeGrid(width,height);
	
	const s = createSignal(functor);
	s.depsMet = true;
	s.value = grid;
	
	function functor(val:GridSignalEntry):Grid{
		if(!Array.isArray(val)){throw new TypeError(`cannot call a grid with no coordinates`)}
		
		if(typeof val[0] == 'number'){
			const coords = val as GridSignalCellEntry;
			const value = coords[0]
			const x = coords[1] || 0;
			const y = coords[2] || 0;
			grid = setCell(grid,x,y,value);
			return grid;
		}else if(typeof val[1] == 'number' || typeof val[1] == 'undefined'){
			const coords = val as GridSignalMergeEntry;
			const mergeGrid = coords[0];
			if(!Array.isArray(mergeGrid) || !Array.isArray(mergeGrid[0])){
				throw new TypeError(`\`${mergeGrid}\` is not a mergeable grid`)
			}
			const x = coords[1] || 0;
			const y = coords[2] || 0;
			grid = mergeGrids(grid,mergeGrid,x,y);
			return grid;
		}else if(val.length == 2 && Array.isArray(val[0]) && Array.isArray(val[1])){
			const resize = val as GridSignalResizeEntry;
			const [width,height] = resize[0];
			const [left,top] = resize[1];
			grid = resizeGrid(grid,width,height,left||0,top||0);
		}
	}
	
	return s;
}