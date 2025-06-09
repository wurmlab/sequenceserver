export default class CollapsePreferences {
    constructor(component, defaultCollapsed = false) {
        this.component = component;
        this.defaultCollapsed = defaultCollapsed;
        this.storageKey = 'sequenceServerCollapseStates';
        this.collapseStates = JSON.parse(localStorage.getItem(this.storageKey)) || {};
    }

    toggleCollapse() {
        let currentlyCollapsed = this.component.state.collapsed;
        this.component.setState({ collapsed: !currentlyCollapsed });

        this.collapseStates[this.component.name] = !currentlyCollapsed;
        localStorage.setItem(this.storageKey, JSON.stringify(this.collapseStates));
    }

    preferenceStoredAsCollapsed() {
        if (this.component.name in this.collapseStates) {
            return this.collapseStates[this.component.name];
        }
        return this.defaultCollapsed;
    }

    renderCollapseIcon() {
        return this.component.state.collapsed ? this.plusIcon() : this.minusIcon();
    }

    minusIcon() {
        return <i className="print:!hidden fa-regular fa-square-minus"></i>;
    }

    plusIcon() {
        return <i className="print:!hidden fa-regular fa-square-plus"></i>;
    }
}
