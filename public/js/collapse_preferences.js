export default class CollapsePreferences {
    constructor(component, reactFunction = false) {
        this.component = component;
        this.collapsePreferences = JSON.parse(localStorage.getItem('collapsePreferences')) || [];
        this.isReactFunction = reactFunction;
    }

    toggleCollapse() {
        let currentlyCollapsed = false;

        if (this.isReactFunction) {
            currentlyCollapsed = this.component.collapsed;
            this.component.setCollapsed(!currentlyCollapsed);
        } else {
            currentlyCollapsed = this.component.state.collapsed;
            this.component.setState({ collapsed: !currentlyCollapsed });
        }

        let collapsePreferences = JSON.parse(localStorage.getItem('collapsePreferences')) || [];

        if (currentlyCollapsed) {
            localStorage.setItem('collapsePreferences', JSON.stringify(collapsePreferences.filter((name) => name !== this.component.name)));
        } else {
            let uniqueCollapsePreferences = [... new Set(collapsePreferences.concat([this.component.name]))];
            localStorage.setItem('collapsePreferences', JSON.stringify(uniqueCollapsePreferences));
        }
    }

    preferenceStoredAsCollapsed() {
        return this.collapsePreferences.includes(this.component.name);
    }

    renderCollapseIcon() {
        if (this.isReactFunction) {
            return this.component.collapsed ? this.plusIcon() : this.minusIcon();
        } else {
            return this.component.state.collapsed ? this.plusIcon() : this.minusIcon();
        }
    }

    minusIcon() {
        return <i className="print:!hidden fa-regular fa-square-minus"></i>;
    }

    plusIcon() {
        return <i className="print:!hidden fa-regular fa-square-plus"></i>;
    }
}
