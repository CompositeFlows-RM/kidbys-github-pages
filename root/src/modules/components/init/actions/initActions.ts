import IState from "../../../interfaces/IState";
import IStateAnyArray from "../../../interfaces/IStateAnyArray";


const initActions = {

    checkKeyUp: (
        state: IState,
        _keyEvent: KeyboardEvent): IStateAnyArray => {

        // if (keyEvent.code === 'ShiftLeft'
        //     || keyEvent.code === 'ShiftRight') {

        //     window.TreeSolve.screen.shiftKey = false;
        // }

        return state;
    }

};

export default initActions;
