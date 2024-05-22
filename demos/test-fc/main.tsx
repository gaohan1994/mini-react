import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

const App = () => {
	const [num, setNum] = useState(1);
	return <div onClickCapture={() => setNum(num + 1)}>{num}</div>;
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
