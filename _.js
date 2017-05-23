'use strict';

/**
 * @module  _
 * Utilities
 */ 

 const isFunction = (function(){
	const toString = Object.prototype.toString,
		  FSTRING = toString.call(()=>_)
		  ;

	return  (f)=> Boolean(f) && toString.call(f) === FSTRING;
})();

function isObject( o ){
	return Boolean(o)
		  && !(o instanceof String)
		  && !isFunction(o)
		  && Object( o ) === o
		  ;
}

/**
 * Return an array with n elements set to value;
 * If a value provider fcn is supplied for the value param, it will
 * be invoked for each element.  The fcn is passed all the array
 * parameters supplied by Array.prototype.map
 *
 * @param n
 * @param {*|Function} value
 * @return {*}
 */
function fillArray(n,value /*value or fcn*/){
	if(n<1){return [];}

	if(isFunction(value)){
		let mapFcn=value;
		return Array(n).fill().map((...args)=>mapFcn(...args));
	}

	return Array(n).fill(value);
}

/**
 * Shallow copy of enumerable, own properties onto the target object
 * Copies full descriptors - that is it includes properties
 * indexed by Symbols and get/set accessors.  
 *
 * Properties are assigned from left to right. The rightmost source
 * overwrites those to the left of it.
 *
 * developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
 *
 * @param target
 * @param sources
 * @return {Object}
 */
function completeAssign(target, ...sources) {

  sources.forEach(src => {

    const descriptors = Object.keys(src).reduce((desc, key) => {
      desc[key] = Object.getOwnPropertyDescriptor(src, key);
      return desc;
    }, {});

    // by default, Object.assign copies enumerable Symbols too
    Object.getOwnPropertySymbols(src).forEach(sym => {
      const desc = Object.getOwnPropertyDescriptor(src, sym);
      if (desc.enumerable) { descriptors[sym] = desc; }
    });

    Object.defineProperties(target, descriptors);
  });

  return target;
}


/**
 * Extended version of Object.create.  Copies properties of the mixin
 * objects onto the new prototype.  Uses completeAssign.
 *
 * @param proto
 * @param mixins
 * @return {Object}
 */
function createObject(proto,...mixins){
	const o = Object.create(proto);
	return completeAssign(o,...mixins);
}

/**
 * Utility to print the results from one of the random object generateros
 *
 * @param node
 * @param depth - do not assign a value in the top level call.
 * @return {string}
 */
function printNode(node, depth=0){
	const indent = ' '.repeat(depth*3);
	let str = Object.keys(node).reduce((pv,key)=>{
		let val = node[key];
		pv+= `\n  ${indent}${key}: ${isObject(val)? printNode(val,depth+1):val.toString()}`;
		return pv;
	},'');

	return  Array.isArray(node)?  str.length>0?`[${str} \n${indent}]`:'[]'
										:  str.length>0?`{${str} \n${indent}}`:'{}'
										;
}

module.exports = {
			isObject,
			isFunction,
			fillArray,
			completeAssign,
			createObject,
			printNode
 };
