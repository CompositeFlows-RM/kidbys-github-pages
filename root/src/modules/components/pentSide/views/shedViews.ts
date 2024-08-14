import { VNode } from "hyper-app-local";
import { h } from "../../../../hyperApp/hyper-app-local";
import pentSideActions from "../actions/pentSideActions";
import IState from "../../../interfaces/IState";
import inputViews from "./inputViews";


const shedViews = {

    buildView: (state: IState): VNode | null => {

        const view: VNode =

            h("div", { class: "nft-display-group" }, [
                h("h4", { class: "label" }, "Shed"),
                h("div", { class: "display-contents" }, [

                    inputViews.buildNumberView(
                        'floorDepth',
                        state.pent.floorDepth,
                        true,
                        'Floor depth (mm)',
                        'Floor depth',
                        state.pent.floorDepthError,
                        pentSideActions.setFloorDepth
                    ),

                    inputViews.buildNumberView(
                        'frontHeight',
                        state.pent.frontHeight,
                        true,
                        'Front height (mm)',
                        'Front height',
                        state.pent.frontHeightError,
                        pentSideActions.setFrontHeight
                    ),

                    inputViews.buildNumberView(
                        'backHeight',
                        state.pent.backHeight,
                        true,
                        'Back height (mm)',
                        'Back height',
                        state.pent.backHeightError,
                        pentSideActions.setBackHeight
                    ),

                    inputViews.buildSelectView(
                        `${state.pent.sideCount}`,
                        'Side build count',
                        'side build count',
                        ['1', '2'],
                        pentSideActions.setSideCount
                    ),
                ])
            ]);

        return view;
    }
};

export default shedViews;

