// import { h} from "../../../../definitions/hyper-app-local";
import { VNode } from "hyper-app-local";
import { h } from "../../../../hyperApp/hyper-app-local";

import IState from "../../../interfaces/IState";
import pentSideViews from "../../pentSide/views/pentSideViews";

import "../scss/index.scss";


const initView = {

    buildView: (state: IState): VNode => {

        const view: VNode = h("div", { id: "treeSolveAuthor" },

            pentSideViews.buildView(state),
        );

        return view;
    }
};

export default initView;

