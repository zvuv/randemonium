'use strict';

/**
 *@module run-ranTree
 */

const {RanObj, RanElement} = require('./../index'),
		{printNode}=require('./../_')
		;

// let len = 100,nSamples=100000;
// let array = Array(len).fill().map((e,i)=>i);
// let wts = Array(len).fill().map(_=>1/len);
// let counts= Array(len).fill(0);
//
// let ranElement = RanElement(array);
//
// for(let j=0; j<nSamples; j++){
// 	let ranE = ranElement();
// 	counts[ranE]=counts[ranE]+1;
// }
//
//
// counts.forEach(c=>console.log(c));
//
//obj

let ranObj = RanObj({maxDepth:10, maxWidth:10});
let o=ranObj();
console.log(printNode(o));

let x=1;

