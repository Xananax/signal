/// <reference path="../../Signal.d.ts" />

import {Signal,CHANGED,SKIP} from '../../Signal';
import {KeyboardSignal,GroupedKeyboardSignals} from '../../lib/KeyboardSignal';
import {TickSignal} from '../../lib/TickSignal';
import {GridSignal,gridToString,makeGrid} from '../../lib/GridSignal';
import {createTestChamber} from '../common';
import {random} from './utils';

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

	const tick = TickSignal(loopInterval);

	const state = Signal(STATE.PLAYING,function(state){
		if(state == STATE.PLAYING){tick.pause(false);}
		else{tick.pause(true);}
		if(state == STATE.DEAD){
			setTimeout(deadGrid,100);
		}
		return state;	
	});

	function reset(){
		const newGrid = makeGrid(width,height);
		board([newGrid]);
		buffer.length = 0;
		x(startPosX);
		y(startPosY);
		score(0);
	}

	function deadGrid(){
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
	
	function getEmptyPosition(){
		let x = random(width);
		let y = random(height);
		let curr = board();
		let trials = 1000
		while(curr[y][x] > 0 && trials){
			x = random(width);
			y = random(height);
			trials--;
		}
		if(!trials){
			throw new Error(`Could not find an empty position!`)
		}
		return [x,y];
	}
	
	function addWall(){
		const [x,y] = getEmptyPosition();
		board([CELLS.WALL,x,y]);
	}

	const controller = GroupedKeyboardSignals(keyCodes);

	const x = Signal(startPosX);
	const y = Signal(startPosY);

	const direction = controller.map(function(keys,previous){
		if(!keys[CHANGED]){return startingDirection;}
		const current = keys[CHANGED] && keys[keys[CHANGED]];
		if(!current || !current.on){return SKIP;}
		const name = current.name;
		switch(name){
			case 'left':return DIR.LEFT;
			case 'up':return DIR.UP;
			case 'right': return DIR.RIGHT;
			case 'down': return DIR.DOWN;
			case 'space': return toggleState() && previous;
			default: return startingDirection;
		}
	});

	tick.add(function(){
		const dir = direction();
		if(dir == DIR.LEFT){x(x()-1)}
		else if(dir == DIR.RIGHT){x(x()+1)}
		else if(dir == DIR.UP){y(y()-1)}
		else if(dir == DIR.DOWN){y(y()+1)}	
	})

	const board = GridSignal(width,height);

	const score = Signal(0,function(n){
		const [x,y] = getEmptyPosition();
		board([CELLS.APPLE,x,y]);
		if(n > 1){
			const timer = loopInterval - n * 10;
			tick(timer);
			addWall();
		}
		return n;
	});

	const head = Signal([x,y],function(coordinates,previous){
		
		const [x,y] = coordinates;
		
		const grid = board();
		const cell = grid[y] && grid[y][x];
		
		if(cell > CELLS.APPLE || x < 0 || y < 0 || x >= width || y >= height){
			state(STATE.DEAD);
			return previous;
		}
		
		if(cell == CELLS.APPLE){score(score()+1);}
		
		return coordinates;
	});

	const buffer = [];
	
	const snake = Signal([head],function(current,previous){
		const [[x,y]] = current;
		const s = score();
		const {length} = buffer;
		buffer.unshift([x,y]);
		buffer.forEach(([x,y],i)=>{
			const cell = (i == 0) ? CELLS.HEAD :
				 (i == length) ? CELLS.EMPTY : 
				CELLS.SNAKE
			;
			board([cell,x,y]);
		});
		if(length > s + 2){buffer.pop();}
		return current;
	})

	const text = createTestChamber('Snake',function(container:HTMLElement){
		const stateText = document.createElement('div');
		stateText.innerText = '';
		const scoreText = document.createElement('div');
		scoreText.innerText = '';
		state.map(function(state){
			stateText.innerText = state == STATE.DEAD ? 'DEAD! Press space to try again' : 
			state == STATE.PAUSED ? '- paused - ' : 
			`catch all the ${CELLSREPRESENTATION[CELLS.APPLE]}, avoid the ${CELLSREPRESENTATION[CELLS.WALL]}!` 
		})
		score.map(function(score){
			scoreText.innerText = `Score: ${score}`;
		})
		container.appendChild(stateText);
		container.appendChild(scoreText);
	},mountAt);

	board.map(a=>{
		text(gridToString(a,CELLSREPRESENTATION));
	})

};