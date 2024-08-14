import IState from "../../../interfaces/IState";
import IStateAnyArray from "../../../interfaces/IStateAnyArray";
import State from "../../../state/State";


const initState = {

    initialise: (): IStateAnyArray => {

        const state: IState = new State();

        return state;
    }
};

export default initState;

