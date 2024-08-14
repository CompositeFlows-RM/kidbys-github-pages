// import { h} from "../../../../definitions/hyper-app-local";
import { VNode } from "hyper-app-local";
import { h } from "../../../../hyperApp/hyper-app-local";

import IState from "../../../interfaces/IState";
import elementViews from "./elementViews";
import pentSideActions from "../actions/pentSideActions";


const buildPageBackwards = (_state: IState): VNode => {

    const view =

        h("a",
            {
                onClick: pentSideActions.previousPage,
            },
            [
                h("div", { class: "page-backwards-icon" }, "")
            ]
        );

    return view;

};

const buildPageForwards = (state: IState): VNode | null => {

    if (state.currentPageIndex >= state.pages.length - 1) {

        return null;
    }

    const view =

        h("a",
            {
                onClick: pentSideActions.nextPage,
            },
            [
                h("div", { class: "page-forwards-icon" }, "")
            ]
        );

    return view;

};

const pentSidePagesView = {

    buildPageView: (state: IState): VNode | null => {

        const currentPage = state.pages[state.currentPageIndex];

        if (!currentPage.value
            || !Array.isArray(currentPage.value)
        ) {

            return null;
        }

        const view: VNode =

            h("div", { id: "stepView" }, [
                h("div", { class: "step-discussion" }, [
                    h("div", { class: "discussion" }, [
                        h("h4", { class: "title-text" }, "Pent side"),
                        h("div", { id: "inputView" }, [
                            h("div", { class: "nft-i-pattern" }, [
                                h("div", { class: "nft-i-page" }, [

                                    elementViews.buildView(currentPage.value)
                                ])
                            ])
                        ])
                    ])
                ]),
                h("div", { class: "step-page-buttons" }, [
                    h("div", { class: "page-backwards" },

                        buildPageBackwards(state)
                    ),
                    h("div", { class: "page-forwards" },

                        buildPageForwards(state)
                    )
                ])
            ]);

        return view;
    }
};

export default pentSidePagesView;

