/// <reference path="../Signal.d.ts" />

import Signal,{CHANGED,SKIP} from '../';
import {KeyboardSignal,GroupedKeyboardSignals} from '../lib/KeyboardSignal';
import {TickSignal} from '../lib/TickSignal';
import {TimedSignal} from '../lib/TimedSignal';
import {BranchingSignal} from '../lib/BranchingSignal';
import {GridSignal,gridToString,makeGrid,getEmptyCell} from '../lib/GridSignal';
import {createTestChamber,soundSystem,canvasGrid} from './example_tools';

export default function test(mountAt:HTMLElement=document.body){

	enum DIR {
		UP,LEFT,DOWN,RIGHT
	}

	enum STATE {
		DEAD, PLAYING, PAUSED
	}
	
	enum POWER {
		NONE, TIME, GOD
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
	const loopInterval = 200;
	const startingDirection = DIR.UP;

	const sounds:{[key:string]:[string,number]}= {
		start: ["gfefgg-fff-gbb-gfefggggffgfe---",250]
	,	pickup: ['FbFbAF',loopInterval/6]
	,	death: ['fbeGa',300]
	}
	let walkSound:[string,number][]= [
		['f',loopInterval]
	,	['e',loopInterval]
	];
	const sound = soundSystem(sounds);
	
	const CELLS = {
		EMPTY:0
	,	APPLE:1
	,	WALL:2
	,	HEAD:3
	,	SNAKE:4
	}
	const CELLSREPRESENTATION = [
		'.'
	,	'♥'
	,	'X'
	,	'@'
	,	'●'
	];

	const CELLSCOLORS = [
		'rgba(25,25,25,.1)'
	,	'lime'
	,	'red'
	];
	
	{
		let max = 10;
		let i = 0;
		let coeff = 255/max;
		while(i < max){
			const c = Math.floor(255-(coeff*(i++)));
			CELLSCOLORS.push(`rgb(0,${c},0)`);
		}
	}
	
	const canvas = canvasGrid(width,height,CELLSCOLORS);

	function reset(){
		console.log('---------------------')
		sound('start',true);
		const newGrid = makeGrid(width,height);
		board([newGrid]);
		buffer.length = 0;
		direction.value = startingDirection;
		$x(startPosX);
		$y(startPosY);
		tick.delay(loopInterval);
		setSoundSpeed(loopInterval);
		bonus(0);
		apples(0);
		score([0,null]);
		power(POWER.NONE);
		state(STATE.PLAYING);
	}

	function getWalkSound(){
		walkSound.reverse();
		const song = walkSound[1];
		return song;
	}

	function setSoundSpeed(time:number){
		walkSound[0][1] = time;
		walkSound[1][1] = time;
		sounds['pickup'][1] = time/6;
	}

	function deadGrid(){
		sound('death',true);
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
	
	function isDeadlyCell(cell:number){
		return (cell > CELLS.APPLE)
	}
	
	function cellIsOutOfBounds(x:number,y:number,width:number,height:number){
		return (x < 0 || y < 0 || x >= width || y >= height)
	}
	
	function applyDirection(){
		const dir = direction();

		if(dir == DIR.LEFT){$x($x()-1)}
		else if(dir == DIR.RIGHT){$x($x()+1)}
		else if(dir == DIR.UP){$y($y()-1);}
		else if(dir == DIR.DOWN){$y($y()+1);}	
	}
	
	const controller = GroupedKeyboardSignals(keyCodes)
	const $x = Signal(startPosX);
	const $y = Signal(startPosY);
	const board = GridSignal(width,height)
	
	const power_none = Signal();
	const power_god = Signal();
	const power_time = Signal();
	const power_god_duration = 5000;
	const power_time_duration = 5000;
	
	const power = BranchingSignal(POWER.NONE,{
		[POWER.TIME]:()=>{
			power_time(true);
			tick.pause(true);
			setTimeout(()=>power(POWER.NONE),power_time_duration);
		}
	,	[POWER.GOD]:()=>{
			power_god(true);
			setTimeout(()=>power(POWER.NONE),power_god_duration);
		}
	,	_:()=>{
			power_none(true);
			power_god(false);
			power_time(false);
			tick.pause(false);
		}
	});
	
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

	const whenTimePowerUp = Signal([power_time,direction],function([on,direction]){
		if(on){
			applyDirection();
		}
	});

	const tick = TickSignal(loopInterval).add(applyDirection);
	
	const apples = Signal(0,function(n){
		const [x,y] = getEmptyCell(board());
		board([CELLS.APPLE,x,y]);
		if(n > 1){
			const timer = loopInterval - n * 10;
			tick.delay(timer);
			setSoundSpeed(timer)
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
	,	[STATE.DEAD]:()=>{tick.pause(true);deadGrid();}
	});

	const buffer = [];
	
	const snake = Signal([$x,$y],function(coordinates,previous){
		
		if(state() != STATE.PLAYING){return previous;}
		
		const god = power_god();
		
		const [x,y] = coordinates;
		
		const grid = board();
		
		const cell = grid[y] && grid[y][x];
		
		const isDeadly = isDeadlyCell(cell);
		const isOutOfBounds = cellIsOutOfBounds(x,y,width,height);
		
		if(isDeadly || isOutOfBounds){			
			if(!god){
				state(STATE.DEAD);
				return previous;
			}
			if(isDeadly){
				board([CELLS.EMPTY,x,y]);
			}
			else if(isOutOfBounds){
				if(x < 0){
					$x(width-1);
				}
				else if(y < 0){
					$y(height-1);
				}
				else if(x >= width){
					$x(0);
				}
				else if(y >= height){
					$y(0);
				}
				return previous;
			}
		}		
		
		const _apples = apples();
		
		if(cell == CELLS.APPLE){
			apples(_apples+1);
			power(POWER.GOD);
			sound('pickup',true);
		}else if(previous){
			sound(getWalkSound());
		}
		
		const {length} = buffer;
		
		buffer.unshift([x,y]);
		
		buffer.forEach(([x,y],i)=>{
			const cell = (
				(i == 0) ? CELLS.HEAD :
				(i == length) ? CELLS.EMPTY : 
				CELLS.SNAKE + i - 1
			);
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
		Signal([score,highestScore,bonus,power],function([score,highestScore,bonus,power]){
			statusText.innerHTML = `score: ${score}<br/>
			highest: ${highestScore}<br/>
			bonus: ${bonus|0}<br/>
			superpower: ${power==POWER.GOD?'destroyer!':power==POWER.TIME?'frozen time!':'none'}`;
		})
		
		container.appendChild(stateText);
		container.appendChild(statusText);
		canvas.appendTo(container);
		
	},mountAt);

	sound('start');
	board.map(a=>gridToString(a,CELLSREPRESENTATION)).add(text,true);
	board.map(canvas);
};