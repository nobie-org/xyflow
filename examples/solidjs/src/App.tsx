import type { Component } from 'solid-js';

import styles from './App.module.css';
import BasicFlow from './SimpleExample';
import { BasicExample } from './BasicExample';

const App: Component = () => {
  return (
    <div class={styles.App}>
      <BasicExample/>
        {/* <BasicFlow/> */}
    </div>
  );
};

export default App;
