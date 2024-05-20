import { ReactElementType } from 'shared/ReactTypes';
import { resolveDispatcher, currentDispatcher } from './src/currentDispatcher';
import { jsxDEV, jsx, isValidElement } from './src/jsx';
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';

export const useState = <T>(initialState: T) => {
	const dispatcher = resolveDispatcher();
	return dispatcher.useState(initialState);
};

// 数据共享层
export const _SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_ = {
	currentDispatcher
};

export const version = '0.0.1';

// todo 根据环境区分 jsx 还是 jsxDEV
export const createElement = jsx;

export { isValidElement };
