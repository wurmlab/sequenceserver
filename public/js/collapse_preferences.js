export default class CollapsePreferences {
    constructor(component) {
        this.component = component;
        this.collapsePreferences = JSON.parse(localStorage.getItem('collapsePreferences')) || [];
        const firstVisit = localStorage.getItem(`firstVisit${component.path}`) === null;

        // Set default collapse preference for 'Graphical Overview' to true only on first visit
        if (firstVisit) {
            if (this.component.name === 'Graphical Overview' && !this.collapsePreferences.includes(this.component.name)) {
                this.collapsePreferences.push(this.component.name);
                localStorage.setItem('collapsePreferences', JSON.stringify(this.collapsePreferences));
            }
            localStorage.setItem(`firstVisit${component.path}`, 'false');
        }
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
