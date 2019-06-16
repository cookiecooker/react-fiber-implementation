import { createFiber } from './createFiber'

const PLACEMENT = 1
const DELETION = 2
const UPDATE = 3

function arrayfiy(val) {
    return val === null ? [] : Array.isArray(val) ? val : [val]
}

function placeChild(currentFiber, newChild) {

}

function reconcileChildrenArray(currentFiber, newChildren) {

    // mark as 'updated' for same node
    // mark as 'replace' for different node
    // mark as 'delete' for redundant node

    const arrayfiyChildren = arrayfiy(newChildren)

    let index = 0
    let oldFiber = currentFiber.alternate ? currentFiber.alternate.child : null
    let newFiber = null

    while (index < arrayfiyChildren.length || oldFiber != null) {
        const prevFiber = newFiber
        const newChild = arrayfiyChildren[index]
        const isSameFiber = oldFiber && newChild && newChild.type === oldFiber.type

        if (isSameFiber) {
            newFiber = {
                type: oldFiber.type,
                tag: oldFiber.tag,
                stateNode: oldFiber.stateNode,
                props: newChild.props,
                return : currentFiber,
                alternate: oldFiber,
                partialState: oldFiber.partialState,
                effectTag: UPDATE
            }
        }

        if (!isSameFiber && oldFiber) {

        }
    }
}


export {
    placeChild,
    reconcileChildrenArray
}