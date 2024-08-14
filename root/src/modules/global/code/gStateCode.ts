import IState from "../../interfaces/IState";


// This is where all alerts to data changes should be made
const gStateCode = {

    cloneState: (state: IState): IState => {

        let newState: IState = { ...state };

        return newState;
    }
};

export default gStateCode;

