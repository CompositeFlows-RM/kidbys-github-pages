import { VNode } from "hyper-app-local";
import { h } from "../../../../hyperApp/hyper-app-local";
import pentSideActions from "../actions/pentSideActions";
import IState from "../../../interfaces/IState";
import inputViews from "./inputViews";


const buildShowHideButton = (state: IState): VNode => {

    let label: string;

    if (!state.showDefaults) {

        label = 'Show defaults';
    }
    else {
        label = 'Hide defaults';
    }

    const view: VNode =

        h("button",
            {
                type: "button",
                onClick: pentSideActions.minimiseDefaults,
            },
            `${label}`
        );

    return view;
};

const buildInputsView = (state: IState): VNode[] => {

    const view: VNode[] = [

        inputViews.buildNumberView(
            'maxStudDistance',
            state.pent.maxStudDistance,
            true,
            'Max inter-stud distance (mm)',
            'Max inter-stud distance',
            state.pent.maxStudDistanceError,
            pentSideActions.setMaxStudDistance
        ),

        inputViews.buildNumberView(
            'framingSizePivot',
            state.pent.framingSizePivot,
            true,
            'Framing pivot standard to heavy (mm)',
            'Framing pivot standard to heavy',
            state.pent.framingSizePivotError,
            pentSideActions.setFramingSizePivot
        ),

        inputViews.buildNumberView(
            'floorOverhangStandard',
            state.pent.floorOverhangStandard,
            true,
            'Panel floor overhang (mm)',
            'Panel floor overhang',
            state.pent.floorOverhangStandardError,
            pentSideActions.setFloorOverhangStandard
        ),

        inputViews.buildNumberView(
            'floorOverhangHeavy',
            state.pent.floorOverhangHeavy,
            true,
            'Heavy duty panel floor overhang (mm)',
            'Heavy duty floor overhang',
            state.pent.floorOverhangHeavyError,
            pentSideActions.setFloorOverhangHeavy
        ),

        inputViews.buildNumberView(
            'shiplapBottomOverhang',
            state.pent.shiplapBottomOverhang,
            true,
            'Shiplap bottom overhang (mm)',
            'Shiplap bottom overhang',
            state.pent.shiplapBottomOverhangError,
            pentSideActions.setShiplapBottomOverhang
        ),

        inputViews.buildNumberView(
            'maxPanelLength',
            state.pent.maxPanelLength,
            true,
            'Max side length (mm)',
            'Max side length',
            state.pent.maxPanelLengthError,
            pentSideActions.setMaxPanelLength
        ),
    ];

    return view;
};

const buildMinimisedView = (state: IState): VNode => {

    const view: VNode =

        h("div", { class: "nft-collapse-group minimised" }, [

            buildShowHideButton(state)
        ]);

    return view;
};

const buildMaximisedView = (state: IState): VNode => {

    const view: VNode =

        h("div", { class: "nft-collapse-group" }, [

            buildShowHideButton(state),
            ...buildInputsView(state)
        ]);

    return view;
};

const defaultViews = {

    buildView: (state: IState): VNode | null => {

        if (!state.showDefaults) {

            return buildMinimisedView(state);
        }
        else {
            return buildMaximisedView(state);
        }
    }
};

export default defaultViews;

