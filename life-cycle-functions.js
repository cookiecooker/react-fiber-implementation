const EXPIRATION_TIME = 1 //ms
let nextUnitOfWork = null
let pendingCommit = null

const tag = {
    HostComponent: 'host',
    ClassComponent: 'class',
    HostRoot: 'root',
    HostText: 6,
    FunctionalComponent: 1
}

const updateQueue = []

function performWork(deadline) {
    workLoop(deadline)
    if (nextUnitOfWork || updateQueue.length > 0) {
        window.requestIdleCallback(performWork)
    }
}

function workLoop(deadline) {

    if (!nextUnitOfWork) {
        // only one task per cycle
        nextUnitOfWork = createWorkInProgress(updateQueue)
    }

    while (nextUnitOfWork && deadline.timeRemaining() > EXPIRATION_TIME) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    }

    if (pendingCommit) {
        commitAllWork(pendingCommit)
    }
}

function render(Vnode, Container, callback) {
    updateQueue.push({
      fromTag: tag.HostRoot,
      stateNode: Container,
      props: { children: Vnode }
    })
  
    window.requestIdleCallback(performWork) //开始干活
}

function scheduleWork(instance, partialState) {
    updateQueue.push({
        fromTag: tag.ClassComponent,
        stateNode: instance,
        partialState: partialState
    })

    window.requestIdleCallback(performWork)
}

function createWorkInProgress(updateQueue) {
    const updateTask = updateQueue.shift()
    if (!updateTask) return

    if (updateTask.partialState) { // setState
        updateTask.stateNode._internalfiber.partialState = updateTask.partialState
    }

    const rootFiber = updateTask.fromTag === tag.HostRoot
        ? updateTask.stateNode._rootContainerFiber
        : getRoot(updateTask.stateNode._internalfiber)
     
    return {
        tag: tag.HostRoot,
        stateNode: updateTask.stateNode,
        props: updateTask.props || rootFiber.props,
        alternate: rootFiber // link old tree and new tree
    }    
}

function getRoot(fiber) {
    let _fiber = fiber
    while (_fiber.return) {
        _fiber = _fiber.return
    }
    return _fiber
}

//traverse the tree
function performUnitOfWork(workInProgress) {
    const nextChild = beginWork(workInProgress)
    if (nextChild) return nextChild

    // if no nextChild, check the sibling
    let current = workInProgress
    while (current) {
        //get the effect of current node and bubble up
        completeWork(current)
        if (current.sibling) return current.sibling
        //if no sibling, go to father node and check his sibling
        current = current.return 
    }
}

function beginWork(currentFiber) {
    switch (currentFiber.tag) {
        case tag.ClassComponent: {
            return updateClassComponent(currentFiber)
        }
        case tag.FunctionalComponent: {
            return updateFunctionalComponent(currentFiber)
        }
        default: {
            return updateHostComponent(currentFiber)
        }
    }
}

function updateHostComponent(currentFiber) {
    // if a fiber's stateNode is a DOM, put its children to props
    if (!currentFiber.stateNode) {
        if (currentFiber.type === null) {
            // Text Node
            currentFiber.stateNode = document.createTextNode(currentFiber.props)
        } else {
            // DOM Node
            currentFiber.stateNode = document.createElement(currentFiber.type)
        }
    }

    const newChildren = currentFiber.props.children
    return reconcileChildArray(currentFiber, newChildren)
}

function updateFunctionalComponent(currentFiber) {
    let type = currentFiber.type
    let props = currentFiber.props
    const newChildren = currentFiber.type(props)

    return reconcileChildrenArray(currentFiber, newChildren)
}

function updateClassComponent() {
    let instance = currentFiber.stateNode
    if (!instance) {
        // create a instan if it is `mount`
        instance = currentFiber.stateNode = createInstance(currentFiber)
    }

    // update current instance's state and props
    instance.props = currentFiber.props
    instance.state = { ...instance.state, ...currentFiber.partialState }

    // clear partialState
    currentFiber.partialState = null
    const newChildren = currentFiber.stateNode.render()

    // currentFiber is the old one, newChildren is the new one
    // below function will return the first one of children queue
    return reconcileChildrenArray(currentFiber, newChildren)
}

function createInstance(fiber) {
    const instance = new fiber.type(fiber.props)
    instance._internalfiber = fiber
    return instance
}

function completeWork(currentFiber) {
    if (currentFiber.tag === tag.classComponent) {
        currentFiber.stateNode._internalfiber = currentFiber
    }

    if (currentFiber.return) {
        const currentEffect = currentFiber.effects || []
        const currentEffectTag = currentFiber.effectTag ? [currentFiber] : []
        const parentEffects = currentFiber.return.effects || []
        currentFiber.return.effects = parentEffects.concat(currentEffect, currentEffectTag)
    } else {
        pendingCommit = currentFiber
    }
}

export {
    render,
    scheduleWork,
    createWorkInProgress
}
