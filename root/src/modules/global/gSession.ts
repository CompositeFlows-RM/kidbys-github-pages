const gSession = {

    // Focus
    getFocusFilter: (): string => {

        const filter: string | null = window.TreeSolve.focusFilter;

        if (!filter) {
            return '';
        }

        return filter;
    },

    setFocusFilter: (value: string): void => {

        window.TreeSolve.focusFilter = value;
    },

    clearAllFocusFilters: (): void => {

        window.TreeSolve.focusFilter = null;
    },

    removeFocusFilter: (filter: string): void => {

        const currentFilter = gSession.getFocusFilter();

        if (filter === currentFilter) {
            
            gSession.clearAllFocusFilters();
        }
    },

    // // lens Scroll top
    // getLensScrollTop: (): number => {

    //     const value: number | null = window.TreeSolve.screen.lensScrollTop;

    //     if (!value) {
                
    //         return 0;
    //     }

    //     return value;
    // },

    // setLensScrollTop: (value: number): void => {

    //     window.TreeSolve.screen.lensScrollTop = value;
    // },

    // clearLensScrollTop: (): void => {

    //     window.TreeSolve.screen.lensScrollTop = null;
    // },

    // removeLensScrollTop: (value: number): void => {

    //     const currentValue = gSession.getFocusFilter();

    //     if (`${value}` === currentValue) {
    //         gSession.clearAllFocusFilters();
    //     }
    // }

};

export default gSession;