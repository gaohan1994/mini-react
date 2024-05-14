const supportedSymbol = typeof Symbol === 'function' && Symbol.for;

export const REACT_ELEMENT_TYPE = supportedSymbol
	? Symbol.for('react.element')
	: 0xeac7;