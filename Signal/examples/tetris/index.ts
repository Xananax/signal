/// <reference path="../../Signal.d.ts" />
/// <reference path="./definitions.d.ts" />
/**
 * Bunch of ideas and code from
 * http://codeincomplete.com/posts/2011/10/10/javascript_tetris/
 * (code at: https://github.com/jakesgordon/javascript-tetris)
 * 
 */
import {
	Signal
,	SKIP
} from '../../Signal';
import {createTestChamber,createButton,createInput,createTextElement} from '../common';
import {
	createFilledArray
,	constraint
,	createEmptyGrid
,	getRandomPieceProvider
,	increment
,	renderGrid
,	iteratePieceBlocks
,	occupied
} from './helpers';
import {
	pieces
,	KEYS
,	DIR
} from './data';


export default function test(mountAt:HTMLElement=document.body){
	const getPiece = getRandomPieceProvider(pieces);

	const width = Signal(10);
	const height = Signal(20);
	const canvas = Signal([width,height],function([width,height]){
		return createEmptyGrid(width,height);
	});
	const occupiedBlocks = Signal([]);
	const grid = Signal([canvas,occupiedBlocks],function([canvas,occupiedBlocks]){
		const g = canvas.map(row=>row.slice());
		occupiedBlocks.forEach(function(row,y){
			row && row.forEach(function(cell,x){
				g[y][x] = 1;
			});
		});
		let y = g.length -1;
		let lines = 0;
		while(y>=0){
			const row = g[y--];
			const isLine = row.every(cell=>cell);
			if(isLine){
				lines++;
				let i = y;
				while(i>=0){
					if(i==0){
						g[i]=createFilledArray(row.length,0);
					}
					else{
						g[i] = g[i-1].slice();
					}
					i--;
				}
				//y++;
			}
		}
		return g;
	});
	const shape = Signal(getPiece());
	const dir = Signal(0,function(d:number){
		if(d < 0 ){d = 3;}
		if(d > 3){d = 0;}
		return d;
	})
	const rotation = Signal([dir,shape,grid],function([_dir,shape,grid],previous:number){
		const _x = x?x():0;
		const _y = y?y():0;
		if(occupied(shape,_x,_y,_dir,grid)){
			dir(previous);
			return previous;
		}
		return _dir;
	});
	const x = Signal(0);
	const posX = Signal([x,shape,rotation,grid],function([_x,shape,rotation,grid],previous:number){
		const _y = y?y():0;
		if(occupied(shape,_x,_y,rotation,grid)){
			x(previous);
			return previous;
		}
		return _x;
	});
	const y = Signal(0);
	const posY = Signal([y,posX,shape,rotation,grid],function([_y,_x,_shape,rotation,grid],previous:number){
		if(occupied(_shape,_x,_y,rotation,grid)){
			const newGrid = occupiedBlocks().map(row=>row.slice());
			iteratePieceBlocks(_shape,_x,_y,rotation,function(x,y){
				if(!newGrid[y-1]){newGrid[y-1] = [];}
				newGrid[y-1][x] = 1;
			});
			occupiedBlocks(newGrid);
			x(0);
			y(0);
			dir(0);
			shape(getPiece());
			return previous;
		}
		return _y;
	});
	const board = Signal([posX,posY,rotation,shape,grid],function([x,y,rotation,shape,grid]){
		//console.log(x,y);
		grid = grid.map(row=>row.slice());
		iteratePieceBlocks(shape,x,y,rotation,function(x,y){
			grid[y][x] = 1;
		});
		return renderGrid(grid,'#','-');
	});
	window.addEventListener('keyup',function(evt){
		const {keyCode} = evt;
		if(keyCode==KEYS.DOWN){
			increment(1,y);
		}
		if(keyCode==KEYS.LEFT){
			increment(-1,x);
		}
		if(keyCode==KEYS.RIGHT){
			increment(1,x);
		}
		if(keyCode==KEYS.SPACE){
			increment(1,dir);
		}
		if(keyCode==KEYS.UP){
			increment(-1,dir);
		}
	});

	const text = createTestChamber('Tetris',function(c){
		
	},mountAt);

	board.map(function(drawnGrid){
		text(drawnGrid);
	})
};