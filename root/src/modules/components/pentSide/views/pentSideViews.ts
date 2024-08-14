// import { h} from "../../../../definitions/hyper-app-local";
import { VNode } from "hyper-app-local";

import IState from "../../../interfaces/IState";
import pentSideInputViews from "./pentSideInputViews";
import pentSidePagesView from "./pentSidePagesView";

import "../scss/pentSide.scss";
import "../scss/inputs.scss";


const pentSideViews = {

    buildView: (state: IState): VNode | null => {

        if (state.pages
            && state.pages.length > 0
            && state.currentPageIndex > -1
        ) {
            return pentSidePagesView.buildPageView(state);
        }
        else {
            return pentSideInputViews.buildView(state);
        }
    }
};

export default pentSideViews;

