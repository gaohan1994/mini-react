import {
	createContainer,
	updateContainer
} from 'react-reconciler/src/fiberReconciler';
import { Container } from './hostConfig';
import { ReactElementType } from 'shared/ReactTypes';

/**
 * 用法：
 * ReactDOM.createRoot(root).render(<App/>)
 */
export const createRoot = (container: Container) => {
	// 生成一个 root
	const root = createContainer(container);

	return {
		// 返回一个方法，渲染 ReactElement
		render(element: ReactElementType) {
			updateContainer(element, root);
		}
	};
};
