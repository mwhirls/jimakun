import React from 'react';
import { Blocked } from '../../database/dbstatus';

interface DatabaseBlockedProps {
    dbStatus: Blocked;
}

function DatabaseBlocked({ dbStatus }: DatabaseBlockedProps) {
    return <div>Database blocked!</div> // TODO
}

export default DatabaseBlocked;