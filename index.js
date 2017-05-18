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

function RanInt( nDigits = 6 ){
	return function(){
		return Math.floor( rand()*Math.pow( 10, nDigits ) );
	};
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

const BaseNodeMaker = {
	get baseNode(){ return BaseNodeMaker;},
	maxDepth: 5,
	maxWidth: 5,
	propName: RanStr(),

	Builder( depth ){
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
	//These properties are required by builder and newchild and 
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

const ObjNodeMaker = {
	get objNode(){return ObjNodeMaker; },
	//
	// List of factory functions for random selection
	get childList(){
		return [this.Builder, RanInt(), RanStr(), RanBool(), RanDateStr()];
	},
	// Weight the selection from  'childList'
	childWeights: [3, 1, 1, 1, 1],//[] for uniform weights

	newChildren( n, depth ){
		const ranChild = RanCall( this, this.childList, this.childWeights );

		this.newChildren = function( n, depth ){
			//return n>0? Array(n).fill().map(()=>ranChild(depth)): [] ;
			return _.arrayMapFill( n, () => ranChild( depth ) );
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
};

function RanObj( config = {} ){
	const proto = _.createObject( BaseNodeMaker, ObjNodeMaker ),
		  NodeBuilder = _.createObject( proto, config )
		  ;

	return () => NodeBuilder.Builder( NodeBuilder.maxDepth-1 );
}

function RanTree( config = {} ){
	config.addChildren = function( node, children ){node.children = children;};

	const ranName = RanStr();
	config.EmptyNode = function(){
		const node = this.objNode.EmptyNode();
		node.name = ranName();
		return node;
	};

	return RanObj( config );
}

module.exports = { RanObj, RanTree, RanBool, RanStr, RanInt, RanDateStr, RanElement };

