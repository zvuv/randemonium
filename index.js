'use strict';

/**
 *@module ranTree
 */

const _=require('./_'),
		rand = Math.random
		;

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
		  cdf = cumWts.map(w=>w*p)//normalize
		  ; 

	return function(){
		const r = rand(),
		index = cdf.findIndex(e=>e>r)
		; 

		return array[index];
	};

}

function RanCall(context, funcs,wts){
	if(!funcs.every(_.isFunction)){
		throw new TypeError (`non function value in funcs array`);
	}

	const ranFunc=RanElement(funcs,wts);

	return function(...args){
		const func = ranFunc();
		return func.call(context, ...args);
	};
}

const BaseNodeMaker ={
	maxDepth     : 5,
	maxWidth     : 5,
	propName:RanStr(),

	Builder( depth ){ 
		const node = this.EmptyNode(),
		addChild = this.AddChild(node)
		;

		if(depth>0){ 
			const nProps = rand()*this.maxWidth;
			for( let j = 0; j < nProps; j++ ){ 
				addChild(this.propName(),this.NewChild(depth-1));
			}
		}

		return node;
	},
	
	//this method redefines itself.......................
	NewChild(depth){ 
		const ranChild = RanCall( this, this.children, this.childWeights );

		this.NewChild =  (depth)=>ranChild(depth);
		return ranChild(depth);
	},
	NewChildren(n, depth){
		const ranChild = RanCall( this, this.children, this.childWeights );
		
		this.NewChildren = function(n,depth){
			return Array(n)
							.fill()
							.map(()=>ranChild(depth))
							;
		};
	},

	
	//.......................................................
	//These properties are required by builder and newchild and 
	//must be overriden by the application
	//.......................................................
	AddChildren(node){
		throw new ReferenceError('method AddChild is not implemented');
	},
	AddChild(node){
		throw new ReferenceError('method AddChild is not implemented');
	},
	EmptyNode(){
		throw new ReferenceError('method EmptyNode is not implemented');
	}, 
	 get children(){
		throw new ReferenceError('property children is not implemented');
	 },
	 get childWeights(){
		throw new ReferenceError('property childWeights is not implemented');
	 }
};

const ObjNodeMaker={
	 get children(){
		return [this.Builder,RanInt(), RanStr(),RanBool(),RanDateStr()];
	} ,
	childWeights:[3,1,1,1,1] ,//[] for uniform weights

	AddChildren(node){
		return (function(nChildren, depth){
			Array(nChildren).fill().map();
		}).bind(node);
	},
	AddChild(node){
		return (function(key,value){ node[key]=value; }).bind(node);
	},

	EmptyNode(){ return Object.create(null);}
};

function RanObj(config={}){
	const proto = _.createObject(BaseNodeMaker,ObjNodeMaker),
			NodeBuilder= _.createObject(proto,config)
	;

	return ()=>NodeBuilder.Builder(NodeBuilder.maxDepth-1);
}

module.exports = {RanObj, RanBool, RanStr,RanInt,RanDateStr,RanElement};

