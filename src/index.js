import { h, app } from "hyperapp";
import state from "./state";
import actions from "./actions";
import view from "./view";

import "./styles.css";

const { init } = app(state, actions, view, document.body);
init();