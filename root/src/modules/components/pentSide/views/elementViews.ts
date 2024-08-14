import { Children } from "hyper-app-local";
import { h } from "../../../../hyperApp/hyper-app-local";
import IViewElement from "../../../interfaces/IViewElement";


const buildPatternView = (
    views: Children[],
    node: IViewElement): void => {

    if (node.value) {

        if (Array.isArray(node.value)) {

            views.push(
                h(
                    node.type,
                    node.properties,
                    elementViews.buildView(node.value)
                )
            );
        }
        else {
            // string
            views.push(
                h(
                    node.type,
                    node.properties,
                    node.value
                )
            );
        }
    }
}

const elementViews = {

    buildView: (viewPatterns: Array<IViewElement>): Children[] => {

        const views: Children[] = [];

        for (let i = 0; i < viewPatterns.length; i++) {

            buildPatternView(
                views,
                viewPatterns[i]
            );
        }

        return views;
    }
};

export default elementViews;

