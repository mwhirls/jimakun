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
            const data: SeekCueMessage = { direction: SeekDirection.enum.Next };
            const message: RuntimeMessage = { event: RuntimeEvent.enum.SeekCue, data: data };
            tabs.sendMessageToActive(message);
            break;
        }
        case Command.RepeatCue: {
            const data: SeekCueMessage = { direction: SeekDirection.enum.Repeat };
            const message: RuntimeMessage = { event: RuntimeEvent.enum.SeekCue, data: data };
            tabs.sendMessageToActive(message);
            break;
        }
        case Command.PrevCue: {
            const data: SeekCueMessage = { direction: SeekDirection.enum.Previous };
            const message: RuntimeMessage = { event: RuntimeEvent.enum.SeekCue, data: data };
            tabs.sendMessageToActive(message);
            break;
        }
        case Command.ToggleSubs: {
            const message: RuntimeMessage = { event: RuntimeEvent.enum.ToggleSubs, data: null };
            tabs.sendMessageToActive(message);
            break;
        }
    }
}

export function registerListeners() {
    chrome.commands.onCommand.addListener(onCommand);
}