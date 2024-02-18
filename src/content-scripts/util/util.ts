export const WEBVTT_FORMAT = 'webvtt-lssdh-ios8';

function querySelector(nodeList: NodeList, selector: string) {
    for (let i = 0; i < nodeList.length; i++) {
        const node = nodeList.item(i);
        if (node instanceof Element) {
            const child = node.querySelector(selector);
            if (child) {
                return child;
            }
        }
    }
    return null;
}

export type ChildMutationType = 'added' | 'removed';

export interface ChildMutation {
    elem: Element;
    type: ChildMutationType;
}

export function querySelectorMutation(mutation: MutationRecord, selector: string): ChildMutation | null {
    if (mutation.addedNodes.length) {
        const elem = querySelector(mutation.addedNodes, selector);
        return elem ? { elem: elem, type: 'added' } : null;
    } else if (mutation.removedNodes.length) {
        const elem = querySelector(mutation.removedNodes, selector);
        return elem ? { elem: elem, type: 'removed' } : null;
    }
    return null;
}