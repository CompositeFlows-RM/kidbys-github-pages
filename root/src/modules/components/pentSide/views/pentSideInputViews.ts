// import { h} from "../../../../definitions/hyper-app-local";
import { VNode } from "hyper-app-local";
import { h } from "../../../../hyperApp/hyper-app-local";

import IState from "../../../interfaces/IState";
import defaultViews from "./defaultViews";
import shedViews from "./shedViews";
import timberViews from "./timberViews";
import pentSideActions from "../actions/pentSideActions";


const pentSideInputViews = {

    buildView: (state: IState): VNode => {

        const view: VNode =

            h("div", { id: "stepView" }, [
                h("div", { class: "step-discussion" }, [
                    h("div", { class: "discussion" }, [
                        h("h4", { class: "title-text" }, "Pent shed side calculator"),
                        h("div", { id: "inputView" }, [

                            defaultViews.buildView(state),
                            shedViews.buildView(state),
                            timberViews.buildView(state),
                        ])
                    ])
                ]),
                h("div", { class: "step-options" }, [
                    h("a",
                        {
                            class: "option",
                            onClick: pentSideActions.calculate,
                        },
                        [
                            h("p", {}, "Calculate"
                            ),
                        ]
                    )
                ])
            ]);

        return view;
    }
};

export default pentSideInputViews;

