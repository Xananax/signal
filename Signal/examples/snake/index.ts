/// <reference path="../../Signal.d.ts" />

import {Signal,CHANGED,SKIP} from '../../Signal';
import {KeyboardSignal,GroupedKeyboardSignals} from '../../lib/KeyboardSignal';
import {TickSignal} from '../../lib/TickSignal';
import {TimedSignal} from '../../lib/TimedSignal';
import {BranchingSignal} from '../../lib/BranchingSignal';
import {GridSignal,gridToString,makeGrid,getEmptyCell} from '../../lib/GridSignal';
import {createTestChamber} from '../common';
import {sound} from './utils';

export default function test(mountAt:HTMLElement=document.body){

	enum DIR {
		UP,LEFT,DOWN,RIGHT
	}

	enum STATE {
		DEAD, PLAYING, PAUSED
	}

	const keyCodes = {
		space:[32]
	,	left:[37]
	,	up:[38]
	,	right:[39]
	,	down:[40]
	}

	const width = 20;
	const height = 20;
	const startPosX = Math.round(width/2);
	const startPosY = Math.round(height/2);
	const loopInterval = 300;
	const startingDirection = DIR.UP;
	
	const CELLS = {
		EMPTY:0
	,	APPLE:1
	,	HEAD:2
	,	SNAKE:3
	,	WALL:4
	}
	const CELLSREPRESENTATION = [
		'.'
	,	'♥'
	,	'@'
	,	'●'
	,	'X'
	];

	function reset(){
		sound('start');
		const newGrid = makeGrid(width,height);
		board([newGrid]);
		buffer.length = 0;
		x(startPosX);
		y(startPosY);
		tick(loopInterval);
		apples(0);
		score([0,null]);
	}

	function deadGrid(){
		sound('death');
		const newGrid = makeGrid(width,height,CELLS.WALL);
		board([newGrid]);
	}

	function toggleState(){
		const s = state();
		if(s == STATE.PAUSED){
			state(STATE.PLAYING);
		}
		else if(s == STATE.DEAD){
			reset();
			state(STATE.PLAYING);
		}
		else{
			state(STATE.PAUSED);
		}
		return true;
	}
	
	function addWall(){
		const [x,y] = getEmptyCell(board());
		board([CELLS.WALL,x,y]);
	}
	
	function isDeadlyCell(cell:number,x:number,y:number,width:number,height:number){
		return (cell > CELLS.APPLE || x < 0 || y < 0 || x >= width || y >= height)
	}
	
	const controller = GroupedKeyboardSignals(keyCodes);
	const x = Signal(startPosX);
	const y = Signal(startPosY);
	const board = GridSignal(width,height);
	
	const direction = controller.map(function(keys,previous){
		if(!keys[CHANGED]){return startingDirection;}
		const current = keys[CHANGED] && keys[keys[CHANGED]];
		if(!current || !current.on){return SKIP;}
		const name = current.name;
		switch(name){
			case 'left':
				if(previous!==DIR.RIGHT){return DIR.LEFT;}
				return previous;
			case 'up':
				if(previous!==DIR.DOWN){return DIR.UP;}
				return previous;
			case 'right':
				if(previous!==DIR.LEFT){return DIR.RIGHT;}
				return previous;
			case 'down':
				if(previous!==DIR.UP){return DIR.DOWN;}
				return previous;
			case 'space':
				toggleState();
				return previous;
			default: return startingDirection;
		}
	});

	const tick = TickSignal(loopInterval).add(function(){
		const dir = direction();
		if(dir == DIR.LEFT){x(x()-1)}
		else if(dir == DIR.RIGHT){x(x()+1)}
		else if(dir == DIR.UP){y(y()-1)}
		else if(dir == DIR.DOWN){y(y()+1)}	
	});
	
	const apples = Signal(0,function(n){
		const [x,y] = getEmptyCell(board());
		board([CELLS.APPLE,x,y]);
		if(n > 1){
			const timer = loopInterval - n * 10;
			tick(timer);
			addWall();
		}
		return n;
	});
	

	const bonus = TimedSignal(apples,30,100).map(n=>100-n);
	
	const score = Signal([apples],function([apples,changed],previous){
		if(previous==null || changed==null){
			return 0;
		}
		const b = (apples > 0) && bonus() || 0;
		return previous + 10 + b;
	});
	
	const highestScore = Signal([score],function([score],previous){
		if(!previous){return score;}
		return Math.max(previous,score);
	})
	
	const state = BranchingSignal(STATE.PLAYING,{
		[STATE.PLAYING]:()=>tick.pause(false)
	,	[STATE.PAUSED]:()=>tick.pause(true)
	,	[STATE.DEAD]:()=>{tick.pause(true);setTimeout(deadGrid,100)}
	});

	const buffer = [];
	
	const snake = Signal([x,y],function(coordinates,previous){
		
		const [x,y] = coordinates;
		
		const grid = board();
		
		const cell = grid[y] && grid[y][x];
		
		if(isDeadlyCell(cell,x,y,width,height)){
			state(STATE.DEAD);
			return previous;
		}
		
		const _apples = apples();
		
		if(cell == CELLS.APPLE){
			apples(_apples+1);
			sound('pick');
		}else{
			sound('walk');
		}
		
		const {length} = buffer;
		
		buffer.unshift([x,y]);
		
		buffer.forEach(([x,y],i)=>{
			const cell = (i == 0)?CELLS.HEAD:(i == length)?CELLS.EMPTY:CELLS.SNAKE;
			board([cell,x,y]);
		});
		
		if(length > _apples + 2){buffer.pop();}
		
		return coordinates;
	})

	const text = createTestChamber('Snake',function(container:HTMLElement){
		const stateText = document.createElement('div');
		const statusText = document.createElement('div');
		state.map(function(state){
			stateText.innerText = state == STATE.DEAD ? 'DEAD! Press space to try again' : 
			state == STATE.PAUSED ? '- paused - ' : 
			`catch all the ${CELLSREPRESENTATION[CELLS.APPLE]}, avoid the ${CELLSREPRESENTATION[CELLS.WALL]}!` 
		});
		Signal([score,highestScore,bonus],function([score,highestScore,bonus]){
			statusText.innerHTML = `score: ${score}<br/>highest: ${highestScore}<br/>bonus: ${bonus|0}`;
		})
		
		container.appendChild(stateText);
		container.appendChild(statusText);
		
	},mountAt);

	sound('start');
	board.map(a=>gridToString(a,CELLSREPRESENTATION)).map(text);

};