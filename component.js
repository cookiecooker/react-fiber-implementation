import { scheduleWork } from "./life-cycle-functions";

export class Component {
    constructor(props, context) {
        this.props = props
        this.context = context
        this.state = this.state || {}
        this.refs = {}
        this.updater = {}
    }

    setState(updater) {
        scheduleWork(this, updater)
    }

    render() {
        throw 'render function'
    }
}

Component.prototype.isReactComponent = true