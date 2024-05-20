import { Action } from 'shared/ReactTypes';

export type Dispatcher = {
	useState: <T>(initialState: T | (() => T)) => [T, Dispatch<T>];
};

export type Dispatch<State> = (action: Action<State>) => void;

/**
 * 实现 useState
 * 要区分 Mount Update 等不同阶段
 * 还要区分是否在 hook 中执行 hook，如useEffect中不可执行 setState
 * 就需要再 reconcile 中实现这套逻辑，
 * 但是又因为 useState 是再 react 包中导出的
 * 所以我们需要创建一个数据共享层
 */
export const currentDispatcher: { current: Dispatcher | null } = {
	current: null
};

export const resolveDispatcher = () => {
	const dispatcher = currentDispatcher.current;

	if (dispatcher === null) {
		throw new Error('hook 只可以在 FC 组件下运行');
	}

	return dispatcher;
};
