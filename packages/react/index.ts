import { resolveDispatcher, currentDispatcher } from './src/currentDispatcher';
import { jsxDEV } from './src/jsx';

export const useState = <T>(initialState: T) => {
	const dispatcher = resolveDispatcher();
	return dispatcher.useState(initialState);
};

// 数据共享层
export const _SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_ = {
	currentDispatcher
};

export default {
	version: '0.0.1',
	createElement: jsxDEV,
	useState
};
