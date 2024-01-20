export async function awaitSequential<T>(ps: Promise<T>[]) {
    const results = [];
    for (const p of ps) {
        results.push(await p);
    }
    return results;
}