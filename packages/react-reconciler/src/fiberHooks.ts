import { FiberNode } from './fiber';

/**
 * 调用函数组件,并返回子组件
 * @param wip
 */
export const renderWithHooks = (wip: FiberNode) => {
	const Component = wip.type;
	const props = wip.pendingProps;
	const children = Component(props);
	return children;
};
