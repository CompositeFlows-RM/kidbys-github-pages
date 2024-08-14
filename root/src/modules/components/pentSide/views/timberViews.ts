import { VNode } from "hyper-app-local";
import { h } from "../../../../hyperApp/hyper-app-local";
import pentSideActions from "../actions/pentSideActions";
import IState from "../../../interfaces/IState";
import inputViews from "./inputViews";


const shedDisplayViews = {

    buildView: (state: IState): VNode | null => {

        const view: VNode =

            h("div", { class: "nft-display-group" }, [
                h("h4", { class: "label" }, "Timber"),
                h("div", { class: "display-contents" }, [

                    inputViews.buildNumberView(
                        'framingWidth',
                        state.pent.framingWidth,
                        true,
                        'Framing timber width (mm)',
                        'Framing timber width',
                        state.pent.framingWidthError,
                        pentSideActions.setFramingWidth
                    ),

                    inputViews.buildNumberView(
                        'framingDepth',
                        state.pent.framingDepth,
                        true,
                        'Framing timber depth (mm)',
                        'Framing timber depth',
                        state.pent.framingDepthError,
                        pentSideActions.setFramingDepth
                    ),

                    inputViews.buildNumberView(
                        'roofRailWidth',
                        state.pent.roofRailWidth,
                        true,
                        'Roof rail timber width (mm)',
                        'Roof rail timber width',
                        state.pent.roofRailWidthError,
                        pentSideActions.setRoofRailWidth
                    ),

                    inputViews.buildNumberView(
                        'roofRailDepth',
                        state.pent.roofRailDepth,
                        true,
                        'Roof rail timber depth (mm)',
                        'Roof rail timber depth',
                        state.pent.roofRailDepthError,
                        pentSideActions.setRoofRailDepth
                    ),

                    inputViews.buildNumberView(
                        'shiplapButtingWidth',
                        state.pent.shiplapButtingWidth,
                        true,
                        'Shiplap butting width (mm)',
                        'Shiplap butting width',
                        state.pent.shiplapButtingWidthError,
                        pentSideActions.setShiplapButtingWidth
                    ),

                    inputViews.buildNumberView(
                        'shiplapDepth',
                        state.pent.shiplapDepth,
                        true,
                        'Shiplap depth (mm)',
                        'Shiplap depth',
                        state.pent.shiplapDepthError,
                        pentSideActions.setShiplapDepth
                    ),
                ])
            ]);

        return view;
    }
};

export default shedDisplayViews;

