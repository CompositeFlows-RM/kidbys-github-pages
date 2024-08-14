

const initEvents = {

    onRenderFinished: () => {

        // comparisonOnRenderFinished.setUp();
    },

    registerGlobalEvents: () => {

        window.onresize = () => {

            initEvents.onRenderFinished();
        };

        // document.onmousemove = (_event: MouseEvent): boolean => {

        //     let handled = comparisonOnRenderFinished.setUpMouseMoveHandlers();

        //     if (handled) {

        //         return false;
        //     }

        //     return true;
        // };
    }
};

export default initEvents;


