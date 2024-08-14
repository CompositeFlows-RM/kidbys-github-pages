import gStateCode from "../../../global/code/gStateCode";
import IState from "../../../interfaces/IState";
import pentSideCalculationCode from "../code/pentSideCalculationCode";


const pentSideActions = {

    setFloorDepth: (
        state: IState,
        element: HTMLInputElement
    ): IState => {

        if (!element) {

            return state;
        }

        state.pent.floorDepth = +element.value;

        return gStateCode.cloneState(state);
    },

    setFrontHeight: (
        state: IState,
        element: HTMLInputElement
    ): IState => {

        if (!element) {

            return state;
        }

        state.pent.frontHeight = +element.value;

        return gStateCode.cloneState(state);
    },

    setBackHeight: (
        state: IState,
        element: HTMLInputElement
    ): IState => {

        if (!element) {

            return state;
        }

        state.pent.backHeight = +element.value;

        return gStateCode.cloneState(state);
    },

    setFramingWidth: (
        state: IState,
        element: HTMLInputElement
    ): IState => {

        if (!element) {

            return state;
        }

        state.pent.framingWidth = +element.value;

        return gStateCode.cloneState(state);
    },

    setFramingDepth: (
        state: IState,
        element: HTMLInputElement
    ): IState => {

        if (!element) {

            return state;
        }

        state.pent.framingDepth = +element.value;

        return gStateCode.cloneState(state);
    },

    setRoofRailWidth: (
        state: IState,
        element: HTMLInputElement
    ): IState => {

        if (!element) {

            return state;
        }

        state.pent.roofRailWidth = +element.value;

        return gStateCode.cloneState(state);
    },

    setRoofRailDepth: (
        state: IState,
        element: HTMLInputElement
    ): IState => {

        if (!element) {

            return state;
        }

        state.pent.roofRailDepth = +element.value;

        return gStateCode.cloneState(state);
    },

    setSideCount: (
        state: IState,
        element: HTMLSelectElement
    ): IState => {

        if (!element) {

            return state;
        }

        state.pent.sideCount = +element.value;

        return gStateCode.cloneState(state);
    },

    // setBuildPanelsTogether: (
    //     state: IState,
    //     value: boolean
    // ): IState => {

    //     if (!element) {

    //         return state;
    //     }

    //     state.pent.buildPanelsTogether = value;

    //     return gStateCode.cloneState(state);
    // },

    setShiplapBottomOverhang: (
        state: IState,
        element: HTMLInputElement
    ): IState => {

        if (!element) {

            return state;
        }

        state.pent.shiplapBottomOverhang = +element.value;

        return gStateCode.cloneState(state);
    },

    setShiplapButtingWidth: (
        state: IState,
        element: HTMLInputElement
    ): IState => {

        if (!element) {

            return state;
        }

        state.pent.shiplapButtingWidth = +element.value;

        return gStateCode.cloneState(state);
    },

    setShiplapDepth: (
        state: IState,
        element: HTMLInputElement
    ): IState => {

        if (!element) {

            return state;
        }

        state.pent.shiplapDepth = +element.value;

        return gStateCode.cloneState(state);
    },

    setMaxStudDistance: (
        state: IState,
        element: HTMLInputElement
    ): IState => {

        if (!element) {

            return state;
        }

        state.pent.maxStudDistance = +element.value;

        return gStateCode.cloneState(state);
    },

    setFramingSizePivot: (
        state: IState,
        element: HTMLInputElement
    ): IState => {

        if (!element) {

            return state;
        }

        state.pent.framingSizePivot = +element.value;

        return gStateCode.cloneState(state);
    },

    setFloorOverhangStandard: (
        state: IState,
        element: HTMLInputElement
    ): IState => {

        if (!element) {

            return state;
        }

        state.pent.floorOverhangStandard = +element.value;

        return gStateCode.cloneState(state);
    },

    setFloorOverhangHeavy: (
        state: IState,
        element: HTMLInputElement
    ): IState => {

        if (!element) {

            return state;
        }

        state.pent.floorOverhangHeavy = +element.value;

        return gStateCode.cloneState(state);
    },

    setMaxPanelLength: (
        state: IState,
        element: HTMLInputElement
    ): IState => {

        if (!element) {

            return state;
        }

        state.pent.maxPanelLength = +element.value;

        return gStateCode.cloneState(state);
    },

    minimiseDefaults: (state: IState): IState => {

        state.showDefaults = state.showDefaults !== true;

        return gStateCode.cloneState(state);
    },

    nextPage: (state: IState): IState => {

        state.currentPageIndex++;

        if (state.currentPageIndex > state.pages.length - 1) {

            state.currentPageIndex = state.pages.length - 1;
        }

        return gStateCode.cloneState(state);
    },

    previousPage: (state: IState): IState => {

        state.currentPageIndex--;

        if (state.currentPageIndex < -1) {

            state.currentPageIndex = -1;
        }
        
        return gStateCode.cloneState(state);
    },

    calculate: (state: IState): IState => {

        pentSideCalculationCode.calculate(state);
        
        return gStateCode.cloneState(state);
    }
};

export default pentSideActions;
