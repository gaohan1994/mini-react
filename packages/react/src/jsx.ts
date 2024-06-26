import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import {
	Type,
	Key,
	Ref,
	Props,
	ReactElementType,
	ElementType
} from 'shared/ReactTypes';

const ReactElement = function (
	type: Type,
	key: Key,
	ref: Ref,
	props: Props
): ReactElementType {
	const element = {
		$$typeof: REACT_ELEMENT_TYPE,
		key,
		ref,
		props,
		type,
		__mark: 'Gao'
	};
	return element;
};

/**
 *
 * from
 * `<div>123</div>`
 * to
 * jsx('div', {
 *  children: "123"
 * })
 */
export const jsx = (type: ElementType, config: any, ...maybeChildren: any) => {
	let key: null | string = null;
	let ref = null;
	const props: any = {};

	for (const prop in config) {
		const value = config[prop];
		if (prop === 'key') {
			if (value !== undefined) {
				key = '' + value;
			}
			continue;
		}
		if (prop === 'ref') {
			if (value !== undefined) {
				ref = value;
			}
			continue;
		}
		if ({}.hasOwnProperty.call(config, prop)) {
			props[prop] = value;
		}
	}

	const maybeChildrenLength = maybeChildren.length;
	if (maybeChildrenLength) {
		if (maybeChildrenLength === 1) {
			props.children = maybeChildren[0];
		} else {
			props.children = maybeChildren;
		}
	}

	return ReactElement(type, key, ref, props);
};

export const jsxDEV = (type: ElementType, config: any) => {
	let key: null | string = null;
	let ref = null;
	const props: any = {};

	for (const prop in config) {
		const value = config[prop];
		if (prop === 'key') {
			if (value !== undefined) {
				key = '' + value;
			}
			continue;
		}
		if (prop === 'ref') {
			if (value !== undefined) {
				ref = value;
			}
			continue;
		}
		if ({}.hasOwnProperty.call(config, prop)) {
			props[prop] = value;
		}
	}
	return ReactElement(type, key, ref, props);
};

export const isValidElement = (object: ReactElementType) => {
	return (
		typeof object === 'object' &&
		object !== null &&
		object.$$typeof === REACT_ELEMENT_TYPE
	);
};
