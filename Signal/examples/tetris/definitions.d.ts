interface Row extends Array<number>{}
interface Grid extends Array<Row>{}
interface RandomFunc{():number}
interface Piece{
	blocks:number[];
	color:string;
}
interface Pieces{
	i:Piece;
	j:Piece;
	l:Piece;
	o:Piece;
	s:Piece;
	t:Piece;
	z:Piece;
}
interface RandomPieceProvider{
	():Piece;
} 