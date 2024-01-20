import React from 'react';
import { ErrorOccurred } from '../../database/dbstatus';

interface DatabaseErrorProps {
    dbStatus: ErrorOccurred;
}

function DatabaseError({ dbStatus }: DatabaseErrorProps) {
    return <div>Database error occurred!</div> // TODO
}

export default DatabaseError;