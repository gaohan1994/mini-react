export type Key = any;
export type Ref = any;
export type Props = any;
export type Type = any;
export type ElementType = any;
export interface ReactElementType {
	$$typeof: symbol | number;
	key: Key;
	ref: Ref;
	props: Props;
	type: ElementType;
}

export type Action<State> = State | ((prevState: State) => State);
