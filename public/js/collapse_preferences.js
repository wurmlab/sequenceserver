export default class CollapsePreferences {
    constructor(component, defaultCollapsed = false) {
        this.component = component;
        this.defaultCollapsed = defaultCollapsed;
        this.collapsePreferences = JSON.parse(localStorage.getItem('collapsePreferences')) || [];
    }

    toggleCollapse() {
        let currentlyCollapsed = this.component.state.collapsed;
        this.component.setState({ collapsed: !currentlyCollapsed });

        if (currentlyCollapsed) {
            localStorage.setItem('collapsePreferences', JSON.stringify(this.collapsePreferences.filter((name) => name !== this.component.name)));
        } else {
            let uniqueCollapsePreferences = [... new Set(this.collapsePreferences.concat([this.component.name]))];
            localStorage.setItem('collapsePreferences', JSON.stringify(uniqueCollapsePreferences));
        }
    }

    preferenceStoredAsCollapsed() {
        if (this.collapsePreferences.includes(this.component.name)) {
            return true;
        }
        if (this.collapsePreferences.length === 0 && this.defaultCollapsed) {
            return true;
        }
        return false;
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
