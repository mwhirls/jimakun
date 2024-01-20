import React from 'react';
import { ErrorOccurred } from '../events';

interface DatabaseErrorProps {
    dbStatus: ErrorOccurred;
}

function DatabaseError({ dbStatus }: DatabaseErrorProps) {
    return <div>Database error occurred!</div> // TODO
}

export default DatabaseError;