'use strict';

/**
 *@module ranTree
 */

const rand = Math.random;

/**
 * Extends Object.assign over multiple sources
 */
function assign( tgt, ...srcs ){
	srcs.forEach( src => Object.assign( tgt, src ) );
	return tgt;
}

function RanBool(pTrue=0.5){
	return ()=>rand()<pTrue;
}

function RanStr( nChars = 6 ){
	return function(){
		let str = ''; 
		while( str.length < nChars ){
			str += rand().toString( 36 ).slice( 2 );
		}
		return str.slice( 0, nChars );
	};
}

function RanInt( nDigits = 6 ){
	return function(){
		return Math.floor( rand()*Math.pow( 10, nDigits ) );
	};
}

function RanDateStr({start=new Date('01/01/1000'),end=new Date('01/01/3000')}={}){
	const startMs = start.getTime(),
		   spanMs  = end.getTime()-startMs
			;
	return function(){
		const d=new Date(startMs+rand()*spanMs),
		    [year,month,day] = d.toJSON().split(/-|T/)
		;

		return `${month}/${day}/${year}`;
	};			
}


function RanElement(array,weights){
	if( !(array && array.length )){
		throw new RangeError('array parameter undefined or empty');
	} 
	
	const len = array.length;

	//uniform probability weights.......................
	if(!(weights && weights.length)){
		return function(){
			const index = Math.floor(rand()*len);
			return array[index];
		};
	}

	if(weights.length !== len){
		throw new RangeError('weights array and elements array must be the same length');
	}

	//build a cumulative density function vector  (cdf)
	const  summer={sum:0},
		  cumWts = weights.map( function(w){ return this.sum += w;}, summer), 
		  p=1/summer.sum, 
		  cdf = cumWts.map(w=>w*p)
		  ; 

	return function(){
		const r = rand(),
		index = cdf.findIndex(e=>e>r)
		; 

		return array[index];
	};

}

function RanCall(context, funcs,wts){
	const ranFunc=RanElement(funcs,wts);

	return function(...args){
		const func = ranFunc();
		return func.call(context, ...args);
	};
}

function RanNode( depth ){

	const node = this.emptyNode(),
			addChild = this.AddChild(node)
			;

	if(depth>0){ 
		const nProps = rand()*this.maxWidth;
		for( let j = 0; j < nProps; j++ ){ 
			// node[this.propName()]=this.newChild(depth-1);
			addChild(this.propName(),this.newChild(depth-1));
		}
	}

	return node;
}

const BuilderBase ={
	maxDepth     : 5,
	maxWidth     : 5,
	nodePct      : 30,
	propName:RanStr(),
	newChild:function(depth){
		const p = this.nodePct/100;
		this.newChild = RanCall(this,[this.Builder,this.leaf], [p,1-p]); 
		return this.Builder(depth);
	},
	AddChild(node){
		return (function(key,value){ node[key]=value; }).bind(node);
	},
	emptyNode(){ return Object.create(null);},
	leaf:RanCall(null, [RanInt(), RanStr(),RanBool(),RanDateStr()] ),
	Builder:RanNode
};

 function RanObj(config={}){
 	const base = Object.create(BuilderBase),
	 	   NodeBuilder= Object.assign(base,config)
			;

 	return ()=>NodeBuilder.Builder(NodeBuilder.maxDepth-1);
 }

module.exports = {RanObj, RanBool, RanStr,RanInt,RanDateStr,RanElement};

