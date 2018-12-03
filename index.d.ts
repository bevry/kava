type Errback = (error?: Error) => void
type SuiteCallback = (suite: Suite, test: Test, done: Errback) => void
type Suite = (name: string, method: SuiteCallback) => void
type TestCallback = (done: Errback) => void
type Test = (name: string, method: TestCallback) => void

export const suite: Suite
export const test: Test
