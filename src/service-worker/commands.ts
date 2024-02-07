import { SeekCueMessage, SeekDirection, RuntimeMessage, RuntimeEvent } from '../common/events';
import * as tabs from './tabs'

enum Command {
    NextCue = 'next-cue',
    PrevCue = 'prev-cue',
    RepeatCue = 'repeat-cue',
    ToggleSubs = 'toggle-subs',
}

function onCommand(command: string) {
    switch (command) {
        case Command.NextCue: {
            const data: SeekCueMessage = { direction: SeekDirection.Next };
            const message: RuntimeMessage = { event: RuntimeEvent.SeekCue, data: data };
            tabs.sendMessageToActive(message);
            break;
        }
        case Command.RepeatCue: {
            const data: SeekCueMessage = { direction: SeekDirection.Repeat };
            const message: RuntimeMessage = { event: RuntimeEvent.SeekCue, data: data };
            tabs.sendMessageToActive(message);
            break;
        }
        case Command.PrevCue: {
            const data: SeekCueMessage = { direction: SeekDirection.Previous };
            const message: RuntimeMessage = { event: RuntimeEvent.SeekCue, data: data };
            tabs.sendMessageToActive(message);
            break;
        }
        case Command.ToggleSubs: {
            const message: RuntimeMessage = { event: RuntimeEvent.ToggleSubs, data: null };
            tabs.sendMessageToActive(message);
            break;
        }
    }
}

export function registerListeners() {
    chrome.commands.onCommand.addListener(onCommand);
}