const EXPIRATION_TIME = 1
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

}

function workLoop(deadline) {

}

export function render(Vnode, Container, callback) {
    updateQueue.push({
      fromTag: tag.HostRoot,
      stateNode: Container,
      props: { children: Vnode }
    })
  
    window.requestIdleCallback(performWork) //开始干活
}

export function scheduleWork(instance, partialState) {
    updateQueue.push({
        fromTag: tag.ClassComponent,
        stateNode: instance,
        partialState: partialState
    })

    window.requestIdleCallback(performWork)
}
