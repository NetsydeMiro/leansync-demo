export function assertNever(val: any): never {
    throw new Error('Unexpected object: ' + val)
}