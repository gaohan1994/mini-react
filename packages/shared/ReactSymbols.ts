const supportedSymbol =
	typeof Symbol === 'function' && Symbol.for !== undefined;

export const REACT_ELEMENT_TYPE = supportedSymbol
	? Symbol.for('react.component')
	: 0xeac7;
