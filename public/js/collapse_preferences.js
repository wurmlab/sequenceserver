export default class CollapsePreferences {
    constructor(component) {
        this.component = component;
        this.collapsePreferences = JSON.parse(localStorage.getItem('collapsePreferences')) || [];
    }

    toggleCollapse() {
        let currentlyCollapsed = this.component.state.collapsed;

        this.component.setState({ collapsed: !currentlyCollapsed });

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
        return this.component.state.collapsed ? this.plusIcon() : this.minusIcon();
    }

    minusIcon() {
        return <i className="print:!hidden fa-regular fa-square-minus"></i>;
    }

    plusIcon() {
        return <i className="print:!hidden fa-regular fa-square-plus"></i>;
    }
}
