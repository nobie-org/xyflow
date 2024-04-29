import type { Component } from 'solid-js';

import styles from './App.module.css';
import BasicFlow from './SimpleExample';

const App: Component = () => {
  return (
    <div class={styles.App}>
        <BasicFlow/>
    </div>
  );
};

export default App;
