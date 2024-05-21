import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

const App = () => {
	const [num, setNum] = useState(1);
	window.setNum = setNum;
	return num === 3 ? <Child /> : <div>{num}</div>;
};

const Child = () => {
	return <div>child</div>;
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
