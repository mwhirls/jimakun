import React from 'react';
import { Blocked } from '../events';

interface DatabaseBlockedProps {
    dbStatus: Blocked;
}

function DatabaseBlocked({ dbStatus }: DatabaseBlockedProps) {
    return <div>Database blocked!</div> // TODO
}

export default DatabaseBlocked;