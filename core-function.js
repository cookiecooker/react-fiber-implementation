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
            newFiber = placeChild(currentFiber, newChild)
        }

        if (!isSameFiber && oldFiber) {
            // the number of new nodes is less than that of old nodes
            // put changed effect to current node's list
            oldFiber.effectTag = DELETION
            currentFiber.effects = currentFiber.effects || []
            currentFiber.effects.push(oldFiber)
        }

        if (oldFiber) {
            oldFiber = oldFiber.sibling || null
        }

        if (index === 0) {
            currentFiber.child = newFiber
        } else if (prevFiber && newChild) {
            prevFiber.sibling = newFiber
        }

        index++
    }
    return currentFiber.child
}

function commitAllwork(topFiber) {
    topFiber.effects.forEach(f => {
        commitWork(f)
    })

    topFiber.stateNode._rootContainerFiber = topFiber
    topFiber.effects = []
    nextUnitOfWork = null
    pendingCommit = null
}

function commitWork(effectFiber) {
    if (effectFiber.tag === tag.HostRoot) {
        // do nothing for root node
        return
    }

    let domParentFiber = effectFiber.return
    while (domParentFiber.tag === tag.ClassComponent || domParentFiber.tag === tag.FunctionalComponent) {
        domParentFiber = domParentFiber.return
    }

    const domParent = domParentFiber.stateNode
    if (effectFiber.effectTag === PLACEMENT) {
        if (effectFiber.tag === tag.HostComponent || effectFiber.tag === tag.HostText) {
            domParent.appendChild(effectFiber.stateNode)
        }
    } else if (effectFiber.effectTag === UPDATE) {
        //update logic
    } else if (effectFiber.effectTag === DELETION) {
        commitDeletion(effectFiber, domParent)
    }
}


export {
    placeChild,
    reconcileChildrenArray
}