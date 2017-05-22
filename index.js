'use strict';

/**
 *@module ranTree
 */

const _ = require( './_' ),
	  rand = Math.random
	  ;

function RanBool( pTrue = 0.5 ){
	return () => rand() < pTrue;
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

/**
 * Random Integer with required # digits, non zero leading
 * digit
 *
 * @param nDigits
 * @return {Function} - factory for random ints
 */
function RanDigits( nDigits = 6 ){
	const scale = Math.pow( 10, nDigits );

	return function(){
		let rnd = rand();
		while(rnd=rand(), rnd<0.1); 
		return Math.floor( rnd*scale );
	};
}

/**
 * Random integer between max & min
 * @param min
 * @param max
 * @return {function(): number} - factory for random ints.
 * @constructor
 */
function RanInt({min=0,max=1000}={}){
	const diff=max-min;
	return ()=>Math.floor(min+rand()*diff);
}

function RanDateStr( { start = new Date( '01/01/1000' ), end = new Date( '01/01/3000' ) }={} ){
	const startMs = start.getTime(),
		  spanMs = end.getTime()-startMs
		  ;
	return function(){
		const d = new Date( startMs+rand()*spanMs ),
			  [year,month,day] = d.toJSON().split( /-|T/ )
			  ;

		return `${month}/${day}/${year}`;
	};
}

/**
 *
 * @param array
 * @param weights
 * @return {Function}
 * @constructor
 */
function RanElement( array, weights ){
	if( !(array && array.length ) ){
		throw new RangeError( 'array parameter undefined or empty' );
	}

	const len = array.length;

	//uniform probability weights.......................
	if( !(weights && weights.length) ){
		return function(){
			const index = Math.floor( rand()*len );
			return array[index];
		};
	}

	if( weights.length !== len ){
		throw new RangeError( 'weights array and elements array must be the same length' );
	}

	//build a cumulative density function vector  (cdf)
	const summer = { sum: 0 },
		  cumWts = weights.map( function( w ){ return this.sum += w;}, summer ),
		  p = 1/summer.sum,
		  cdf = cumWts.map( w => w*p )//normalize
		  ;

	return function(){
		const r = rand(),
			  index = cdf.findIndex( e => e > r )
			  ;

		return array[index];
	};

}

/**
 *
 * @param context
 * @param funcs
 * @param wts
 * @return {Function}
 * @constructor
 */
function RanCall( context, funcs, wts ){
	if( !funcs.every( _.isFunction ) ){
		throw new TypeError( `non function value in funcs array` );
	}

	const ranFunc = RanElement( funcs, wts );

	return function( ...args ){
		const func = ranFunc();
		return func.call( context, ...args );
	};
}

/**
 * Base prototype for random objects generator.
 * @type {{baseNode, maxDepth: number, maxWidth: number, propName: *, NodeMaker: ((depth)), addChildren: ((node, list)), newChildren: ((nChildren, depth)), EmptyNode: (()), childList, childWeights}}
 */
const baseNodeProto = {
	get baseNode(){ return baseNodeProto;},
	maxDepth: 5,
	maxWidth: 5,
	propName: RanStr(),

	NodeMaker( depth ){
		const node = this.EmptyNode();

		if( depth > 0 ){
			const nProps = Math.round( rand()*this.maxWidth ),
				  children = this.newChildren( nProps, depth-1 )
				  ;
			this.addChildren( node, children );
		}

		return node;
	},

	//.......................................................
	//These properties are required by NodeMaker and newchild and 
	//must be overriden by the application
	//.......................................................

	addChildren( node, list ){
		throw new ReferenceError( 'method AddChild is not implemented' );
	},

	// Generate a list of child nodes
	newChildren( nChildren, depth ){
		throw new ReferenceError( 'method newChildren is not implemented' );
	},

	// Factory for new, empty nodes
	EmptyNode(){
		throw new ReferenceError( 'method EmptyNode is not implemented' );
	},

	// List of factory functions for random selection
	// Used by newChildren
	get childList(){
		throw new ReferenceError( 'property childList is not implemented' );
	},
	//
	// Weight the selection from  'childList'
	// Used by newChildren
	get childWeights(){
		throw new ReferenceError( 'property childWeights is not implemented' );
	}
};

/**
 *  Factory Factory Factory.
 *  Returns a factory factory function that accepts a configuration object
 *  and returns factory function that makes random objects
 * @param proto
 * @return {Function}
 * @constructor
 */
function Init( proto ){

	/**
	 * Factory Factory
	 */
	return function( config = {} ){
		const obj = _.createObject( proto, config ),
			  depth = obj.maxDepth-1
			  ;

		//Factory
		return ( _depth = depth ) => obj.NodeMaker( _depth );
	};
}

/**
 * RanObj  - generates a random object whose properties are randomly selected
 *  from  childList
 * @type {Object}
 */
const objNodeProto = _.createObject( baseNodeProto, {

	get objNode(){return objNodeProto; },
	//
	// List of factory functions for random selection
	get childList(){
		return [this.NodeMaker, RanDigits(), RanStr(), RanBool(), RanDateStr()];
	},
	// Weight the selection from  'childList'
	childWeights: [3, 1, 1, 1, 1],//[] for uniform weights

	newChildren( n, depth ){
		const ranChild = RanCall( this, this.childList, this.childWeights );

		this.newChildren = function( n, depth ){
			//return n>0? Array(n).fill().map(()=>ranChild(depth)): [] ;
			return _.fillArray( n, () => ranChild( depth ) );
		};

		return this.newChildren( n, depth );
	},

	addChildren( node, children ){
		const propName = RanStr();

		this.addChildren = function( node, children ){
			children.forEach( child => node[propName()] = child );
		};

		this.addChildren( node, children );
	},

	EmptyNode(){ return Object.create( null );}
} );

/**
 * Factory Factory.  Accepts a configuration object
 * and returns a factory function that generates random
 * objects
 * @type {Function}
 */
const RanObj = Init( objNodeProto );

/**
 * Random Tree.  Nodes have a name property and an array of
 * child nodes.  Child nodes are generated by functions
 * randomly selected from chidlList
 *
 * @type {Object}
 */
const treeNodeProto = _.createObject( objNodeProto, {
	addChildren: function( node, children ){node.children = children;},

	EmptyNode: function(){
		const ranName = RanStr(),
			  baseEmptyNode = this.objNode.EmptyNode;

		this.EmptyNode = function(){
			const node = baseEmptyNode();
			node.name = ranName();
			return node;
		};

		return this.EmptyNode();
	}
} );

/** Factory Factory.  Accepts a configuration object
 * and returns a factory function that generates random
 * objects
 */
const RanTree = Init( treeNodeProto );


/**
 *
 */
const arrayNodeProto = _.createObject(objNodeProto,{
	EmptyNode(){ return [];},

	addChildren(node,children){ 
		if(!(children && children.length)){return;}

		node.push(...children);
	},

	get childList(){
		const {maxDepth,maxWidth}=this,
				ranObj=RanObj({maxDepth,maxWidth}),
				// list = this.objNode.childList.concat([ranObj])//new array
				list =  [this.NodeMaker, ranObj, RanDigits(), RanStr(), RanBool(), RanDateStr()];
				;
		Object.defineProperty(this,'childList',{value:list});
		return this.childList;
	},
	childWeights:[5,3,1,1,1,1]
});

const RanArray = Init(arrayNodeProto);

module.exports = { RanObj, RanTree, RanArray, RanBool, RanStr, RanInt, RanDigits, RanDateStr, RanElement };

