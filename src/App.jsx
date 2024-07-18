import React from 'react';
import Flights from './components/Flights';

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Aviation Stack Information</h1>
      </header>
      <main>
        <Flights />
      </main>
    </div>
  );
};

export default App;
