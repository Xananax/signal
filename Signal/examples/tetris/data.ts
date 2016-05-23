/// <reference path="./definitions.d.ts" />

export const pieces = {
	i:{blocks:[0x0F00,0x2222,0x00F0,0x4444],color:'i'}
,	j:{blocks:[0x44C0,0x8E00,0x6440,0x0E20],color:'j'}
,	l:{blocks:[0x4460,0x0E80,0xC440,0x2E00],color:'l'}
,	o:{blocks:[0xCC00,0xCC00,0xCC00,0xCC00],color:'o'}
,	s:{blocks:[0x06C0,0x8C40,0x6C00,0x4620],color:'s'}
,	t:{blocks:[0x0E40,0x4C40,0x4E00,0x4640],color:'t'}
,	z:{blocks:[0x0C60,0x4C80,0xC600,0x2640],color:'z'}
}

export enum DIR{
	UP=0
,	LEFT=1
,	RIGHT=2
,	DOWN=3
}

export const KEYS = {
	LEFT:37
,	UP:38
,	RIGHT:39
,	DOWN:40
,	SPACE:32
}